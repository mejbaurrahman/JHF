import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import LoadingScreen from "./LoadingScreen";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen fullScreen={true} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role comparison - handle both enum and string values
  if (allowedRoles && allowedRoles.length > 0) {
    // Get user role as string value (enum values are 'admin' or 'user')
    const userRoleStr = String(user.role || "")
      .toLowerCase()
      .trim();

    // Check if user role matches any allowed role by comparing string values
    const hasAccess = allowedRoles.some((allowedRole) => {
      // Convert allowed role to string value for comparison
      const allowedRoleStr = String(allowedRole || "")
        .toLowerCase()
        .trim();

      // Compare string values directly (UserRole.ADMIN = 'admin', UserRole.USER = 'user')
      return allowedRoleStr === userRoleStr && userRoleStr !== "";
    });
    console.log(user);
    if (!hasAccess) {
      // User doesn't have required role - redirect to home
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
