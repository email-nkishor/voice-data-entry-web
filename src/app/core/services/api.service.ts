import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${environment.apiUrl}${path}`, this.options()));
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${environment.apiUrl}${path}`, body, this.options()));
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${environment.apiUrl}${path}`, body, this.options()));
  }

  delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${environment.apiUrl}${path}`, this.options()));
  }

  postForm<T>(path: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('vde_auth_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return firstValueFrom(
      this.http.post<T>(`${environment.apiUrl}${path}`, formData, { headers })
    );
  }

  download(path: string): Promise<Blob> {
    const token = localStorage.getItem('vde_auth_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return firstValueFrom(
      this.http.get(`${environment.apiUrl}${path}`, { headers, responseType: 'blob' })
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.get(`${environment.apiUrl}/health`, { headers: new HttpHeaders() })
      );
      return true;
    } catch {
      return false;
    }
  }

  private options() {
    const token = localStorage.getItem('vde_auth_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return { headers };
  }
}
