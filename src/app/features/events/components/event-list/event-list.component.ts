import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EventRecord } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
})
export class EventListComponent implements OnInit {
  events: EventRecord[] = [];
  loading = true;
  canCreate = false;

  constructor(
    private eventService: EventService,
    private permissionService: PermissionService,
    private toast: ToastService
  ) {
    this.canCreate = this.permissionService.canManageEvents();
  }

  async ngOnInit(): Promise<void> {
    await this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.loading = true;
    try {
      this.events = await this.eventService.list();
    } catch {
      this.toast.error('Failed to load events. Ensure API is online.');
    } finally {
      this.loading = false;
    }
  }

  async deleteEvent(event: EventRecord): Promise<void> {
    if (!confirm(`Delete event "${event.title}"?`)) {
      return;
    }
    try {
      await this.eventService.delete(event.id);
      this.toast.success('Event deleted');
      await this.loadEvents();
    } catch {
      this.toast.error('Failed to delete event');
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
