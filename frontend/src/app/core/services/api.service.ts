import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiBase = (window as any).__BLACK_COFFE_API__ || '/api/v1';

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, token?: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(this.buildUrl(path), { headers: this.headers(token) }));
  }

  post<T>(path: string, body: unknown, token?: string): Promise<T> {
    return firstValueFrom(this.http.post<T>(this.buildUrl(path), body, { headers: this.headers(token) }));
  }

  private buildUrl(path: string): string {
    return `${this.apiBase}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private headers(token?: string): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
