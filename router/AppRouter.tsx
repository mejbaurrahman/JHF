
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import HomePage from '../pages/public/HomePage';
import Events from '../pages/Events';
import EventDetails from '../pages/EventDetails';
import Donate from '../pages/Donate';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AboutPage from '../pages/public/AboutPage';
import GalleryPage from '../pages/public/GalleryPage';
import ExecutiveCommitteePage from '../pages/public/ExecutiveCommitteePage';
import MembersPage from '../pages/public/MembersPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminEventForm from '../pages/admin/AdminEventForm';
import AdminDonations from '../pages/admin/AdminDonations';
import AdminFees from '../pages/admin/AdminFees';
import AdminExpenses from '../pages/admin/AdminExpenses';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminGallery from '../pages/admin/AdminGallery';
import AdminCMS from '../pages/admin/AdminCMS';
import AdminCommittee from '../pages/admin/AdminCommittee';
import AdminSettings from '../pages/admin/AdminSettings';

// User Dashboard Pages
import UserDashboard from '../pages/user/UserDashboard';
import MyDonations from '../pages/user/MyDonations';
import MyFees from '../pages/user/MyFees';
import MyEvents from '../pages/user/MyEvents';
import UserProfile from '../pages/user/UserProfile';
import Notifications from '../pages/user/Notifications';

import { UserRole } from '../types';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetails />} />
        <Route path="/volunteers/executive" element={<ExecutiveCommitteePage />} />
        <Route path="/volunteers/members" element={<MembersPage />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* User Protected Routes (Dashboard) */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="donations" element={<MyDonations />} />
          <Route path="fees" element={<MyFees />} />
          <Route path="events" element={<MyEvents />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
        <Route element={<AdminLayout />}>
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/admin/events" element={<AdminEvents />} />
             <Route path="/admin/events/new" element={<AdminEventForm />} />
             <Route path="/admin/events/:id/edit" element={<AdminEventForm />} />
             <Route path="/admin/donations" element={<AdminDonations />} />
             <Route path="/admin/fees" element={<AdminFees />} />
             <Route path="/admin/expenses" element={<AdminExpenses />} />
             <Route path="/admin/users" element={<AdminUsers />} />
             <Route path="/admin/gallery" element={<AdminGallery />} />
             <Route path="/admin/cms" element={<AdminCMS />} />
             <Route path="/admin/committee" element={<AdminCommittee />} />
             <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
