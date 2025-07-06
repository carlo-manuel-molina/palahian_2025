// lib/permissions.ts

export type UserRole = 'breeder' | 'fighter' | 'seller' | 'shipper' | 'buyer' | 'gaffer';
export type Module = 'sales' | 'bloodlines' | 'breeding' | 'battle' | 'analytics' | 'search' | 'archived';

// Define which roles have access to which modules
const modulePermissions: Record<Module, UserRole[]> = {
  sales: ['breeder', 'fighter', 'seller', 'gaffer'], // All except buyer and shipper
  bloodlines: ['breeder'],
  breeding: ['breeder'],
  battle: ['breeder', 'fighter', 'gaffer'],
  analytics: ['fighter', 'gaffer'],
  search: ['breeder', 'fighter', 'seller', 'shipper', 'buyer', 'gaffer'], // All roles
  archived: ['breeder', 'fighter'], // Both breeders and fighters can access archived chickens
};

/**
 * Check if a user role has access to a specific module
 */
export function hasModuleAccess(userRole: UserRole, module: Module): boolean {
  return modulePermissions[module]?.includes(userRole) || false;
}

/**
 * Get all modules that a user role has access to
 */
export function getAccessibleModules(userRole: UserRole): Module[] {
  return Object.entries(modulePermissions)
    .filter(([_moduleName, allowedRoles]) => allowedRoles.includes(userRole))
    .map(([moduleName]) => moduleName as Module);
}

/**
 * Get the default dashboard page for a user based on their accessible modules
 */
export function getDefaultDashboardPage(userRole: UserRole): string {
  const accessibleModules = getAccessibleModules(userRole);
  
  // Priority order for default pages
  const priorityModules: Module[] = ['sales', 'battle', 'bloodlines', 'breeding', 'analytics', 'search'];
  
  for (const moduleName of priorityModules) {
    if (accessibleModules.includes(moduleName)) {
      switch (moduleName) {
        case 'sales':
          return '/dashboard/sale';
        case 'battle':
          return '/dashboard/battle';
        case 'bloodlines':
          return '/dashboard/bloodlines';
        case 'breeding':
          return '/dashboard/breeding';
        case 'analytics':
          return '/dashboard/analytics';
        case 'search':
          return '/search';
      }
    }
  }
  
  // Fallback to search if no other modules are accessible
  return '/search';
}

/**
 * Get menu configuration based on user role
 */
export function getMenuConfig(userRole: UserRole): Array<{ label: string; href: string }> {
  const accessibleModules = getAccessibleModules(userRole);
  
  const menuItems: Array<{ label: string; href: string; module: Module }> = [
    { label: "Bloodlines", href: "/dashboard/bloodlines", module: "bloodlines" },
    { label: "Breeding Materials", href: "/dashboard/breeding", module: "breeding" },
    { label: "Battle Crosses", href: "/dashboard/battle", module: "battle" },
    { label: "Available For Sale", href: "/dashboard/sale", module: "sales" },
    { label: "Archived Chickens", href: "/dashboard/archived", module: "archived" },
    { label: "Fight Record & Analytics", href: "/dashboard/analytics", module: "analytics" },
    { label: "Search", href: "/search", module: "search" },
  ];

  return menuItems
    .filter(item => accessibleModules.includes(item.module))
    .map(({ label, href }) => ({ label, href }));
} 