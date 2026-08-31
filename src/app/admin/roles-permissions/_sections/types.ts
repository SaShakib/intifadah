export interface RoleSummary {
  roleKey: string;
  role: string;
  members: number;
  modules: string;
  level: 'high' | 'medium' | 'low';
}
