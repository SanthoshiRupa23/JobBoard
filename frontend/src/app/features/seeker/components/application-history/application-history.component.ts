import { Component, OnInit } from '@angular/core';
import { ApplicationService, JobApplication } from '../../../../core/services/application.service';
import { AuthService } from '../../../../core/services/auth.service';
import { JobService, Job } from '../../../../core/services/job.service';

interface ApplicationWithJob extends JobApplication {
  job?: Job;
}

@Component({
  selector: 'app-application-history',
  template: `
    <div class="application-history-container fade-in">
      <div class="header-section mb-4">
        <h1>My Applications</h1>
        <p class="text-secondary">Track the status of your job applications</p>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="applications-list" *ngIf="!loading && applications.length > 0">
        <mat-card *ngFor="let app of applications" class="glass-card application-card mb-3">
          <mat-card-header>
            <div mat-card-avatar class="company-logo">
              <mat-icon>business</mat-icon>
            </div>
            <mat-card-title>{{ app.job?.title || 'Unknown Job' }}</mat-card-title>
            <mat-card-subtitle>{{ app.job?.companyName || 'Unknown Company' }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="mt-3">
            <div class="app-details">
              <div class="detail-item">
                <span class="label">Applied On:</span>
                <span class="value">{{ app.appliedAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions align="end">
            <mat-chip-list aria-label="Application Status">
              <mat-chip [ngClass]="getStatusClass(app.status)" selected>{{ app.status }}</mat-chip>
            </mat-chip-list>
            <span class="spacer"></span>
            <button mat-button color="primary" [routerLink]="['/jobs', app.jobId]">View Job</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- No Results State -->
      <div class="no-results" *ngIf="!loading && applications.length === 0">
        <mat-icon class="no-results-icon">assignment</mat-icon>
        <h3>No applications yet</h3>
        <p class="text-secondary">You haven't applied to any jobs yet.</p>
        <button mat-raised-button color="primary" routerLink="/jobs" class="mt-3">Find Jobs</button>
      </div>
    </div>
  `,
  styles: [`
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
    
    .application-card {
      padding: 16px;
      transition: transform 0.2s ease;
    }
    
    .application-card:hover {
      transform: translateX(5px);
      border-left: 4px solid var(--primary-color);
    }

    .company-logo {
      background-color: var(--primary-color-dark);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    .app-details {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      background: rgba(0,0,0,0.02);
      padding: 12px 16px;
      border-radius: 8px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .value {
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .sm-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      margin-right: 4px;
      color: var(--text-secondary);
    }

    .status-applied { background-color: #64748b !important; color: white !important; }
    .status-shortlisted { background-color: #3b82f6 !important; color: white !important; }
    .status-interview { background-color: #8b5cf6 !important; color: white !important; }
    .status-accepted { background-color: #10b981 !important; color: white !important; }
    .status-rejected { background-color: #ef4444 !important; color: white !important; }

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
export class ApplicationHistoryComponent implements OnInit {
  applications: ApplicationWithJob[] = [];
  loading = true;

  constructor(
    private applicationService: ApplicationService,
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user && user.role === 'SEEKER') {
      this.loadApplications(user.id);
    }
  }

  loadApplications(seekerId: number): void {
    this.applicationService.getApplicationsBySeeker(seekerId).subscribe({
      next: (apps) => {
        this.applications = apps;
        
        // Fetch job details for each application
        let loadedCount = 0;
        if (apps.length === 0) {
          this.loading = false;
        }

        apps.forEach((app, index) => {
          this.jobService.getJobById(app.jobId).subscribe({
            next: (job) => {
              this.applications[index].job = job;
              loadedCount++;
              if (loadedCount === apps.length) this.loading = false;
            },
            error: () => {
              loadedCount++;
              if (loadedCount === apps.length) this.loading = false;
            }
          });
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'APPLIED': return 'status-applied';
      case 'SHORTLISTED': return 'status-shortlisted';
      case 'INTERVIEW': return 'status-interview';
      case 'ACCEPTED': return 'status-accepted';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }
}
