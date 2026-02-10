// Database row types that match our domain entities
export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberRow {
  id: string;
  organization_id: string;
  user_id: string;
  staff_member_id: string | null;
  role: 'admin' | 'teacher' | 'staff';
  is_active: boolean;
  invited_at: string;
  joined_at: string | null;
  invited_by: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface StudentRow {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  grade_level: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_info: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassRow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  max_students: number | null;
  age_range_min: number | null;
  age_range_max: number | null;
  schedule: any | null; // JSONB
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassEnrollmentRow {
  id: string;
  organization_id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'active' | 'inactive' | 'completed' | 'dropped';
  notes: string | null;
}

export interface ShowRow {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  director_id: string | null;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  budget: number | null;
  status: 'planning' | 'rehearsing' | 'performing' | 'completed' | 'cancelled';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleRow {
  id: string;
  organization_id: string;
  show_id: string;
  name: string;
  description: string | null;
  character_type: 'lead' | 'supporting' | 'ensemble' | 'crew' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CastingRow {
  id: string;
  organization_id: string;
  role_id: string;
  student_id: string;
  assigned_at: string;
  status: 'assigned' | 'confirmed' | 'rehearsing' | 'performing' | 'completed';
  notes: string | null;
}

export interface StaffMemberRow {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  primary_role:
    | 'insegnante'
    | 'regista'
    | 'tecnico'
    | 'assistente'
    | 'drammaturgo'
    | 'coreografo'
    | 'scenografo'
    | 'costumista'
    | 'vocal_coach'
    | 'movimento_scenico';
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowStaffAssignmentRow {
  id: string;
  organization_id: string;
  show_id: string;
  staff_member_id: string;
  role:
    | 'insegnante'
    | 'regista'
    | 'tecnico'
    | 'assistente'
    | 'drammaturgo'
    | 'coreografo'
    | 'scenografo'
    | 'costumista'
    | 'vocal_coach'
    | 'movimento_scenico';
  notes: string | null;
  created_at: string;
  updated_at: string;
}
