import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <mat-card class="glass-card auth-card fade-in">
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Login to your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="w-100 mt-3">
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
            </mat-form-field>

            <div class="actions mt-4">
              <button mat-raised-button color="primary" type="submit" class="w-100" [disabled]="loading || loginForm.invalid">
                <span *ngIf="!loading">Sign In</span>
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              </button>
            </div>
            
          </form>
        </mat-card-content>
        
        <mat-card-footer class="text-center pb-3">
          <p class="text-secondary">Don't have an account? <a routerLink="/auth/register" color="accent">Register here</a></p>
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
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  returnUrl!: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (user) => {
          this.snackBar.open(`Welcome back, ${user.fullName}!`, 'Close', { duration: 3000 });
          // Redirect based on role
          if (user.role === 'SEEKER') this.router.navigate(['/jobs']);
          else if (user.role === 'EMPLOYER') this.router.navigate(['/employer/dashboard']);
          else if (user.role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
          else this.router.navigate([this.returnUrl]);
        },
        error: error => {
          this.snackBar.open(error.error?.message || 'Login failed', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
          this.loading = false;
        }
      });
  }
}
