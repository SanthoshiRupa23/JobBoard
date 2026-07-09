import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications-container fade-in">
      <div class="header-section mb-4">
        <h1>Notifications</h1>
        <p class="text-secondary">Stay updated with your job applications and candidates</p>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="actions-bar mb-3" *ngIf="!loading && notifications.length > 0">
        <span class="spacer"></span>
        <button mat-button color="primary" (click)="markAllAsRead()">Mark all as read</button>
      </div>

      <div class="notifications-list" *ngIf="!loading && notifications.length > 0">
        <mat-card *ngFor="let notif of notifications" 
                  class="glass-card notif-card mb-2" 
                  [ngClass]="{'unread': !notif.read}">
          
          <mat-card-header>
            <div mat-card-avatar class="notif-avatar" [ngClass]="getIconClass(notif.type || '')">
              <mat-icon>{{ getIcon(notif.type || '') }}</mat-icon>
            </div>
            <mat-card-title>{{ notif.message }}</mat-card-title>
            <mat-card-subtitle>{{ notif.createdAt | date:'short' }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-actions align="end" *ngIf="!notif.read">
            <button mat-icon-button color="accent" (click)="markAsRead(notif)" matTooltip="Mark as read">
              <mat-icon>check_circle_outline</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-results" *ngIf="!loading && notifications.length === 0">
        <mat-icon class="no-results-icon">notifications_none</mat-icon>
        <h3>No new notifications</h3>
        <p class="text-secondary">You're all caught up!</p>
      </div>
    </div>
  `,
  styles: [`
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    
    .notifications-container {
      max-width: 700px;
      margin: 0 auto;
      padding-bottom: 40px;
    }

    .actions-bar {
      display: flex;
    }
    
    .notif-card {
      padding: 8px 16px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .notif-card mat-card-header {
      flex: 1;
    }

    .notif-card.unread {
      border-left: 4px solid var(--primary-color);
      background: rgba(99, 102, 241, 0.05); /* very light primary color */
    }

    .notif-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
    }

    .bg-primary { background-color: var(--primary-color); }
    .bg-accent { background-color: var(--secondary-color); }
    .bg-success { background-color: #10b981; }
    .bg-info { background-color: #3b82f6; }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--glass-bg);
      border-radius: 16px;
      border: 1px dashed var(--glass-border);
    }
    .no-results-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: var(--text-secondary);
      opacity: 0.5;
      margin-bottom: 1rem;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.loadNotifications(user.id);
    }
  }

  loadNotifications(userId: number): void {
    this.notificationService.getNotifications(userId).subscribe({
      next: (data) => {
        // Sort to show unread first, then by date descending
        this.notifications = data.sort((a, b) => {
          if (a.read === b.read) {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          }
          return !a.read ? -1 : 1;
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(notif: Notification): void {
    if (notif.id) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          notif.read = true;
        }
      });
    }
  }

  markAllAsRead(): void {
    const unread = this.notifications.filter(n => !n.read);
    unread.forEach(n => this.markAsRead(n));
  }

  getIcon(type: string): string {
    switch(type) {
      case 'APPLICATION_STATUS_UPDATE': return 'update';
      case 'NEW_APPLICATION': return 'person_add';
      default: return 'notifications';
    }
  }

  getIconClass(type: string): string {
    switch(type) {
      case 'APPLICATION_STATUS_UPDATE': return 'bg-info';
      case 'NEW_APPLICATION': return 'bg-success';
      default: return 'bg-primary';
    }
  }
}
