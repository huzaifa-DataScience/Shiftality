// src/lib/authService.ts
import { api } from './apiClient';
import { clearAuthData } from './authStorage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string | null;
    phone: string;
    confirmation_sent_at: string | null;
    confirmed_at: string | null;
    recovery_sent_at: string | null;
    last_sign_in_at: string;
    app_metadata: {
      provider: string;
      providers: string[];
    };
    user_metadata: {
      email: string;
      email_verified: boolean;
      phone_verified: boolean;
      sub: string;
    };
    identities?: Array<{
      identity_id: string;
      id: string;
      user_id: string;
      identity_data: any;
      provider: string;
      last_sign_in_at: string;
      created_at: string;
      updated_at: string;
      email: string;
    }>;
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
  };
  weak_password?: any;
}

export interface AuthError {
  error: string;
  error_description: string;
}

/**
 * Login with email and password using Supabase Auth
 */
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>(
      '/auth/v1/token?grant_type=password',
      {
        email: credentials.email,
        password: credentials.password,
      },
    );

    return response.data;
  } catch (error: any) {
    // Handle specific error responses
    if (error.response?.data) {
      const authError = error.response.data as AuthError;
      throw new Error(authError.error_description || authError.error || 'Login failed');
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

/**
 * Logout - clears local storage
 */
export async function logout(): Promise<void> {
  await clearAuthData();
}

