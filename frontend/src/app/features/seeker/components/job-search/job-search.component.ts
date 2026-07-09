import { Component, OnInit } from '@angular/core';
import { JobService, Job } from '../../../../core/services/job.service';

@Component({
  selector: 'app-job-search',
  template: `
    <div class="job-search-container fade-in">
      
      <!-- Search and Filter Header -->
      <mat-card class="glass-card search-card mb-4">
        <mat-card-content>
          <div class="search-filters">
            <mat-form-field appearance="outline" class="search-input">
              <mat-label>Search Jobs</mat-label>
              <input matInput [(ngModel)]="filters.search" (keyup.enter)="loadJobs()" placeholder="Job title, keywords, or company">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-input">
              <mat-label>Location</mat-label>
              <input matInput [(ngModel)]="filters.location" (keyup.enter)="loadJobs()" placeholder="City, state, or remote">
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-input">
              <mat-label>Job Type</mat-label>
              <mat-select [(ngModel)]="filters.type" (selectionChange)="loadJobs()">
                <mat-option value="">Any Type</mat-option>
                <mat-option value="FULL_TIME">Full Time</mat-option>
                <mat-option value="PART_TIME">Part Time</mat-option>
                <mat-option value="CONTRACT">Contract</mat-option>
                <mat-option value="REMOTE">Remote</mat-option>
                <mat-option value="INTERNSHIP">Internship</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-flat-button color="primary" class="search-btn" (click)="loadJobs()">
              Search
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Results Info -->
      <div class="results-header" *ngIf="!loading && jobs.length > 0">
        <h2>Recommended Jobs <span class="badge">{{ jobs.length }}</span></h2>
      </div>

      <!-- Job List -->
      <div class="jobs-grid" *ngIf="!loading">
        <mat-card *ngFor="let job of jobs" class="glass-card job-card" [routerLink]="['/jobs', job.id]">
          <mat-card-header>
            <div mat-card-avatar class="company-logo">
              <mat-icon>business</mat-icon>
            </div>
            <mat-card-title>{{ job.title }}</mat-card-title>
            <mat-card-subtitle>{{ job.companyName }} &bull; {{ job.location }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="tags mt-2 mb-3">
              <mat-chip-list aria-label="Job tags">
                <mat-chip color="accent" selected>{{ job.type.replace('_', ' ') }}</mat-chip>
                <mat-chip *ngIf="job.salaryRange" variant="outlined">{{ job.salaryRange }}</mat-chip>
              </mat-chip-list>
            </div>
            <p class="description">{{ job.description | slice:0:150 }}...</p>
          </mat-card-content>
          
          <mat-card-actions align="end">
            <span class="posted-date text-secondary">{{ job.createdAt | date:'mediumDate' }}</span>
            <span class="spacer"></span>
            <button mat-button color="primary">View Details</button>
          </mat-card-actions>
        </mat-card>

        <!-- No Results State -->
        <div class="no-results" *ngIf="jobs.length === 0">
          <mat-icon class="no-results-icon">work_off</mat-icon>
          <h3>No jobs found matching your criteria</h3>
          <p class="text-secondary">Try adjusting your filters or search terms.</p>
          <button mat-stroked-button color="primary" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 2rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    
    .search-card {
      padding: 8px 16px;
    }
    .search-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      margin-top: 16px;
    }
    .search-input {
      flex: 2 1 300px;
    }
    .filter-input {
      flex: 1 1 200px;
    }
    .search-btn {
      height: 56px;
      margin-bottom: 22px; /* Align with inputs */
      padding: 0 32px;
      border-radius: 8px;
    }
    
    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      padding-bottom: 40px;
    }
    .job-card {
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    .job-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--glass-shadow);
      border-color: var(--primary-color);
    }
    .job-card mat-card-content {
      flex-grow: 1;
    }
    
    .company-logo {
      background-color: var(--primary-color-dark);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    
    .tags mat-chip {
      font-size: 12px;
      min-height: 24px;
    }
    
    .description {
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    .posted-date {
      font-size: 12px;
      margin-left: 8px;
    }
    
    .results-header {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
    }
    .badge {
      background: var(--primary-color);
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 14px;
      vertical-align: middle;
      margin-left: 8px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .no-results {
      grid-column: 1 / -1;
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
export class JobSearchComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  
  filters = {
    search: '',
    location: '',
    type: ''
  };

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getJobs(this.filters).subscribe({
      next: (data) => {
        this.jobs = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filters = { search: '', location: '', type: '' };
    this.loadJobs();
  }
}
