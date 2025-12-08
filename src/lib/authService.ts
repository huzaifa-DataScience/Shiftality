// src/lib/authService.ts
import { api } from './apiClient';
import { clearAuthData, getAuthToken } from './authStorage';

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
    console.log('🚀 ~ error:', error?.response);
    // Handle specific error responses
    if (error.response?.data) {
      const authError = error.response.data as AuthError;
      throw new Error(authError.error || 'Login failed');
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

/**
 * Signup with email and password using Supabase Auth
 */
export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface SignupResponse {
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
      full_name?: string;
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

export async function signup(
  credentials: SignupCredentials,
): Promise<SignupResponse> {
  try {
    const payload: any = {
      email: credentials.email,
      password: credentials.password,
    };

    // Add name to user_metadata if provided
    if (credentials.name) {
      payload.data = {
        full_name: credentials.name,
      };
    }

    const response = await api.post<SignupResponse>('/auth/v1/signup', payload);

    return response.data;
  } catch (error: any) {
    // Handle specific error responses
    if (error.response?.data) {
      const authError = error.response.data as AuthError;
      throw new Error(
        authError.error_description || authError.error || 'Signup failed',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

/**
 * Update user profile data
 */
export interface UpdateProfilePayload {
  first_name?: string;
  timezone?: string;
  journey_start_date?: string; // ISO date string
  north_star?: string;
  shadow_path?: string;
  check_in_time?: string; // ISO time string
  dnd_start?: string; // ISO time string
  dnd_end?: string; // ISO time string
  allow_notifications?: boolean;
}

export interface UpdateProfileResponse {
  id: string;
  first_name?: string;
  timezone?: string;
  journey_start_date?: string;
  north_star?: string;
  shadow_path?: string;
  check_in_time?: string;
  dnd_start?: string;
  dnd_end?: string;
  allow_notifications?: boolean;
  updated_at: string;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  try {
    // Update profile in Supabase - using PATCH with user_id filter
    const response = await api.post<UpdateProfileResponse>(
      `/functions/v1/update-profile`,
      payload,
    );

    return response.data;
  } catch (error: any) {
    // Handle specific error responses
    if (error.response?.data) {
      const authError = error.response.data as AuthError;
      throw new Error(authError.error || 'Profile update failed');
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

/**
 * Submit questionnaire answers
 */
export interface QuestionAnswer {
  question_text: string;
  question_index: number;
  answer: string; // 's_agree' | 'agree' | 'unsure' | 'disagree' | 's_disagree'
}

export interface SectionAnswer {
  category: string; // section title (e.g., "Finance", "Health & Energy")
  answers: QuestionAnswer[];
}

export interface SubmitQuestionnairePayload {
  user_id: string;
  answers: SectionAnswer[]; // Array of 6 section objects
  completed_at?: string; // ISO timestamp
}

export interface SubmitQuestionnaireResponse {
  id: string;
  user_id: string;
  answers: SectionAnswer[];
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export async function submitQuestionnaire(
  userId: string,
  payload: Omit<SubmitQuestionnairePayload, 'user_id'>,
): Promise<SubmitQuestionnaireResponse> {
  try {
    const fullPayload: SubmitQuestionnairePayload = {
      user_id: userId,
      ...payload,
      completed_at: payload.completed_at || new Date().toISOString(),
    };

    const response = await api.post<SubmitQuestionnaireResponse>(
      '/rest/v1/questionnaires',
      fullPayload,
      {
        headers: {
          Prefer: 'return=representation',
        },
      },
    );

    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      return response.data[0];
    }

    // If response is not an array, it's likely the object directly
    if (response.data && typeof response.data === 'object') {
      return response.data as SubmitQuestionnaireResponse;
    }

    throw new Error('Questionnaire submission failed: No data returned');
  } catch (error: any) {
    // Handle specific error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.error_description ||
          'Questionnaire submission failed',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

export interface GetProfileResponse {
  id: string;
  user_id: string;
  email?: string;
  first_name?: string;
  timezone?: string;
  user_timezone?: string;
  journey_start_date?: string;
  north_star?: string;
  highest_text?: string;
  shadow_path?: string;
  lowest_text?: string;
  check_in_time?: string;
  preferred_checkin_time?: string;
  dnd_start?: string;
  dnd_end?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  allow_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
  archetype?: string;
  baseline_index?: number;
  belief_scan_results?: any;
  custom_empowering_beliefs?: string;
  custom_shadow_beliefs?: string;
  daily_capacity?: number;
  is_onboarded?: boolean;
  is_admin?: boolean;
  reflection_enabled?: boolean;
  theme?: string;
  font_size?: string;
  color_blind_mode?: boolean;
  reminders_enabled?: boolean;
}

export async function getProfile(): Promise<GetProfileResponse> {
  try {
    // Get the stored auth token
    const authToken = await getAuthToken();

    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('🔐 [getProfile] Sending GET request with token and apikey');

    // Send both token and apikey in payload
    const payload = {
      token: authToken,
      apikey: SUPABASE_ANON_KEY,
    };

    const response = await api.get<GetProfileResponse>(
      '/functions/v1/get-profile',
      {
        params: payload,
      },
    );

    // Handle array response (return first item)
    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      return response.data[0];
    }

    // Handle direct object response
    if (response.data && typeof response.data === 'object') {
      return response.data as GetProfileResponse;
    }

    throw new Error('Profile fetch failed: No data returned');
  } catch (error: any) {
    // Handle specific error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.error_description ||
          'Profile fetch failed',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

/**
 * Create a checkin record for today's shift
 */
export interface CheckinPayload {
  id: string;
  date: string; // "YYYY-MM-DD"
  pos_yes: number;
  neg_yes: number;
  daily_score: number; // -10 .. +10
  source: 'user' | 'demo';
  created_at: string;
}

export interface CreateCheckinResponse {
  success?: boolean;
  message?: string;
  data?: any;
}

export async function createCheckin(
  checkin: CheckinPayload,
): Promise<CreateCheckinResponse> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log(
      '🔐 [createCheckin] Sending POST request with checkin data:',
      checkin,
    );

    // Send checkin data in request body with auth headers
    const response = await api.post<CreateCheckinResponse>(
      '/functions/v1/create-checkin',
      checkin,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
      },
    );

    console.log(
      '✅ [createCheckin] Checkin created successfully:',
      response.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ [createCheckin] Error creating checkin:', error);
    // Handle specific error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.error_description ||
          'Checkin creation failed',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}
