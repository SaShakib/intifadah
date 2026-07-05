export interface RoleSummary {
  role: string;
  members: number;
  modules: string;
  level: 'high' | 'medium' | 'low';
}
