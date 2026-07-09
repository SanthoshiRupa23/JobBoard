import { Component, OnInit } from '@angular/core';
import { JobService, Job } from '../../../../core/services/job.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-employer-dashboard',
  template: `
    <div class="dashboard-container fade-in">
      <div class="header-section mb-4">
        <h1>Employer Dashboard</h1>
        <p class="text-secondary">Manage your job postings and applicants</p>
      </div>

      <div class="actions-bar mb-4">
        <button mat-raised-button color="primary" routerLink="/employer/jobs/new">
          <mat-icon>add</mat-icon>
          Post a New Job
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="jobs-list" *ngIf="!loading && jobs.length > 0">
        <mat-card *ngFor="let job of jobs" class="glass-card mb-3">
          <mat-card-header>
            <mat-card-title>{{ job.title }}</mat-card-title>
            <mat-card-subtitle>{{ job.location }} &bull; {{ job.type.replace('_', ' ') }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="mt-2">
            <div class="stats-row">
              <div class="stat-box">
                <span class="stat-label">Status</span>
                <mat-chip-list>
                  <mat-chip [color]="job.status === 'OPEN' ? 'accent' : 'default'" selected>{{ job.status }}</mat-chip>
                </mat-chip-list>
              </div>
              <div class="stat-box">
                <span class="stat-label">Posted On</span>
                <span class="stat-value">{{ job.createdAt | date:'shortDate' }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-divider></mat-divider>
          
          <mat-card-actions class="actions-row">
            <button mat-button color="primary" [routerLink]="['/employer/jobs', job.id, 'candidates']">
              <mat-icon>people</mat-icon> View Candidates
            </button>
            <span class="spacer"></span>
            <!-- Close job action would go here -->
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-results" *ngIf="!loading && jobs.length === 0">
        <mat-icon class="no-results-icon">work_outline</mat-icon>
        <h3>No jobs posted yet</h3>
        <p class="text-secondary">Create your first job posting to start receiving applications.</p>
      </div>
    </div>
  `,
  styles: [`
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    
    .header-section {
      display: flex;
      flex-direction: column;
    }
    
    .actions-bar {
      display: flex;
      justify-content: flex-end;
    }

    .stats-row {
      display: flex;
      gap: 32px;
      padding: 12px 0;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .stat-value {
      font-weight: 500;
    }

    .actions-row {
      display: flex;
      padding: 8px 16px;
    }

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
export class EmployerDashboardComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;

  constructor(
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user && user.role === 'EMPLOYER') {
      this.loadMyJobs(user.id);
    }
  }

  loadMyJobs(employerId: number): void {
    this.jobService.getMyJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
