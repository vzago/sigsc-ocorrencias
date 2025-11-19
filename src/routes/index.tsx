import { Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import NewOccurrencePage from "@/pages/NewOccurrencePage";
import OccurrenceDetailsPage from "@/pages/OccurrenceDetailsPage";
import NotFound from "@/pages/NotFound";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./paths";

/**
 * Central route configuration for the application
 * All routes are defined here for better maintainability and organization
 * 
 * Routes are split into two categories:
 * - Public Routes: Accessible without authentication (login, 404)
 * - Protected Routes: Require authentication (dashboard, occurrences)
 */

const appRoutes = [
  // Public Routes
  {
    path: PUBLIC_ROUTES.LOGIN,
    label: "Login",
    element: <LoginPage />,
    isProtected: false,
  },
  
  // Protected Routes
  {
    path: PROTECTED_ROUTES.DASHBOARD,
    label: "Dashboard",
    element: <DashboardPage />,
    isProtected: true,
  },
  {
    path: PROTECTED_ROUTES.NEW_OCCURRENCE,
    label: "Nova Ocorrência",
    element: <NewOccurrencePage />,
    isProtected: true,
  },
  {
    path: PROTECTED_ROUTES.OCCURRENCE_DETAILS(":id"),
    label: "Detalhes da Ocorrência",
    element: <OccurrenceDetailsPage />,
    isProtected: true,
  },
  
  // Catch-all Route
  {
    path: PUBLIC_ROUTES.NOT_FOUND,
    label: "Página não encontrada",
    element: <NotFound />,
    isProtected: false,
  },
];

/**
 * Get protected routes only
 */
export const getProtectedRoutes = () =>
  appRoutes.filter((route) => route.isProtected);

/**
 * Get public routes only
 */
export const getPublicRoutes = () =>
  appRoutes.filter((route) => !route.isProtected);

/**
 * Check if a given path is a protected route
 */
export const isPathProtected = (path: string): boolean => {
  return appRoutes.some((route) => route.path === path && route.isProtected);
};

/**
 * Gets all route elements for rendering in <Routes>
 * Converts route configuration array into Route components
 */
export const getRouteElements = () =>
  appRoutes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={route.element}
    />
  ));

export default getRouteElements;
