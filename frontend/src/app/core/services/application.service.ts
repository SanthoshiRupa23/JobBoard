import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JobApplication {
  id?: number;
  jobId: number;
  seekerId: number;
  seekerName?: string;
  seekerEmail?: string;
  seekerPhone?: string;
  seekerHeadline?: string;
  seekerSkills?: string;
  seekerExperience?: string;
  seekerEducation?: string;
  coverLetter?: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  appliedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  applyForJob(application: JobApplication): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, application);
  }

  getApplicationsBySeeker(seekerId?: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/seeker`);
  }

  getApplicationsByJob(jobId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/job/${jobId}`);
  }

  updateApplicationStatus(id: number, status: string): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
}
