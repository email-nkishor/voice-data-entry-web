import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LookupOption, LookupService } from '../../../../core/services/lookup.service';
import { ListColumn } from '../../../../core/models/list-column.model';
import { ToastService } from '../../../../core/services/toast.service';
import { exportToExcelFile } from '../../../../core/utils/excel-export.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  deriveStudentStatus,
  formatStudentCode,
  STUDENT_STATUS_COLORS,
  STUDENT_STATUS_LABELS,
  Student,
} from '../../models/student.model';
import { StudentActivityService } from '../../services/student-activity.service';
import { StudentService } from '../../services/student.service';
import {
  mergeStudentListColumns,
  STUDENT_LIST_COLUMNS,
} from '../../config/student-list-columns';

type ViewMode = 'table' | 'card';

interface SavedSearchCriteria {
  id: string;
  name: string;
  filters: Record<string, string>;
}

const COLUMN_STORAGE_KEY = 'student-list-columns-v2';
const VIEW_STORAGE_KEY = 'student-list-view-mode';
const CRITERIA_STORAGE_KEY = 'student-list-saved-criteria';

const DEFAULT_COLUMNS: ListColumn[] = STUDENT_LIST_COLUMNS;

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent, ConfirmationDialogComponent],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  searchTerm = '';
  viewMode: ViewMode = 'table';
  showFilterPopup = false;
  showManageColumns = false;
  showDeleteDialog = false;
  selectedStudentId: number | null = null;
  selectedIds = new Set<number>();

  columns: ListColumn[] = [...DEFAULT_COLUMNS];
  columnFilters: Record<string, string> = {};
  draftColumnFilters: Record<string, string> = {};
  savedCriteria: SavedSearchCriteria[] = [];

  pageIndex = 0;
  pageSize = 20;
  readonly pageSizes = [10, 20, 50, 100];
  groupId: number | 'all' = 'all';

  constructor(
    private studentService: StudentService,
    private toastService: ToastService,
    private authService: AuthService,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const groupParam = this.route.snapshot.queryParamMap.get('groupId');
    if (groupParam) {
      const parsed = Number(groupParam);
      if (!Number.isNaN(parsed)) {
        this.groupId = parsed;
      }
    }
    this.restorePreferences();
    this.loadSavedCriteria();
    await this.lookupService.loadLookups();
    await this.loadStudents();
  }

  get canDelete(): boolean {
    return this.authService.hasRole('admin', 'admission_clerk');
  }

  get visibleColumns(): ListColumn[] {
    return this.columns.filter((column) => column.visible);
  }

  get filterableColumns(): ListColumn[] {
    return this.columns.filter((column) => column.filterable);
  }

  get exportableColumns(): ListColumn[] {
    return this.columns.filter((column) => column.visible && column.exportable);
  }

  get filteredStudents(): Student[] {
    return this.students.filter((student) => this.matchesFilters(student));
  }

  get paginatedStudents(): Student[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
  }

  get pageStart(): number {
    if (this.filteredStudents.length === 0) {
      return 0;
    }
    return this.pageIndex * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.filteredStudents.length);
  }

  get allPageSelected(): boolean {
    const pageIds = this.paginatedStudents
      .map((student) => student.id)
      .filter((id): id is number => id != null);
    return pageIds.length > 0 && pageIds.every((id) => this.selectedIds.has(id));
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm.trim() ||
      Object.values(this.columnFilters).some((value) => value.trim())
    );
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showManageColumns = false;
    this.showFilterPopup = false;
  }

  async loadStudents(): Promise<void> {
    if (this.searchTerm.trim()) {
      this.students = await this.studentService.search(this.searchTerm, this.groupId);
    } else {
      this.students = await this.studentService.getByGroup(this.groupId);
    }
    this.pageIndex = 0;
  }

  async onQuickSearch(term: string): Promise<void> {
    this.searchTerm = term;
    await this.loadStudents();
  }

  onInlineFilterChange(): void {
    this.pageIndex = 0;
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }

  openFilterPopup(): void {
    this.draftColumnFilters = {};
    for (const column of this.filterableColumns) {
      this.draftColumnFilters[column.key] = this.columnFilters[column.key] ?? '';
    }
    this.showFilterPopup = true;
    this.showManageColumns = false;
  }

  closeFilterPopup(): void {
    this.showFilterPopup = false;
  }

  applyFilters(): void {
    this.columnFilters = { ...this.draftColumnFilters };
    this.pageIndex = 0;
    this.showFilterPopup = false;
  }

  resetFilterDraft(): void {
    this.draftColumnFilters = {};
    this.columnFilters = {};
    this.pageIndex = 0;
  }

  saveSearchCriteria(): void {
    const hasValues = Object.values(this.draftColumnFilters).some((value) => value.trim());
    if (!hasValues) {
      this.toastService.error('Enter at least one filter value to save');
      return;
    }

    const criteria: SavedSearchCriteria = {
      id: `criteria-${Date.now()}`,
      name: this.buildCriteriaName(this.draftColumnFilters),
      filters: { ...this.draftColumnFilters },
    };
    this.savedCriteria = [criteria, ...this.savedCriteria];
    this.persistCriteria();
    this.toastService.success('Search criteria saved');
  }

  applyCriteria(criteria: SavedSearchCriteria): void {
    this.draftColumnFilters = { ...criteria.filters };
    this.columnFilters = { ...criteria.filters };
    this.pageIndex = 0;
    this.showFilterPopup = false;
  }

  removeCriteria(id: string): void {
    this.savedCriteria = this.savedCriteria.filter((item) => item.id !== id);
    this.persistCriteria();
  }

  openManageColumns(): void {
    this.showManageColumns = true;
    this.showFilterPopup = false;
  }

  closeManageColumns(): void {
    this.showManageColumns = false;
  }

  onColumnVisibilityChange(column: ListColumn): void {
    if (column.allowHide === false && !column.visible) {
      column.visible = true;
      this.toastService.error(`${column.label} cannot be hidden`);
      return;
    }

    const visibleCount = this.columns.filter((item) => item.visible).length;
    if (!column.visible && visibleCount === 0) {
      column.visible = true;
      this.toastService.error('At least one column must be visible');
      return;
    }
    this.persistColumns();
  }

  canHideColumn(column: ListColumn): boolean {
    return column.allowHide !== false;
  }

  async clearAllFilters(): Promise<void> {
    this.columnFilters = {};
    this.draftColumnFilters = {};
    this.searchTerm = '';
    this.pageIndex = 0;
    await this.loadStudents();
  }

  onExportExcel(): void {
    const rows = this.filteredStudents.map((student) => {
      const row: Record<string, string> = {};
      for (const column of this.exportableColumns) {
        row[column.key] = this.getCellValue(student, column.key);
      }
      return row;
    });

    if (rows.length === 0) {
      this.toastService.error('No data to export');
      return;
    }

    exportToExcelFile(
      rows,
      this.exportableColumns.map((column) => ({
        key: column.key,
        label: column.label,
      })),
      `students-${new Date().toISOString().split('T')[0]}.csv`
    );
    this.toastService.success('Exported successfully');
  }

  getCellValue(student: Student, key: string): string {
    if (key === 'createdDate') {
      return this.formatDate(student.createdDate);
    }
    if (key === 'status') {
      const status = deriveStudentStatus(student);
      return this.lookupService.getLabel('status', status) || STUDENT_STATUS_LABELS[status] || status;
    }
    if (key === 'feeStatus') {
      const feeStatus = student.feeStatus ?? '';
      return this.lookupService.getLabel('feeStatus', feeStatus) || feeStatus;
    }
    if (key === 'section') {
      const grade = student.section ?? '';
      return this.lookupService.getLabel('grade', grade) || grade;
    }
    if (key === 'class') {
      const classValue = student.class ?? '';
      return this.lookupService.getLabel('class', classValue) || classValue;
    }
    return String((student as unknown as Record<string, string>)[key] ?? '');
  }

  isSelectFilter(column: ListColumn): boolean {
    return column.filterType === 'select' && !!column.lookupKey;
  }

  getFilterOptions(column: ListColumn): LookupOption[] {
    if (!column.lookupKey) {
      return [];
    }
    return this.lookupService.getOptions(column.lookupKey);
  }

  onAdd(): void {
    this.router.navigate(['/student/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/student/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/student/edit', id]);
  }

  onDeleteRequest(id: number): void {
    this.selectedStudentId = id;
    this.showDeleteDialog = true;
  }

  async onDeleteConfirmed(): Promise<void> {
    if (this.selectedStudentId !== null) {
      const id = this.selectedStudentId;
      await this.studentService.delete(id);
      this.selectedIds.delete(id);
      this.showDeleteDialog = false;
      this.selectedStudentId = null;
      await this.loadStudents();
      this.toastService.success('Student deleted');
    }
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog = false;
    this.selectedStudentId = null;
  }

  toggleSelectAll(checked: boolean): void {
    for (const student of this.paginatedStudents) {
      if (student.id == null) {
        continue;
      }
      if (checked) {
        this.selectedIds.add(student.id);
      } else {
        this.selectedIds.delete(student.id);
      }
    }
  }

  toggleSelect(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.pageIndex = 0;
  }

  goToPage(page: number): void {
    this.pageIndex = Math.min(Math.max(page, 0), this.totalPages - 1);
  }

  private matchesFilters(student: Student): boolean {
    for (const column of this.columns) {
      const filter = (this.columnFilters[column.key] ?? '').trim();
      if (!filter) {
        continue;
      }

      const rawValue =
        column.key === 'status'
          ? deriveStudentStatus(student)
          : String((student as unknown as Record<string, string>)[column.key] ?? '');
      const displayValue = this.getCellValue(student, column.key);

      if (column.filterType === 'select') {
        const matchesValue =
          rawValue.toLowerCase() === filter.toLowerCase() ||
          displayValue.toLowerCase() === filter.toLowerCase();
        if (!matchesValue) {
          return false;
        }
        continue;
      }

      if (!displayValue.toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  private formatDate(value: string): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString();
  }

  private restorePreferences(): void {
    const savedView = localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode | null;
    if (savedView === 'table' || savedView === 'card') {
      this.viewMode = savedView;
    }

    const savedColumns = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!savedColumns) {
      this.columns = mergeStudentListColumns(null);
      return;
    }

    try {
      const parsed = JSON.parse(savedColumns) as ListColumn[] | Record<string, boolean>;
      if (Array.isArray(parsed)) {
        this.columns = mergeStudentListColumns(parsed);
        return;
      }

      this.columns = mergeStudentListColumns(null);
      const visibility = parsed as Record<string, boolean>;
      for (const column of this.columns) {
        if (Object.prototype.hasOwnProperty.call(visibility, column.key)) {
          column.visible = column.allowHide === false ? true : visibility[column.key];
        }
      }
    } catch {
      this.columns = mergeStudentListColumns(null);
    }
  }

  private persistColumns(): void {
    const visibility: Record<string, boolean> = {};
    for (const column of this.columns) {
      visibility[column.key] = column.visible;
    }
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibility));
  }

  private loadSavedCriteria(): void {
    const saved = localStorage.getItem(CRITERIA_STORAGE_KEY);
    if (!saved) {
      this.savedCriteria = [
        { id: 'default-1', name: 'Active Students', filters: { class: '10' } },
        { id: 'default-2', name: 'Recent Entries', filters: {} },
      ];
      return;
    }

    try {
      this.savedCriteria = JSON.parse(saved) as SavedSearchCriteria[];
    } catch {
      this.savedCriteria = [];
    }
  }

  private persistCriteria(): void {
    localStorage.setItem(CRITERIA_STORAGE_KEY, JSON.stringify(this.savedCriteria));
  }

  private buildCriteriaName(filters: Record<string, string>): string {
    const parts = this.filterableColumns
      .map((column) => {
        const value = (filters[column.key] ?? '').trim();
        return value ? `${column.label}: ${value}` : '';
      })
      .filter(Boolean);

    return parts.length ? parts.slice(0, 2).join(', ') : 'Saved Search';
  }
}
