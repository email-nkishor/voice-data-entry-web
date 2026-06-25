import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { EventInput, EventType } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
})
export class EventFormComponent implements OnInit {
  eventId: number | null = null;
  saving = false;

  form: EventInput = {
    title: '',
    description: '',
    eventType: 'academic',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    location: '',
    status: 'draft',
  };

  eventTypes: EventType[] = ['academic', 'sports', 'cultural', 'other'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = Number(id);
      try {
        const event = await this.eventService.getById(this.eventId);
        this.form = {
          title: event.title,
          description: event.description ?? '',
          eventType: event.eventType,
          startDate: event.startDate.slice(0, 10),
          endDate: event.endDate?.slice(0, 10) ?? '',
          location: event.location ?? '',
          status: event.status,
          groupId: event.groupId ?? undefined,
        };
      } catch {
        this.toast.error('Event not found');
        this.router.navigate(['/events']);
      }
    }
  }

  async save(): Promise<void> {
    if (!this.form.title.trim() || !this.form.startDate) {
      this.toast.error('Title and start date are required');
      return;
    }
    this.saving = true;
    try {
      if (this.eventId) {
        await this.eventService.update(this.eventId, this.form);
        this.toast.success('Event updated');
      } else {
        await this.eventService.create(this.form);
        this.toast.success('Event created');
      }
      this.router.navigate(['/events']);
    } catch {
      this.toast.error('Failed to save event');
    } finally {
      this.saving = false;
    }
  }
}
