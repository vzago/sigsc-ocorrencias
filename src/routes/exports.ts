/**
 * Routes module - Central exports for all routing functionality
 */

// Route configuration
export { 
  getRouteElements, 
  getProtectedRoutes, 
  getPublicRoutes,
  isPathProtected 
} from "./index";

// Route paths and constants
export { 
  ROUTES,
  PUBLIC_ROUTES, 
  PROTECTED_ROUTES,
  type RouteKey,
  type PublicRouteKey,
  type ProtectedRouteKey,
} from "./paths";

// Navigation hooks
export { 
  useNavigation, 
  useNav 
} from "./hooks";

// Type definitions
export type { 
  RouteConfig, 
  NavigationMethods 
} from "./types";
export { 
  RouteNames 
} from "./types";
