import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../models/auth.models';

type JsonRecord = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'black_coffe_auth';
  private readonly authState = new BehaviorSubject<AuthResponse | null>(this.loadStoredAuth());

  readonly auth$ = this.authState.asObservable();

  constructor(private readonly api: ApiService) {}

  get snapshot(): AuthResponse | null {
    return this.authState.value;
  }

  get token(): string | null {
    return this.authState.value?.accessToken ?? null;
  }

  get isLoggedIn(): boolean {
    return Boolean(this.token);
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<unknown>('/auth/login', request);
    const auth = this.normalizeAuth(response);
    if (!auth) {
      throw new Error('Respuesta de autenticacion invalida.');
    }

    this.saveAuth(auth);
    return auth;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<unknown>('/auth/register', request);
    const auth = this.normalizeAuth(response);
    if (!auth) {
      throw new Error('Respuesta de autenticacion invalida.');
    }

    this.saveAuth(auth);
    return auth;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.authState.next(null);
  }

  private saveAuth(auth: AuthResponse): void {
    const normalized = this.normalizeAuth(auth);
    if (!normalized) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(normalized));
    this.authState.next(normalized);
  }

  private loadStoredAuth(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? this.normalizeAuth(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  private normalizeAuth(payload: unknown): AuthResponse | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const root = payload as JsonRecord;
    const userPayload = this.getObject(root, 'user', 'User');
    if (!userPayload) {
      return null;
    }

    const accessToken = this.getString(root, 'accessToken', 'AccessToken');
    const refreshToken = this.getString(root, 'refreshToken', 'RefreshToken');
    const expiresAtUtc = this.getString(root, 'expiresAtUtc', 'ExpiresAtUtc');
    const id = this.getString(userPayload, 'id', 'Id');
    const fullName = this.getString(userPayload, 'fullName', 'FullName');
    const email = this.getString(userPayload, 'email', 'Email');
    const phone = this.getString(userPayload, 'phone', 'Phone');
    const status = this.getString(userPayload, 'status', 'Status');
    const roles = this.getStringArray(userPayload, 'roles', 'Roles');

    if (!accessToken || !refreshToken || !expiresAtUtc || !id || !fullName || !email || !phone || !status) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAtUtc,
      user: {
        id,
        fullName,
        email,
        phone,
        status,
        roles
      }
    };
  }

  private getObject(record: JsonRecord, ...keys: string[]): JsonRecord | null {
    for (const key of keys) {
      const value = record[key];
      if (value && typeof value === 'object') {
        return value as JsonRecord;
      }
    }

    return null;
  }

  private getString(record: JsonRecord, ...keys: string[]): string | null {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return null;
  }

  private getStringArray(record: JsonRecord, ...keys: string[]): string[] {
    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.filter((entry): entry is string => typeof entry === 'string');
      }
    }

    return [];
  }
}
