export type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'ai-assistant'
  | 'find-doctors'
  | 'book-appointment'
  | 'telemedicine'
  | 'patient-dashboard'
  | 'health-records'
  | 'health-monitoring'
  | 'affordable-centers'
  | 'resources'
  | 'rural-access'
  | 'auth'
  | 'doctor-dashboard'
  | 'admin-dashboard'
  | 'contact';

export interface NavItem {
  id: PageId;
  label: string;
  category?: 'main' | 'patient' | 'clinical' | 'admin' | 'info';
  badge?: string;
}
