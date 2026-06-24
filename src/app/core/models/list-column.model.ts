export interface ListColumn {
  key: string;
  label: string;
  visible: boolean;
  filterable?: boolean;
  exportable?: boolean;
  /** When false, column cannot be hidden in Manage Columns */
  allowHide?: boolean;
}
