import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SeekerProfile {
  id?: number;
  phone?: string;
  headline?: string;
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<SeekerProfile> {
    return this.http.get<SeekerProfile>(this.apiUrl);
  }

  updateProfile(profile: SeekerProfile): Observable<SeekerProfile> {
    return this.http.put<SeekerProfile>(this.apiUrl, profile);
  }
}
