import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Job {
  id?: number;
  title: string;
  description: string;
  companyName?: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'REMOTE' | 'INTERNSHIP';
  salaryRange?: string;
  requirements?: string;
  employerId: number;
  createdAt?: string;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobs(filters?: any): Observable<Job[]> {
    let params = new HttpParams();
    let url = this.apiUrl;
    
    if (filters && (filters.search || filters.location || filters.type)) {
      url = `${this.apiUrl}/search`;
      if (filters.search) params = params.set('keyword', filters.search); // backend expects 'keyword'
      if (filters.location) params = params.set('location', filters.location);
      if (filters.type) params = params.set('type', filters.type);
    }
    
    return this.http.get<any>(url, { params }).pipe(
      map(response => response.content ? response.content : (Array.isArray(response) ? response : []))
    );
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/my-jobs`);
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
