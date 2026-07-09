import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../../core/services/job.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-job',
  template: `
    <div class="create-job-container fade-in">
      <div class="header-section mb-4">
        <button mat-icon-button (click)="goBack()" class="mb-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Post a New Job</h1>
        <p class="text-secondary">Fill out the details below to create a new job posting.</p>
      </div>

      <mat-card class="glass-card form-card">
        <mat-card-content>
          <form [formGroup]="jobForm" (ngSubmit)="onSubmit()">
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-grow-2">
                <mat-label>Job Title</mat-label>
                <input matInput formControlName="title" placeholder="e.g. Senior Frontend Developer">
                <mat-error *ngIf="f['title'].errors?.['required']">Title is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-grow-1">
                <mat-label>Job Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="FULL_TIME">Full Time</mat-option>
                  <mat-option value="PART_TIME">Part Time</mat-option>
                  <mat-option value="CONTRACT">Contract</mat-option>
                  <mat-option value="REMOTE">Remote</mat-option>
                  <mat-option value="INTERNSHIP">Internship</mat-option>
                </mat-select>
                <mat-error *ngIf="f['type'].errors?.['required']">Job type is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-grow-1">
                <mat-label>Company Name</mat-label>
                <input matInput formControlName="companyName" placeholder="e.g. Acme Corp">
                <mat-error *ngIf="f['companyName'].errors?.['required']">Company name is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-grow-1">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" placeholder="e.g. San Francisco, CA (or Remote)">
                <mat-error *ngIf="f['location'].errors?.['required']">Location is required</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Salary Range (Optional)</mat-label>
              <input matInput formControlName="salaryRange" placeholder="e.g. $100k - $130k">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mt-2">
              <mat-label>Job Description</mat-label>
              <textarea matInput formControlName="description" rows="6" placeholder="Describe the role..."></textarea>
              <mat-error *ngIf="f['description'].errors?.['required']">Description is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mt-2">
              <mat-label>Requirements (Optional)</mat-label>
              <textarea matInput formControlName="requirements" rows="4" placeholder="List the requirements..."></textarea>
            </mat-form-field>

            <div class="actions mt-4 text-end">
              <button mat-button type="button" (click)="goBack()" class="mr-3">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading || jobForm.invalid" class="px-4">
                <span *ngIf="!loading">Post Job</span>
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              </button>
            </div>
            
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .w-100 { width: 100%; }
    .text-end { text-align: right; }
    .mr-3 { margin-right: 1rem; }
    .px-4 { padding-left: 2rem; padding-right: 2rem; }

    .create-job-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 40px;
    }

    .form-card {
      padding: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .flex-grow-1 { flex: 1 1 200px; }
    .flex-grow-2 { flex: 2 1 300px; }

    textarea {
      resize: vertical;
    }
  `]
})
export class CreateJobComponent implements OnInit {
  jobForm!: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private jobService: JobService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.jobForm = this.formBuilder.group({
      title: ['', Validators.required],
      type: ['FULL_TIME', Validators.required],
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      salaryRange: [''],
      description: ['', Validators.required],
      requirements: ['']
    });
  }

  get f() { return this.jobForm.controls; }

  goBack() {
    this.router.navigate(['/employer/dashboard']);
  }

  onSubmit() {
    if (this.jobForm.invalid) {
      return;
    }

    const user = this.authService.currentUserValue;
    if (!user) return;

    this.loading = true;
    const formValues = this.jobForm.value;
    const newJob = {
      title: formValues.title,
      description: formValues.description,
      location: formValues.location,
      type: formValues.type,
      requirements: formValues.requirements,
      salaryRange: formValues.salaryRange, // keep if JobService handles it, otherwise backend ignores it
      employerId: user.id,
      status: 'OPEN' as const
    };

    this.jobService.createJob(newJob).subscribe({
      next: () => {
        this.snackBar.open('Job posted successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/employer/dashboard']);
      },
      error: error => {
        this.snackBar.open('Error posting job.', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
        this.loading = false;
      }
    });
  }
}
