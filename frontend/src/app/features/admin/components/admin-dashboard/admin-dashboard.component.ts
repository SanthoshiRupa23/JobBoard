import { Component, OnInit } from '@angular/core';
import { JobService, Job } from '../../../../core/services/job.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-container fade-in">
      <div class="header-section mb-4">
        <h1>Admin Dashboard</h1>
        <p class="text-secondary">System overview and moderation</p>
      </div>

      <!-- Stats row -->
      <div class="stats-grid mb-4">
        <mat-card class="glass-card stat-card">
          <mat-card-header>
            <mat-icon class="stat-icon" color="primary">work</mat-icon>
            <mat-card-title>{{ jobs.length }}</mat-card-title>
            <mat-card-subtitle>Total Jobs</mat-card-subtitle>
          </mat-card-header>
        </mat-card>
        <!-- In a real app we would have stats for Users and Applications here -->
      </div>

      <!-- Moderation Section -->
      <h2>Job Moderation</h2>
      
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="jobs-list" *ngIf="!loading && jobs.length > 0">
        <mat-card *ngFor="let job of jobs" class="glass-card mb-3">
          <mat-card-header>
            <mat-card-title>{{ job.title }}</mat-card-title>
            <mat-card-subtitle>{{ job.companyName }} &bull; Posted: {{ job.createdAt | date:'shortDate' }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-actions class="actions-row">
            <span class="spacer"></span>
            <button mat-button color="primary" [routerLink]="['/jobs', job.id]">View Listing</button>
            <button mat-raised-button color="warn" (click)="deleteJob(job.id!)">Delete Job</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 24px;
    }

    .stat-card {
      padding: 16px;
    }

    .stat-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      margin-right: 16px;
      opacity: 0.8;
    }

    .actions-row {
      display: flex;
      padding: 8px 16px;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;

  constructor(
    private jobService: JobService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job posting?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.snackBar.open('Job deleted successfully', 'Close', { duration: 3000 });
          this.loadJobs();
        },
        error: () => {
          this.snackBar.open('Failed to delete job', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
