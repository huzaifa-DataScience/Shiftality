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
      throw new Error(authError.msg || authError.error || 'Login failed');
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

export interface GetCheckinsResponse {
  data?: CheckinPayload[];
  checkins?: CheckinPayload[];
  success?: boolean;
  message?: string;
  error?: string;
}

export interface GetCheckinsParams {
  start_date?: string; // "YYYY-MM-DD"
  end_date?: string; // "YYYY-MM-DD"
  limit?: number;
  offset?: number;
}

export async function getCheckins(
  params: GetCheckinsParams = {},
): Promise<CheckinPayload[]> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const endpoint = `/functions/v1/get-checkins${
      queryString ? `?${queryString}` : ''
    }`;

    console.log('🔐 [getCheckins] Fetching checkins from:', endpoint);

    const response = await api.get<GetCheckinsResponse>(endpoint, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    // Handle different response formats
    const checkins = response.data?.data || response.data?.checkins || [];

    console.log(
      `✅ [getCheckins] Retrieved ${checkins.length} checkins from backend`,
      checkins,
    );

    return checkins;
  } catch (error: any) {
    console.error('❌ [getCheckins] Error fetching checkins:', error);
    // Handle specific error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.error_description ||
          'Failed to fetch checkins',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

export interface ResetCheckinsResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export async function resetCheckins(
  userId: string,
  isDemo?: boolean,
): Promise<ResetCheckinsResponse> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    // Build body: always send user_id, only send is_demo if explicitly provided
    const body: { user_id: string; is_demo?: boolean } = {
      user_id: userId,
    };
    if (typeof isDemo === 'boolean') {
      body.is_demo = isDemo;
    }

    console.log(
      '🔐 [resetCheckins] POST /functions/v1/reset-checkins with body:',
      body,
    );

    const response = await api.post<ResetCheckinsResponse>(
      '/functions/v1/reset-checkins',
      body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ [resetCheckins] success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [resetCheckins] Error:', error?.response || error);

    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.error_description ||
          'Reset checkins failed',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}

// src/lib/authService.ts

export interface CreateJournalEntryPayload {
  content: string;
  entry_date: string; // "YYYY-MM-DD"
  mood?: number | null;
  tags?: string[];
}

export interface CreateJournalEntryResponse {
  success?: boolean;
  message?: string;
  data?: any;
}

export async function createJournalEntry(
  payload: CreateJournalEntryPayload,
): Promise<CreateJournalEntryResponse> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('📝 [createJournalEntry] payload:', payload);

    const res = await api.post<CreateJournalEntryResponse>(
      '/functions/v1/create-journal-entry',
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
      },
    );

    console.log('✅ [createJournalEntry] response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ [createJournalEntry] error:', error);
    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Journal creation failed',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

// src/lib/authService.ts

export interface ApiJournalEntry {
  id: string;
  content: string;
  entry_date: string; // "YYYY-MM-DD"
  mood?: number | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface GetJournalsResponse {
  success?: boolean;
  message?: string;
  journals?: ApiJournalEntry[];
  data?: ApiJournalEntry[]; // in case function just returns array in `data`
}

// 🔹 Fetch all journals for current user (no params)
export async function getJournals(): Promise<ApiJournalEntry[]> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('🔐 [getJournals] Fetching journals...');

