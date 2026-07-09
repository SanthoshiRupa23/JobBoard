import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <mat-card class="glass-card auth-card fade-in">
        <mat-card-header>
          <mat-card-title>Create an Account</mat-card-title>
          <mat-card-subtitle>Join JobBoard today</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="w-100 mt-3">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" placeholder="Ex. Pat Doe">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="f['fullName'].errors?.['required']">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mt-2">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Ex. pat@example.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="f['email'].errors?.['required']">Email is required</mat-error>
              <mat-error *ngIf="f['email'].errors?.['email']">Enter a valid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mt-2">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
              <button type="button" mat-icon-button matSuffix (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="f['password'].errors?.['required']">Password is required</mat-error>
              <mat-error *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-100 mt-2">
              <mat-label>I am a...</mat-label>
              <mat-select formControlName="role">
                <mat-option value="SEEKER">Job Seeker</mat-option>
                <mat-option value="EMPLOYER">Employer</mat-option>
              </mat-select>
              <mat-error *ngIf="f['role'].errors?.['required']">Please select a role</mat-error>
            </mat-form-field>

            <div class="actions mt-4">
              <button mat-raised-button color="accent" type="submit" class="w-100" [disabled]="loading || registerForm.invalid">
                <span *ngIf="!loading">Create Account</span>
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              </button>
            </div>
            
          </form>
        </mat-card-content>
        
        <mat-card-footer class="text-center pb-3">
          <p class="text-secondary">Already have an account? <a routerLink="/auth/login" color="primary">Login here</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px);
    }
    .auth-card {
      width: 100%;
      max-width: 450px;
      padding: 24px;
    }
    .w-100 {
      width: 100%;
    }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 16px; }
    .mt-4 { margin-top: 24px; }
    .text-center { text-align: center; }
    .pb-3 { padding-bottom: 16px; }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['SEEKER', Validators.required]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 5000 });
          this.router.navigate(['/auth/login']);
        },
        error: error => {
          this.snackBar.open(error.error?.message || 'Registration failed', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
          this.loading = false;
        }
      });
  }
}
