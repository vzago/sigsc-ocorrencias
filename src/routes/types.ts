/**
 * Route type definitions
 * Defines the structure and types used throughout the routing system
 */

export interface RouteConfig {
  path: string;
  label: string;
  element: React.ReactNode;
  isProtected: boolean;
}

export interface NavigationMethods {
  toLogin: () => void;
  toDashboard: () => void;
  toNewOccurrence: () => void;
  toOccurrenceDetails: (id: string) => void;
  navigate: (path: string) => void;
}

export enum RouteNames {
  LOGIN = "LOGIN",
  DASHBOARD = "DASHBOARD",
  NEW_OCCURRENCE = "NEW_OCCURRENCE",
  OCCURRENCE_DETAILS = "OCCURRENCE_DETAILS",
  NOT_FOUND = "NOT_FOUND",
}
