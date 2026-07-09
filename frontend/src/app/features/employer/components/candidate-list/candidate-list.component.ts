import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService, JobApplication } from '../../../../core/services/application.service';
import { JobService, Job } from '../../../../core/services/job.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-candidate-list',
  template: `
    <div class="candidates-container fade-in">
      <div class="header-section mb-4">
        <button mat-icon-button (click)="goBack()" class="mb-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Candidates</h1>
        <p class="text-secondary" *ngIf="job">Reviewing applicants for: <strong>{{ job.title }}</strong></p>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="candidates-list" *ngIf="!loading && applications.length > 0">
        <mat-card *ngFor="let app of applications" class="glass-card candidate-card mb-3">
          <mat-card-header>
            <div mat-card-avatar class="seeker-avatar">
              <mat-icon>person</mat-icon>
            </div>
            <mat-card-title>{{ app.seekerName || 'Candidate #' + app.seekerId }}</mat-card-title>
            <mat-card-subtitle>{{ app.seekerHeadline || 'Applied: ' + (app.appliedAt | date:'mediumDate') }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="mt-3">
            <div class="candidate-details">
              <div class="detail-item">
                <span class="label">Status:</span>
                <mat-chip-list>
                  <mat-chip [ngClass]="getStatusClass(app.status)" selected>{{ app.status }}</mat-chip>
                </mat-chip-list>
              </div>
              <div class="detail-item full-width" *ngIf="app.seekerSkills">
                <span class="label">Skills:</span>
                <span class="value">{{ app.seekerSkills }}</span>
              </div>
              <div class="detail-item full-width" *ngIf="app.seekerExperience">
                <span class="label">Experience:</span>
                <span class="value description-text">{{ app.seekerExperience }}</span>
              </div>
              <div class="detail-item full-width" *ngIf="app.seekerEducation">
                <span class="label">Education:</span>
                <span class="value description-text">{{ app.seekerEducation }}</span>
              </div>
              <div class="detail-item full-width" *ngIf="app.coverLetter">
                <span class="label">Cover Letter:</span>
                <span class="value description-text">{{ app.coverLetter }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-divider></mat-divider>

          <mat-card-actions class="actions-row">
            <span class="spacer"></span>
            <button mat-button color="warn" *ngIf="app.status !== 'REJECTED' && app.status !== 'ACCEPTED'" (click)="updateStatus(app, 'REJECTED')">
              Reject
            </button>
            <button mat-button color="primary" *ngIf="app.status === 'APPLIED'" (click)="updateStatus(app, 'SHORTLISTED')">
              Shortlist
            </button>
            <button mat-button color="accent" *ngIf="app.status === 'SHORTLISTED'" (click)="updateStatus(app, 'INTERVIEW')">
              Schedule Interview
            </button>
            <button mat-raised-button color="primary" *ngIf="app.status === 'INTERVIEW'" (click)="updateStatus(app, 'ACCEPTED')">
              Accept Candidate
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-results" *ngIf="!loading && applications.length === 0">
        <mat-icon class="no-results-icon">people_outline</mat-icon>
        <h3>No candidates yet</h3>
        <p class="text-secondary">When job seekers apply to this position, they will appear here.</p>
      </div>
    </div>
  `,
  styles: [`
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
    
    .candidate-card {
      padding: 16px;
    }

    .seeker-avatar {
      background-color: var(--secondary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .candidate-details {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      padding: 8px 0;
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
      margin-bottom: 8px;
    }

    .value {
      font-weight: 500;
      display: flex;
      align-items: center;
    }
    
    .link {
      color: var(--primary-color);
      cursor: pointer;
    }

    .sm-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      margin-right: 4px;
    }

    .full-width {
      flex: 1 1 100%;
    }

    .description-text {
      white-space: pre-wrap;
      line-height: 1.5;
      font-weight: 400;
    }

    .status-applied { background-color: #64748b !important; color: white !important; }
    .status-shortlisted { background-color: #3b82f6 !important; color: white !important; }
    .status-interview { background-color: #8b5cf6 !important; color: white !important; }
    .status-accepted { background-color: #10b981 !important; color: white !important; }
    .status-rejected { background-color: #ef4444 !important; color: white !important; }

    .actions-row {
      display: flex;
      padding: 16px 16px 8px;
      gap: 8px;
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
export class CandidateListComponent implements OnInit {
  jobId!: number;
  job!: Job;
  applications: JobApplication[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobId = parseInt(id, 10);
      this.loadData();
    }
  }

  loadData(): void {
    // Load job details first
    this.jobService.getJobById(this.jobId).subscribe({
      next: (job) => {
        this.job = job;
        // Then load applications
        this.applicationService.getApplicationsByJob(this.jobId).subscribe({
          next: (apps) => {
            this.applications = apps;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load job details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employer/dashboard']);
  }

  updateStatus(app: JobApplication, newStatus: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED'): void {
    if (!app.id) return;
    this.applicationService.updateApplicationStatus(app.id, newStatus).subscribe({
      next: () => {
        app.status = newStatus;
        this.snackBar.open(`Status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'APPLIED': return 'status-applied';
      case 'SHORTLISTED': return 'status-shortlisted';
      case 'INTERVIEW': return 'status-interview';
      case 'ACCEPTED': return 'status-accepted';
      case 'REJECTED': return 'status-rejected';
      default: return 'bg-secondary';
    }
  }
}