    const res = await api.get<GetJournalsResponse>(
      '/functions/v1/get-journals',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
      },
    );

    // Handle different shapes: { journals: [...] } or { data: [...] } or raw array
    let journals: ApiJournalEntry[] = [];

    if (Array.isArray(res.data)) {
      journals = res.data as ApiJournalEntry[];
    } else if (res.data?.journals) {
      journals = res.data.journals;
    } else if (res.data?.data) {
      journals = res.data.data;
    }

    console.log(
      `✅ [getJournals] Retrieved ${journals.length} journal entries`,
    );

    return journals;
  } catch (error: any) {
    console.error('❌ [getJournals] Error fetching journals:', error);
    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Failed to fetch journals',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

export interface DeleteJournalResponse {
  success?: boolean;
  message?: string;
}

export async function deleteJournalEntry(
  journalId: string,
  entryDate: string,
): Promise<DeleteJournalResponse> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    const payload = {
      journal_id: journalId,
      entry_date: entryDate, // "YYYY-MM-DD"
    };

    const res = await api.post<DeleteJournalResponse>(
      '/functions/v1/delete-journal',
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
      },
    );

    return res.data;
  } catch (error: any) {
    console.error('❌ [deleteJournalEntry] Error deleting journal:', error);
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.error_description ||
          'Journal delete failed',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

// ===================== REMINDERS =====================

export interface ApiReminder {
  id: string;
  label: string;
  fire_at_iso: string;
  pill_index: number;
  is_demo?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReminderPayload {
  label: string;
  fire_at_iso: string; // ISO timestamp
  pill_index: number;
  is_demo: boolean;
  is_active: boolean;
}

export interface CreateReminderResponse {
  success?: boolean;
  message?: string;
  data?: ApiReminder | ApiReminder[];
  reminder?: ApiReminder;
}

export async function createReminder(
  payload: CreateReminderPayload,
): Promise<ApiReminder> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('🔔 [createReminder] payload:', payload);

    const res = await api.post<CreateReminderResponse>(
      '/functions/v1/create-reminder',
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    const body = res.data;
    let reminder: ApiReminder | undefined;

    if (!body) {
      throw new Error('No response body from create-reminder');
    }

    if (Array.isArray(body.data)) {
      reminder = body.data[0];
    } else if (body.data) {
      reminder = body.data as ApiReminder;
    } else if (body.reminder) {
      reminder = body.reminder;
    } else if ((body as any).id && (body as any).label) {
      // function might just return the reminder object
      reminder = body as any as ApiReminder;
    }

    if (!reminder) {
      throw new Error('No reminder object returned from create-reminder');
    }

    console.log('✅ [createReminder] created:', reminder);
    return reminder;
  } catch (error: any) {
    console.error('❌ [createReminder] error:', error?.response || error);

    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Reminder creation failed',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}

export interface GetRemindersResponse {
  success?: boolean;
  message?: string;
  reminders?: ApiReminder[];
  data?: ApiReminder[];
}

export async function getReminders(): Promise<ApiReminder[]> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('🔐 [getReminders] Fetching reminders...');

    const res = await api.get<GetRemindersResponse>(
      '/functions/v1/get-reminders',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
      },
    );

    let reminders: ApiReminder[] = [];

    if (Array.isArray(res.data)) {
      reminders = res.data as ApiReminder[];
    } else if (res.data?.reminders) {
      reminders = res.data.reminders;
    } else if (res.data?.data) {
      reminders = res.data.data;
    }

    console.log(
      `✅ [getReminders] Retrieved ${reminders.length} reminders`,
      reminders,
    );

    return reminders;
  } catch (error: any) {
    console.error('❌ [getReminders] error:', error?.response || error);

    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Failed to fetch reminders',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}

// ===================== DELETE REMINDER =====================

export interface DeleteReminderResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export async function deleteReminder(
  reminderId: string,
): Promise<DeleteReminderResponse> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    const payload = {
      reminder_id: reminderId,
    };

    console.log('🗑 [deleteReminder] payload:', payload);

    const res = await api.post<DeleteReminderResponse>(
      '/functions/v1/delete-reminder',
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ [deleteReminder] response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ [deleteReminder] error:', error?.response || error);

    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Reminder delete failed',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}
// 🔹 Update Reminder

export interface UpdateReminderPayload {
  id: string;
  label?: string;
  fire_at_iso?: string;
  pill_index?: number;
  is_demo?: boolean;
  is_active?: boolean;
}

export async function updateReminder(
  id: string,
  payload: Omit<UpdateReminderPayload, 'id'>,
): Promise<ApiReminder> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    const body: UpdateReminderPayload = {
      id,
      ...payload,
    };

    const res = await api.post<ApiReminder | { data?: ApiReminder }>(
      `/functions/v1/update-reminder?id=${id}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    // Some edge functions wrap result in { data: ... }
    if ((res.data as any)?.data) {
      return (res.data as any).data as ApiReminder;
    }

    return res.data as ApiReminder;
  } catch (error: any) {
    console.error('❌ [updateReminder] Error updating reminder:', error);
    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Reminder update failed',
      );
    }
    throw new Error(error.message || 'Network error. Please try again.');
  }
}

// ===================== BELIEFS =====================

export type BeliefType = 'empowering' | 'shadow';

export interface ApiBeliefQuestion {
  id?: string;
  type?: BeliefType | string;
  text?: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getBeliefs(
  type: BeliefType,
): Promise<ApiBeliefQuestion[]> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    const endpoint = `/functions/v1/get-belief-questions?type=${type}`;

    console.log('🔐 [getBeliefs] GET', endpoint);

    const res = await api.get<{
      success?: boolean;
      belief_questions?: ApiBeliefQuestion[];
      data?: ApiBeliefQuestion[];
    }>(endpoint, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    const body = res.data;

    const items: ApiBeliefQuestion[] =
      (Array.isArray(body?.belief_questions) && body.belief_questions) ||
      (Array.isArray(body?.data) && body.data) ||
      [];

    console.log(
      `[getBeliefs] type="${type}" – received ${items.length} belief_questions`,
    );

    return items;
  } catch (error: any) {
    console.error(
      '❌ [getBeliefs] Error fetching beliefs:',
      error?.response || error,
    );

    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Failed to fetch beliefs',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}

export interface CreateBeliefQuestionPayload {
  type: BeliefType; // "empowering" | "shadow"
  text: string;
  order?: number;
  is_active?: boolean;
}

export interface CreateBeliefQuestionResponse {
  success?: boolean;
  message?: string;
  belief_question?: ApiBeliefQuestion;
  data?: ApiBeliefQuestion | ApiBeliefQuestion[];
}

/**
 * POST /functions/v1/create-belief-question
 */
export async function createBeliefQuestion(
  payload: CreateBeliefQuestionPayload,
): Promise<ApiBeliefQuestion> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('🧠 [createBeliefQuestion] payload:', payload);

    const res = await api.post<CreateBeliefQuestionResponse>(
      '/functions/v1/create-belief-question',
      {
        type: payload.type,
        text: payload.text,
        order: payload.order,
        is_active: payload.is_active ?? true,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    const body = res.data;
    let belief: ApiBeliefQuestion | undefined;

    if (body?.belief_question) {
      belief = body.belief_question;
    } else if (Array.isArray(body?.data)) {
      belief = body.data[0];
    } else if (body?.data && typeof body.data === 'object') {
      belief = body.data as ApiBeliefQuestion;
    } else if (body && (body as any).text) {
      belief = body as any as ApiBeliefQuestion;
    }

    if (!belief) {
      throw new Error(
        'No belief_question returned from create-belief-question',
      );
    }

    console.log('✅ [createBeliefQuestion] created:', belief);
    return belief;
  } catch (error: any) {
    console.error('❌ [createBeliefQuestion] Error:', error?.response || error);

    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Create belief failed',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}

// ---------- UPDATE BELIEF QUESTION ----------

export interface UpdateBeliefQuestionPayload {
  type?: BeliefType;
  text?: string;
  order?: number;
  is_active?: boolean;
}

export interface UpdateBeliefQuestionResponse {
  success?: boolean;
  message?: string;
  belief_question?: ApiBeliefQuestion;
  data?: ApiBeliefQuestion | ApiBeliefQuestion[];
}

/**
 * PATCH /functions/v1/update-belief-question?id=<id>
 */
export async function updateBeliefQuestion(
  id: string,
  payload: UpdateBeliefQuestionPayload,
): Promise<ApiBeliefQuestion> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('🧠 [updateBeliefQuestion] id:', id, 'payload:', payload);

    const res = await api.patch<UpdateBeliefQuestionResponse>(
      `/functions/v1/update-belief-question?id=${id}`,
      {
        type: payload.type,
        text: payload.text,
        order: payload.order,
        is_active: payload.is_active,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    const body = res.data;
    let belief: ApiBeliefQuestion | undefined;

    if (body?.belief_question) {
      belief = body.belief_question;
    } else if (Array.isArray(body?.data)) {
      belief = body.data[0];
    } else if (body?.data && typeof body.data === 'object') {
      belief = body.data as ApiBeliefQuestion;
    } else if (body && (body as any).text) {
      belief = body as any as ApiBeliefQuestion;
    }

    if (!belief) {
      throw new Error(
        'No belief_question returned from update-belief-question',
      );
    }

    console.log('✅ [updateBeliefQuestion] updated:', belief);
    return belief;
  } catch (error: any) {
    console.error('❌ [updateBeliefQuestion] Error:', error?.response || error);

    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Update belief failed',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}

export interface DeleteBeliefQuestionResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * DELETE /functions/v1/delete-belief-question?id=<id>
 */
export async function deleteBeliefQuestion(
  id: string,
): Promise<DeleteBeliefQuestionResponse> {
  try {
    const authToken = await getAuthToken();
    const SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnl0d296ZHdsc3F3a3JjcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDc3NDIsImV4cCI6MjA3NDY4Mzc0Mn0.ce2Nwjgm2cQNmF8_oO8TqoRv8DvyCKfqaREHdgQ3dMI';

    console.log('🗑 [deleteBeliefQuestion] id:', id);

    const res = await api.delete<DeleteBeliefQuestionResponse>(
      `/functions/v1/delete-belief-question`,
      {
        params: { id }, // matches your curl ?id=...
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ [deleteBeliefQuestion] response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ [deleteBeliefQuestion] Error:', error?.response || error);

    if (error.response?.data) {
      const err = error.response.data;
      throw new Error(
        err.message || err.error_description || 'Delete belief failed',
      );
    }

    throw new Error(error.message || 'Network error. Please try again.');
  }
}
