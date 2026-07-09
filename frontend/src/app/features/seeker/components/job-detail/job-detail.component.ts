import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService, Job } from '../../../../core/services/job.service';
import { ApplicationService, JobApplication } from '../../../../core/services/application.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-job-detail',
  template: `
    <div class="job-detail-container fade-in" *ngIf="job">
      <button mat-icon-button class="back-btn mb-3" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
      </button>

      <div class="main-content">
        <!-- Main Job Info -->
        <mat-card class="glass-card main-card mb-4">
          <mat-card-header>
            <div mat-card-avatar class="company-logo-lg">
              <mat-icon>business</mat-icon>
            </div>
            <mat-card-title class="job-title">{{ job.title }}</mat-card-title>
            <mat-card-subtitle class="company-name">{{ job.companyName }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="mt-4">
            <div class="meta-tags mb-4">
              <div class="meta-tag">
                <mat-icon>location_on</mat-icon>
                <span>{{ job.location }}</span>
              </div>
              <div class="meta-tag">
                <mat-icon>work</mat-icon>
                <span>{{ job.type.replace('_', ' ') }}</span>
              </div>
              <div class="meta-tag" *ngIf="job.salaryRange">
                <mat-icon>payments</mat-icon>
                <span>{{ job.salaryRange }}</span>
              </div>
              <div class="meta-tag">
                <mat-icon>schedule</mat-icon>
                <span>Posted {{ job.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>
            
            <div class="description-section mt-4">
              <h3>Job Description</h3>
              <p class="description-text">{{ job.description }}</p>
            </div>

            <div class="requirements-section mt-4" *ngIf="job.requirements">
              <h3>Requirements</h3>
              <p class="description-text">{{ job.requirements }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Apply Sidebar -->
      <div class="sidebar">
        <mat-card class="glass-card apply-card sticky-sidebar">
          <mat-card-content class="text-center">
            <h3>Interested in this job?</h3>
            <p class="text-secondary mb-4">Submit your application to {{ job.companyName }} directly through our platform.</p>
            
            <ng-container *ngIf="!hasApplied; else appliedTemplate">
              <button mat-raised-button color="primary" class="w-100 apply-btn" (click)="applyForJob()" [disabled]="applying">
                <mat-icon *ngIf="!applying">send</mat-icon>
                <span *ngIf="!applying">Apply Now</span>
                <mat-spinner diameter="20" *ngIf="applying" color="accent"></mat-spinner>
              </button>
            </ng-container>

            <ng-template #appliedTemplate>
              <div class="applied-badge">
                <mat-icon color="primary">check_circle</mat-icon>
                <span>You have applied for this job</span>
              </div>
            </ng-template>

          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div class="loading-container" *ngIf="loading">
      <mat-spinner diameter="40"></mat-spinner>
    </div>
  `,
  styles: [`
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .w-100 { width: 100%; }
    .text-center { text-align: center; }

    .job-detail-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      padding-bottom: 40px;
    }
    
    @media (max-width: 768px) {
      .job-detail-container {
        grid-template-columns: 1fr;
      }
    }

    .company-logo-lg {
      background-color: var(--primary-color-dark);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      height: 56px;
      width: 56px;
      transform: scale(1.2);
      margin-right: 16px;
    }

    .job-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .company-name {
      font-size: 16px;
      color: var(--primary-color);
    }

    .meta-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .meta-tag {
      display: flex;
      align-items: center;
      color: var(--text-secondary);
      background: rgba(0,0,0,0.03);
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 14px;
    }
    
    .meta-tag mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      margin-right: 6px;
    }

    .description-text {
      white-space: pre-wrap;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .apply-card {
      padding: 24px;
    }

    .sticky-sidebar {
      position: sticky;
      top: 100px;
    }

    .apply-btn {
      padding: 8px 0;
      font-size: 16px;
    }

    .apply-btn mat-icon {
      margin-right: 8px;
    }

    .applied-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 8px;
      color: var(--primary-color);
      font-weight: 500;
    }

    .applied-badge mat-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
      margin-bottom: 8px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job!: Job;
  loading = true;
  applying = false;
  hasApplied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJob(parseInt(jobId, 10));
    }
  }

  loadJob(id: number): void {
    this.jobService.getJobById(id).subscribe({
      next: (data) => {
        this.job = data;
        this.checkIfApplied(id);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load job details', 'Close', { duration: 3000 });
        this.router.navigate(['/jobs']);
      }
    });
  }

  checkIfApplied(jobId: number): void {
    const user = this.authService.currentUserValue;
    if (user && user.role === 'SEEKER') {
      this.applicationService.getApplicationsBySeeker(user.id).subscribe({
        next: (apps) => {
          this.hasApplied = apps.some(a => a.jobId === jobId);
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  applyForJob(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (user.role !== 'SEEKER') {
      this.snackBar.open('Only Job Seekers can apply for jobs.', 'Close', { duration: 3000 });
      return;
    }

    this.applying = true;
    
    // Simplistic application with dummy resumeUrl for now
    // In a real flow, we might open a modal to upload a resume or select one
    const application: JobApplication = {
      jobId: this.job.id!,
      seekerId: user.id,
      status: 'APPLIED'
    };

    this.applicationService.applyForJob(application).subscribe({
      next: () => {
        this.hasApplied = true;
        this.applying = false;
        this.snackBar.open('Successfully applied for the job!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.applying = false;
        this.snackBar.open('Failed to submit application', 'Close', { duration: 3000 });
      }
    });
  }
}
