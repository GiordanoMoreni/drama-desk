import { StaffRole } from '@/domain/entities';

export const STAFF_ROLE_OPTIONS: Array<{ value: StaffRole; label: string }> = [
  { value: 'insegnante', label: 'Insegnante' },
  { value: 'regista', label: 'Regista' },
  { value: 'tecnico', label: 'Tecnico' },
  { value: 'assistente', label: 'Assistente' },
  { value: 'drammaturgo', label: 'Drammaturgo' },
  { value: 'coreografo', label: 'Coreografo' },
  { value: 'scenografo', label: 'Scenografo' },
  { value: 'costumista', label: 'Costumista' },
  { value: 'vocal_coach', label: 'Vocal Coach' },
  { value: 'movimento_scenico', label: 'Movimento scenico' },
];

export function getStaffRoleLabel(role: StaffRole): string {
  return STAFF_ROLE_OPTIONS.find(option => option.value === role)?.label ?? role;
}
