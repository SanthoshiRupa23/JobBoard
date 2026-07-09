export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'SEEKER' | 'EMPLOYER' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  fullName: string;
  role: 'SEEKER' | 'EMPLOYER' | 'ADMIN';
  status: string;
}
