export interface InventoryItem {
  id?: number;
  itemName: string;
  quantity: number;
  purchaseDate: string;
  syncStatus?: 'pending' | 'synced';
}
