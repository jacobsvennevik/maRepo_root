// Diagnostics types exports
export interface DiagnosticSession {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}
