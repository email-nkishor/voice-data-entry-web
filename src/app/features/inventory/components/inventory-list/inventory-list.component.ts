import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { InventoryItem } from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent],
  template: `
    <div class="page">
      <app-module-action-header title="Inventory" backLink="/dashboard" />
      <div class="toolbar"><a routerLink="/inventory/add" class="btn btn-primary">+ Add Item</a></div>
      <div class="list">
        @for (item of items; track item.id) {
          <article class="card list-item">
            <h3>{{ item.itemName }}</h3>
            <p>Quantity: {{ item.quantity }}</p>
            <p>Purchase Date: {{ item.purchaseDate }}</p>
          </article>
        } @empty { <p class="empty">No inventory items.</p> }
      </div>
    </div>
  `,
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  constructor(private inventoryService: InventoryService) {}
  async ngOnInit(): Promise<void> { this.items = await this.inventoryService.getAll(); }
}
