/**
 * Navigation utility functions for handling active states, pathname checking, and routing
 */

/**
 * Checks if a link should be considered active based on current pathname
 */
export function isLinkActive(
  pathname: string,
  href: string,
  exact: boolean = false,
): boolean {
  if (exact) {
    return pathname === href;
  }

  // For non-exact matching, check if pathname starts with href
  // But avoid matching root "/" with everything
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

/**
 * Gets CSS classes for navigation links based on active state
 */
export function getNavLinkClasses(
  pathname: string,
  href: string,
  baseClasses: string = "",
  activeClasses: string = "text-blue-600",
  inactiveClasses: string = "text-gray-600 hover:text-gray-900",
  exact: boolean = false,
): string {
  const isActive = isLinkActive(pathname, href, exact);
  const statusClasses = isActive ? activeClasses : inactiveClasses;

  return `${baseClasses} ${statusClasses}`.trim();
}

/**
 * Extracts project ID from pathname if present
 */
export function extractProjectIdFromPath(pathname: string): string | null {
  const projectMatch = pathname.match(/\/projects\/([^\/]+)/);
  return projectMatch ? projectMatch[1] : null;
}

/**
 * Checks if the current route is within a project context
 */
export function isInProjectContext(pathname: string): boolean {
  return (
    pathname.startsWith("/projects/") &&
    extractProjectIdFromPath(pathname) !== null
  );
}

/**
 * Builds a navigation item with computed active state
 */
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  isActive?: boolean;
  exact?: boolean;
}

export function buildNavigationItems(
  items: Omit<NavigationItem, "isActive">[],
  pathname: string,
): NavigationItem[] {
  return items.map((item) => ({
    ...item,
    isActive: isLinkActive(pathname, item.href, item.exact || false),
  }));
}
