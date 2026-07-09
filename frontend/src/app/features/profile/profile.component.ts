import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService, SeekerProfile } from '../../core/services/profile.service';
import { User } from '../../core/models/auth.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-container fade-in">
      <div class="header-section mb-4">
        <h1>My Profile</h1>
        <p class="text-secondary">Update your personal information and resume</p>
      </div>

      <div class="profile-grid">
        <!-- Personal Info Card -->
        <mat-card class="glass-card mb-4">
          <mat-card-header>
            <div mat-card-avatar class="avatar">
              <mat-icon>person</mat-icon>
            </div>
            <mat-card-title>Personal Details</mat-card-title>
            <mat-card-subtitle>{{ user?.role }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="mt-4">
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName">
                <mat-error *ngIf="f['fullName'].errors?.['required']">Name is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100 mt-2">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="email">
                <mat-error *ngIf="f['email'].errors?.['required']">Email is required</mat-error>
                <mat-error *ngIf="f['email'].errors?.['email']">Invalid email format</mat-error>
              </mat-form-field>

              <div class="actions mt-3">
                <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.pristine || profileForm.invalid">
                  Save Changes
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Professional Profile Card (For Seekers only) -->
        <mat-card class="glass-card mb-4" *ngIf="user?.role === 'SEEKER'">
          <mat-card-header>
            <div mat-card-avatar class="resume-avatar">
              <mat-icon>work</mat-icon>
            </div>
            <mat-card-title>Professional Profile</mat-card-title>
            <mat-card-subtitle>Detail your skills, experience, and education</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="mt-4">
            <form [formGroup]="seekerProfileForm" (ngSubmit)="saveSeekerProfile()" *ngIf="seekerProfileForm">
              <div class="form-row">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Headline</mat-label>
                  <input matInput formControlName="headline" placeholder="Ex. Senior Software Engineer">
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="w-100 mt-2">
                <mat-label>Skills (comma separated)</mat-label>
                <textarea matInput formControlName="skills" rows="2" placeholder="Java, Angular, TypeScript"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100 mt-2">
                <mat-label>Experience</mat-label>
                <textarea matInput formControlName="experience" rows="4" placeholder="Detail your work experience here..."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100 mt-2">
                <mat-label>Education</mat-label>
                <textarea matInput formControlName="education" rows="3" placeholder="Detail your educational background here..."></textarea>
              </mat-form-field>

              <div class="actions mt-3">
                <button mat-raised-button color="accent" type="submit" [disabled]="seekerProfileForm.pristine || seekerProfileForm.invalid || loadingProfile">
                  <span *ngIf="!loadingProfile">Save Profile</span>
                  <mat-spinner diameter="20" *ngIf="loadingProfile"></mat-spinner>
                </button>
              </div>
            </form>
            
            <div class="loading-container text-center py-4" *ngIf="!seekerProfileForm">
              <mat-spinner diameter="30" class="mx-auto"></mat-spinner>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .w-100 { width: 100%; }
    .text-center { text-align: center; }

    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 40px;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }
    
    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }

    .avatar {
      background-color: var(--primary-color-dark);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .resume-avatar {
      background-color: var(--secondary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  seekerProfileForm!: FormGroup;
  loadingProfile = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    
    this.profileForm = this.formBuilder.group({
      fullName: [this.user?.fullName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]]
    });
    
    if (this.user?.role === 'SEEKER') {
      this.loadSeekerProfile();
    }
  }

  get f() { return this.profileForm.controls; }

  loadSeekerProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.seekerProfileForm = this.formBuilder.group({
          headline: [profile.headline || ''],
          phone: [profile.phone || ''],
          skills: [profile.skills || ''],
          experience: [profile.experience || ''],
          education: [profile.education || '']
        });
      },
      error: () => {
        // Init empty form if profile doesn't exist
        this.seekerProfileForm = this.formBuilder.group({
          headline: [''],
          phone: [''],
          skills: [''],
          experience: [''],
          education: ['']
        });
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.snackBar.open('Personal details updated successfully!', 'Close', { duration: 3000 });
    this.profileForm.markAsPristine();
  }

  saveSeekerProfile(): void {
    if (this.seekerProfileForm.invalid) return;
    
    this.loadingProfile = true;
    this.profileService.updateProfile(this.seekerProfileForm.value).subscribe({
      next: () => {
        this.loadingProfile = false;
        this.snackBar.open('Professional profile updated successfully!', 'Close', { duration: 3000 });
        this.seekerProfileForm.markAsPristine();
      },
      error: () => {
        this.loadingProfile = false;
        this.snackBar.open('Failed to update profile.', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
      }
    });
  }
}
