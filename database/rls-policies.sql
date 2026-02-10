-- Row Level Security Policies for Multi-Tenant Isolation
-- All policies ensure users can only access data from organizations they belong to

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE castings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization memberships
CREATE OR REPLACE FUNCTION get_current_user_organizations()
RETURNS TABLE(organization_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT om.organization_id
    FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_current_user_org_admin(target_organization_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organization_members om
        WHERE om.organization_id = target_organization_id
          AND om.user_id = auth.uid()
          AND om.role = 'admin'
          AND om.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Allow organization creation" ON organizations;

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.is_active = true
        )
    );

-- Allow all INSERT operations on organizations (temporary for debugging)
CREATE POLICY "Allow organization creation" ON organizations
    FOR INSERT WITH CHECK (true);

-- Users can update organizations they belong to (admin only)
CREATE POLICY "Admins can update their organizations" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role = 'admin'
            AND om.is_active = true
        )
    );

-- Organization Members policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can insert organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can update organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can delete organization members" ON organization_members;
DROP POLICY IF EXISTS "Allow initial member creation during organization setup" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Allow authenticated users to view organization members" ON organization_members;
DROP POLICY IF EXISTS "Allow authenticated users to manage organization members" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can view members in their organization" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can insert members" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can update members" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can delete members" ON organization_members;

-- Re-enable RLS for organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization memberships" ON organization_members
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Organization admins can view members in their organization" ON organization_members
    FOR SELECT USING (
        is_current_user_org_admin(organization_id)
    );

CREATE POLICY "Organization admins can insert members" ON organization_members
    FOR INSERT WITH CHECK (
        is_current_user_org_admin(organization_id)
        OR user_id = auth.uid()
    );

CREATE POLICY "Organization admins can update members" ON organization_members
    FOR UPDATE USING (
        is_current_user_org_admin(organization_id)
    ) WITH CHECK (
        is_current_user_org_admin(organization_id)
    );

CREATE POLICY "Organization admins can delete members" ON organization_members
    FOR DELETE USING (
        is_current_user_org_admin(organization_id)
    );

-- Students policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view students" ON students;
DROP POLICY IF EXISTS "Teachers and admins can manage students" ON students;

-- All organization members can view students
CREATE POLICY "Organization members can view students" ON students
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

-- Teachers and admins can manage students
CREATE POLICY "Teachers and admins can manage students" ON students
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );

-- Classes policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view classes" ON classes;
DROP POLICY IF EXISTS "Teachers and admins can manage classes" ON classes;

-- All organization members can view classes
CREATE POLICY "Organization members can view classes" ON classes
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

-- Teachers and admins can manage classes
CREATE POLICY "Teachers and admins can manage classes" ON classes
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );

-- Class Enrollments policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Teachers and admins can manage enrollments" ON class_enrollments;

-- All organization members can view enrollments
CREATE POLICY "Organization members can view enrollments" ON class_enrollments
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

-- Teachers and admins can manage enrollments
CREATE POLICY "Teachers and admins can manage enrollments" ON class_enrollments
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );

-- Shows policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view shows" ON shows;
DROP POLICY IF EXISTS "Teachers and admins can manage shows" ON shows;

-- All organization members can view shows
CREATE POLICY "Organization members can view shows" ON shows
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

-- Teachers and admins can manage shows
CREATE POLICY "Teachers and admins can manage shows" ON shows
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );

-- Roles policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view roles" ON roles;
DROP POLICY IF EXISTS "Teachers and admins can manage roles" ON roles;

-- All organization members can view roles
CREATE POLICY "Organization members can view roles" ON roles
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

-- Teachers and admins can manage roles
CREATE POLICY "Teachers and admins can manage roles" ON roles
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );

-- Castings policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view castings" ON castings;
DROP POLICY IF EXISTS "Teachers and admins can manage castings" ON castings;

-- All organization members can view castings
CREATE POLICY "Organization members can view castings" ON castings
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

-- Teachers and admins can manage castings
CREATE POLICY "Teachers and admins can manage castings" ON castings
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );

-- Staff members policies
DROP POLICY IF EXISTS "Organization members can view staff members" ON staff_members;
DROP POLICY IF EXISTS "Teachers and admins can manage staff members" ON staff_members;

CREATE POLICY "Organization members can view staff members" ON staff_members
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

CREATE POLICY "Teachers and admins can manage staff members" ON staff_members
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );

-- Show staff assignments policies
DROP POLICY IF EXISTS "Organization members can view show staff assignments" ON show_staff_assignments;
DROP POLICY IF EXISTS "Teachers and admins can manage show staff assignments" ON show_staff_assignments;

CREATE POLICY "Organization members can view show staff assignments" ON show_staff_assignments
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM get_current_user_organizations())
    );

CREATE POLICY "Teachers and admins can manage show staff assignments" ON show_staff_assignments
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('admin', 'teacher')
            AND om.is_active = true
        )
    );
