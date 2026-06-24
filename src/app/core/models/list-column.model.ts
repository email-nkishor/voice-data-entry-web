export interface ListColumn {
  key: string;
  label: string;
  visible: boolean;
  filterable?: boolean;
  exportable?: boolean;
  /** When false, column cannot be hidden in Manage Columns */
  allowHide?: boolean;
  /** Use select dropdown in filters instead of text input */
  filterType?: 'text' | 'select';
  /** Backend lookup category when filterType is select */
  lookupKey?: string;
}
