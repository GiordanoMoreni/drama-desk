-- Multi-tenant Theatre Management System Database Schema
-- All domain entities include organization_id for tenant isolation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Members (Users belonging to organizations)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Supabase Auth user ID
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'staff')),
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES organization_members(id),
    UNIQUE(organization_id, user_id)
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    grade_level VARCHAR(50),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    medical_info TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES organization_members(id),
    max_students INTEGER,
    age_range_min INTEGER,
    age_range_max INTEGER,
    schedule JSONB, -- Store schedule as JSON (days, times, etc.)
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class Enrollments
CREATE TABLE class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'dropped')),
    notes TEXT,
    UNIQUE(class_id, student_id)
);

-- Shows
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    director_id UUID REFERENCES organization_members(id),
    start_date DATE,
    end_date DATE,
    venue VARCHAR(255),
    budget DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'rehearsing', 'performing', 'completed', 'cancelled')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles (Character roles in shows)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    character_type VARCHAR(50) CHECK (character_type IN ('lead', 'supporting', 'ensemble', 'crew')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Castings (Student assignments to roles)
CREATE TABLE castings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'rehearsing', 'performing', 'completed')),
    notes TEXT,
    UNIQUE(role_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_organization_members_org_user ON organization_members(organization_id, user_id);
CREATE INDEX idx_organization_members_user ON organization_members(user_id);
CREATE INDEX idx_students_org_name ON students(organization_id, last_name, first_name);
CREATE INDEX idx_classes_org_teacher ON classes(organization_id, teacher_id);
CREATE INDEX idx_classes_org_active ON classes(organization_id, is_active);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_shows_org_director ON shows(organization_id, director_id);
CREATE INDEX idx_shows_org_status ON shows(organization_id, status);
CREATE INDEX idx_roles_show ON roles(show_id);
CREATE INDEX idx_castings_role ON castings(role_id);
CREATE INDEX idx_castings_student ON castings(student_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();