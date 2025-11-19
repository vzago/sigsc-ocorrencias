/**
 * Public route paths - accessible without authentication
 */
export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  NOT_FOUND: "*",
} as const;

/**
 * Protected route paths - require authentication
 */
export const PROTECTED_ROUTES = {
  DASHBOARD: "/",
  NEW_OCCURRENCE: "/occurrences/new",
  OCCURRENCE_DETAILS: (id: string) => `/occurrences/${id}`,
} as const;

/**
 * All routes combined for easy access
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
} as const;

/**
 * Type-safe route keys
 */
export type RouteKey = keyof typeof ROUTES;
export type PublicRouteKey = keyof typeof PUBLIC_ROUTES;
export type ProtectedRouteKey = keyof typeof PROTECTED_ROUTES;
