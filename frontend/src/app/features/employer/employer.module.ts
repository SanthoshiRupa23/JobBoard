import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { EmployerDashboardComponent } from './components/employer-dashboard/employer-dashboard.component';
import { CreateJobComponent } from './components/create-job/create-job.component';
import { CandidateListComponent } from './components/candidate-list/candidate-list.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { 
    path: 'dashboard', 
    component: EmployerDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['EMPLOYER'] }
  },
  { 
    path: 'jobs/new', 
    component: CreateJobComponent,
    canActivate: [AuthGuard],
    data: { roles: ['EMPLOYER'] }
  },
  { 
    path: 'jobs/:id/candidates', 
    component: CandidateListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['EMPLOYER'] }
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    EmployerDashboardComponent,
    CreateJobComponent,
    CandidateListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerModule { }
