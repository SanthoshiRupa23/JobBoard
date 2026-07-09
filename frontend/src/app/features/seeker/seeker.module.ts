import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { JobSearchComponent } from './components/job-search/job-search.component';
import { JobDetailComponent } from './components/job-detail/job-detail.component';
import { ApplicationHistoryComponent } from './components/application-history/application-history.component';

const routes: Routes = [
  { path: '', component: JobSearchComponent },
  { path: 'applications', component: ApplicationHistoryComponent },
  { path: ':id', component: JobDetailComponent }
];

@NgModule({
  declarations: [
    JobSearchComponent,
    JobDetailComponent,
    ApplicationHistoryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SeekerModule { }
