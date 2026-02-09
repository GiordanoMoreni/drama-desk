// Dependency Injection Container
// This allows us to easily swap implementations (e.g., replace Supabase with another database)

import { createServerClient, createAdminClient } from '../infrastructure/db/supabase/server-client';
import { SupabaseStudentRepository } from '../infrastructure/db/supabase/student-repository';
import { SupabaseClassRepository, SupabaseClassEnrollmentRepository } from '../infrastructure/db/supabase/class-repository';
import { SupabaseShowRepository, SupabaseRoleRepository, SupabaseCastingRepository } from '../infrastructure/db/supabase/show-repository';
import { SupabaseStaffMemberRepository, SupabaseShowStaffAssignmentRepository } from '../infrastructure/db/supabase/staff-repository';
import { SupabaseOrganizationRepository } from '../infrastructure/db/supabase/organization-repository';
import {
  StudentRepository,
  ClassRepository,
  ClassEnrollmentRepository,
  ShowRepository,
  RoleRepository,
  CastingRepository,
  OrganizationRepository,
  StaffMemberRepository,
  ShowStaffAssignmentRepository
} from '../domain/repositories';
import {
  StudentService,
  ClassService,
  ShowService,
  OrganizationService,
  StaffService
} from '../application/services/index';
import { GetDashboardDataUseCase } from '../application/use-cases/get-dashboard-data';

// Repository interfaces
export interface Repositories {
  studentRepository: StudentRepository;
  classRepository: ClassRepository;
  classEnrollmentRepository: ClassEnrollmentRepository;
  showRepository: ShowRepository;
  roleRepository: RoleRepository;
  castingRepository: CastingRepository;
  organizationRepository: OrganizationRepository;
  staffMemberRepository: StaffMemberRepository;
  showStaffAssignmentRepository: ShowStaffAssignmentRepository;
}

// Application services
export interface ApplicationServices {
  studentService: StudentService;
  classService: ClassService;
  showService: ShowService;
  organizationService: OrganizationService;
  staffService: StaffService;
  getDashboardData: GetDashboardDataUseCase;
}

// Main container class
export class Container {
  private static instance: Container;
  private repositories: Repositories | null = null;
  private services: ApplicationServices | null = null;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Get repositories with server client (for API routes and server actions)
  async getRepositories(): Promise<Repositories> {
    if (!this.repositories) {
      // Check if we're in admin testing mode (bypass RLS)
      const cookieStore = await (await import('next/headers')).cookies();
      const adminSession = cookieStore.get('admin-session')?.value;

      const supabase = adminSession
        ? await createAdminClient()  // Use admin client to bypass RLS
        : await createServerClient(); // Use regular client with RLS

      this.repositories = {
        studentRepository: new SupabaseStudentRepository(supabase),
        classRepository: new SupabaseClassRepository(supabase),
        classEnrollmentRepository: new SupabaseClassEnrollmentRepository(supabase),
        showRepository: new SupabaseShowRepository(supabase),
        roleRepository: new SupabaseRoleRepository(supabase),
        castingRepository: new SupabaseCastingRepository(supabase),
        organizationRepository: new SupabaseOrganizationRepository(supabase),
        staffMemberRepository: new SupabaseStaffMemberRepository(supabase),
        showStaffAssignmentRepository: new SupabaseShowStaffAssignmentRepository(supabase),
      };
    }

    return this.repositories;
  }

  // Get repositories with admin client (for admin operations)
  async getAdminRepositories(): Promise<Repositories> {
    const supabase = await createAdminClient();

    return {
      studentRepository: new SupabaseStudentRepository(supabase),
      classRepository: new SupabaseClassRepository(supabase),
      classEnrollmentRepository: new SupabaseClassEnrollmentRepository(supabase),
      showRepository: new SupabaseShowRepository(supabase),
      roleRepository: new SupabaseRoleRepository(supabase),
      castingRepository: new SupabaseCastingRepository(supabase),
      organizationRepository: new SupabaseOrganizationRepository(supabase),
      staffMemberRepository: new SupabaseStaffMemberRepository(supabase),
      showStaffAssignmentRepository: new SupabaseShowStaffAssignmentRepository(supabase),
    };
  }

  // Get services with server client
  async getServices(): Promise<ApplicationServices> {
    if (!this.services) {
      const repositories = await this.getRepositories();

      this.services = {
        studentService: new StudentService(repositories.studentRepository),
        classService: new ClassService(repositories.classRepository, repositories.classEnrollmentRepository),
        showService: new ShowService(repositories.showRepository, repositories.roleRepository, repositories.castingRepository),
        organizationService: new OrganizationService(repositories.organizationRepository),
        staffService: new StaffService(repositories.staffMemberRepository, repositories.showStaffAssignmentRepository),
        getDashboardData: new GetDashboardDataUseCase(
          new StudentService(repositories.studentRepository),
          new ClassService(repositories.classRepository, repositories.classEnrollmentRepository),
          new ShowService(repositories.showRepository, repositories.roleRepository, repositories.castingRepository)
        ),
      };
    }

    return this.services;
  }

  // Get services with admin client
  async getAdminServices(): Promise<ApplicationServices> {
    const repositories = await this.getAdminRepositories();

    return {
      studentService: new StudentService(repositories.studentRepository),
      classService: new ClassService(repositories.classRepository, repositories.classEnrollmentRepository),
      showService: new ShowService(repositories.showRepository, repositories.roleRepository, repositories.castingRepository),
      organizationService: new OrganizationService(repositories.organizationRepository),
      staffService: new StaffService(repositories.staffMemberRepository, repositories.showStaffAssignmentRepository),
      getDashboardData: new GetDashboardDataUseCase(
        new StudentService(repositories.studentRepository),
        new ClassService(repositories.classRepository, repositories.classEnrollmentRepository),
        new ShowService(repositories.showRepository, repositories.roleRepository, repositories.castingRepository)
      ),
    };
  }

  // Reset container (useful for testing)
  reset(): void {
    this.repositories = null;
    this.services = null;
  }
}

// Convenience functions for accessing dependencies
export async function getRepositories(): Promise<Repositories> {
  return Container.getInstance().getRepositories();
}

export async function getAdminRepositories(): Promise<Repositories> {
  return Container.getInstance().getAdminRepositories();
}

export async function getServices(): Promise<ApplicationServices> {
  return Container.getInstance().getServices();
}

export async function getAdminServices(): Promise<ApplicationServices> {
  return Container.getInstance().getAdminServices();
}

// Export individual repositories for convenience
export async function getStudentRepository(): Promise<StudentRepository> {
  return (await getRepositories()).studentRepository;
}

export async function getClassRepository(): Promise<ClassRepository> {
  return (await getRepositories()).classRepository;
}

export async function getShowRepository(): Promise<ShowRepository> {
  return (await getRepositories()).showRepository;
}

export async function getOrganizationRepository(): Promise<OrganizationRepository> {
  return (await getRepositories()).organizationRepository;
}

export async function getStaffRepository(): Promise<StaffMemberRepository> {
  return (await getRepositories()).staffMemberRepository;
}

// Export individual services for convenience
export async function getStudentService(): Promise<StudentService> {
  return (await getServices()).studentService;
}

export async function getClassService(): Promise<ClassService> {
  return (await getServices()).classService;
}

export async function getShowService(): Promise<ShowService> {
  return (await getServices()).showService;
}

export async function getOrganizationService(): Promise<OrganizationService> {
  return (await getServices()).organizationService;
}

export async function getStaffService(): Promise<StaffService> {
  return (await getServices()).staffService;
}
