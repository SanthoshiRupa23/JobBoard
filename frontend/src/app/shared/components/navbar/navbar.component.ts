import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  template: `
    <mat-toolbar color="primary" class="glass-card navbar">
      <span class="logo" routerLink="/">🚀 JobBoard</span>
      
      <span class="spacer"></span>

      <!-- Navigation links depending on role -->
      <ng-container *ngIf="currentUser">
        
        <ng-container *ngIf="currentUser.role === 'SEEKER'">
          <a mat-button routerLink="/jobs">Find Jobs</a>
          <a mat-button routerLink="/jobs/applications">My Applications</a>
        </ng-container>

        <ng-container *ngIf="currentUser.role === 'EMPLOYER'">
          <a mat-button routerLink="/employer/dashboard">Dashboard</a>
          <a mat-button routerLink="/employer/jobs/new">Post a Job</a>
        </ng-container>

        <ng-container *ngIf="currentUser.role === 'ADMIN'">
          <a mat-button routerLink="/admin/dashboard">Admin Dashboard</a>
        </ng-container>

        <button mat-icon-button routerLink="/notifications" class="mr-2" matTooltip="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>

        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="user-info px-3 py-2">
            <strong>{{ currentUser.fullName }}</strong>
            <small class="text-muted d-block">{{ currentUser.email }}</small>
          </div>
          <mat-divider></mat-divider>
          <a mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </a>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>

      <ng-container *ngIf="!currentUser">
        <a mat-button routerLink="/auth/login">Login</a>
        <a mat-raised-button color="accent" routerLink="/auth/register">Sign Up</a>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      margin-bottom: 2rem;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-radius: 0 0 16px 16px;
      border-top: none;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .logo {
      cursor: pointer;
      font-weight: 700;
      font-size: 1.25rem;
    }
    .user-info {
      padding: 8px 16px;
      outline: none;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
