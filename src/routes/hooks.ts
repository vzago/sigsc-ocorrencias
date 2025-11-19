/**
 * Custom hooks for route navigation
 * Provides type-safe, semantic navigation methods
 */

import { useNavigate as useReactRouterNavigate } from "react-router-dom";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./paths";

/**
 * useNavigation hook - provides semantic route navigation
 * 
 * Usage:
 * const nav = useNavigation();
 * nav.toLogin();
 * nav.toDashboard();
 * nav.toOccurrenceDetails("123");
 */
export const useNavigation = () => {
  const navigate = useReactRouterNavigate();

  return {
    // Public routes
    toLogin: () => navigate(PUBLIC_ROUTES.LOGIN),
    
    // Protected routes
    toDashboard: () => navigate(PROTECTED_ROUTES.DASHBOARD),
    toNewOccurrence: () => navigate(PROTECTED_ROUTES.NEW_OCCURRENCE),
    toOccurrenceDetails: (id: string) =>
      navigate(PROTECTED_ROUTES.OCCURRENCE_DETAILS(id)),
    
    // Raw navigate for custom paths
    navigate: (path: string) => navigate(path),
  };
};

/**
 * Re-export navigate hook with alias
 */
export const useNav = useNavigation;
