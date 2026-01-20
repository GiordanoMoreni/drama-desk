// Tenant (Organization) context utilities

import { getCurrentOrganization } from './auth';

// Get the current organization ID for the request
export async function getCurrentOrganizationId(): Promise<string> {
  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new Error('No organization context found');
  }
  return organization.organizationId;
}

// Helper to ensure all operations are scoped to the current organization
export async function withOrganizationScope<T>(
  operation: (organizationId: string) => Promise<T>
): Promise<T> {
  const organizationId = await getCurrentOrganizationId();
  return operation(organizationId);
}

// Validate that the provided organization ID matches the current context
export async function validateOrganizationAccess(organizationId: string): Promise<boolean> {
  const currentOrgId = await getCurrentOrganizationId();
  return currentOrgId === organizationId;
}

// Type-safe wrapper for organization-scoped operations
export function createOrganizationScopedFunction<TArgs extends any[], TResult>(
  fn: (organizationId: string, ...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    const organizationId = await getCurrentOrganizationId();
    return fn(organizationId, ...args);
  };
}