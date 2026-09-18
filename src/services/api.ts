// ================================================================
// Service API — Toutes les communications avec le backend PHP
// Base URL : /api (relatif, fonctionne en dev et prod)
// ================================================================

const API = '/api';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
  return data as T;
}

// ----------------------------------------------------------------
// Auth
// ----------------------------------------------------------------
export async function adminLogin(username: string, password: string) {
  return request<{ token: string; username: string; expires_at: string }>(
    `${API}/admin_login`, { method: 'POST', body: JSON.stringify({ username, password }) }
  );
}

export function adminLogout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_username');
  localStorage.removeItem('admin_expires_at');
}

export function isAuthenticated(): boolean {
  const token   = localStorage.getItem('admin_token');
  const expires = localStorage.getItem('admin_expires_at');
  if (!token || !expires) return false;
  return new Date(expires) > new Date();
}

// ----------------------------------------------------------------
// Courses (public + admin)
// ----------------------------------------------------------------
export const getCourses    = ()           => request<any[]>(`${API}/courses`);
export const getCourse     = (id: string)  => request<any>(`${API}/courses/${id}`);
export const createCourse  = (d: any)     => request<any>(`${API}/courses`, { method: 'POST', body: JSON.stringify(d) });
export const updateCourse  = (id: string, d: any) => request<any>(`${API}/courses/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteCourse  = (id: string)  => request<any>(`${API}/courses/${id}`, { method: 'DELETE' });

// ----------------------------------------------------------------
// Modules
// ----------------------------------------------------------------
export const createModule  = (d: any)    => request<any>(`${API}/modules`, { method: 'POST', body: JSON.stringify(d) });
export const updateModule  = (id: string, d: any) => request<any>(`${API}/modules/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteModule  = (id: string) => request<any>(`${API}/modules/${id}`, { method: 'DELETE' });

// ----------------------------------------------------------------
// Lessons
// ----------------------------------------------------------------
export const createLesson  = (d: any)    => request<any>(`${API}/lessons`, { method: 'POST', body: JSON.stringify(d) });
export const updateLesson  = (id: string, d: any) => request<any>(`${API}/lessons/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteLesson  = (id: string) => request<any>(`${API}/lessons/${id}`, { method: 'DELETE' });

// ----------------------------------------------------------------
// Enrollment + Accès apprenant
// ----------------------------------------------------------------
export async function enrollStudent(data: {
  name: string; email?: string; phone: string; course_id: string; price: string; status: 'paid' | 'prospect'; country_code?: string;
}) {
  return request<any>(`${API}/enroll`, { method: 'POST', body: JSON.stringify(data) });
}

export const getAccessContent = (token: string) => request<any>(`${API}/access?token=${token}`);

/**
 * Initialise un paiement Djomy pour une formation.
 * Retourne soit une redirect_url (paiement payant) soit un access_url (formation gratuite).
 */
export async function initPayment(data: {
  name: string;
  email?: string;
  phone: string;
  course_id: string;
  country_code?: string;
}) {
  return request<{
    success: boolean;
    free?: boolean;
    already_paid?: boolean;
    redirect_url?: string;
    access_token?: string;
    access_url?: string;
    enrollment_id?: string;
    transaction_id?: string;
    message?: string;
  }>(`${API}/payment/init`, { method: 'POST', body: JSON.stringify(data) });
}

/**
 * Vérifie le statut d'une transaction Djomy après retour de la page de paiement.
 */
export async function getPaymentStatus(transactionId: string) {
  return request<{
    success: boolean;
    status: string;
    djomy_status?: string;
    transaction_id?: string;
    access_token?: string;
    access_url?: string;
    course_title?: string;
    message?: string;
  }>(`${API}/payment/status?transactionId=${encodeURIComponent(transactionId)}`);
}

// ----------------------------------------------------------------
// CRM / Apprenants
// ----------------------------------------------------------------
export const getStudents         = ()                  => request<any[]>(`${API}/students`);
// Route corrigée : /api/students/by-course/:courseId (BUG #5 fix)
export const getStudentsByCourse = (courseId: string)  => request<any[]>(`${API}/students/by-course/${courseId}`);

export function getStudentsExportUrl(): string {
  return `${API}/students?export=csv`;
}

export async function validatePayment(enrollmentId: string) {
  return request<{
    success: boolean;
    status: string;
    access_token: string;
    access_url: string;
    message: string;
  }>(`${API}/validate_payment`, { method: 'POST', body: JSON.stringify({ enrollment_id: enrollmentId }) });
}

// ----------------------------------------------------------------
// Stats dashboard
// ----------------------------------------------------------------
export const getStats      = (tf = 'Tous') => request<any>(`${API}/stats?timeframe=${tf}&endpoint=kpis`);
export const getChartData  = (tf = 'Tous') => request<any[]>(`${API}/stats?timeframe=${tf}&endpoint=chart`);
export const getTopCourses = ()            => request<any[]>(`${API}/stats?endpoint=top`);

// ----------------------------------------------------------------
// Settings
// ----------------------------------------------------------------
export const getSettings  = ()       => request<Record<string,string>>(`${API}/settings`);
export const saveSettings = (d: Record<string,string>) => request<any>(`${API}/settings`, { method: 'POST', body: JSON.stringify(d) });

// ----------------------------------------------------------------
// Chat IA (proxy sécurisé vers Gemini)
// ----------------------------------------------------------------
export async function sendChatMessage(message: string, history: {role:string;content:string}[] = []) {
  return request<{reply: string}>(`${API}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message, history })
  });
}

// ----------------------------------------------------------------
// Upload fichier
// ----------------------------------------------------------------
export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/upload`, {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Erreur upload');
  return data;
}
