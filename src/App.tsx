/* ============================================
   Devfolio — Application Router
   ============================================ */

import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import GuestRoute from "@/components/layout/GuestRoute";

/* ── Auth Pages ── */
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import VerifyEmailPendingPage from "@/pages/auth/VerifyEmailPendingPage";
import VerifyEmailConfirmPage from "@/pages/auth/VerifyEmailConfirmPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordConfirmPage from "@/pages/auth/ResetPasswordConfirmPage";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";

/* ── Dashboard Pages ── */
import DashboardHomePage from "@/pages/dashboard/DashboardHomePage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import ProjectsListPage from "@/pages/dashboard/projects/ProjectsListPage";
import ProjectFormPage from "@/pages/dashboard/projects/ProjectFormPage";
import SkillsListPage from "@/pages/dashboard/skills/SkillsListPage";
import ExperienceListPage from "@/pages/dashboard/experience/ExperienceListPage";
import EducationListPage from "@/pages/dashboard/education/EducationListPage";
import BlogListPage from "@/pages/dashboard/blog/BlogListPage";
import BlogFormPage from "@/pages/dashboard/blog/BlogFormPage";
import CertificationsListPage from "@/pages/dashboard/certifications/CertificationsListPage";
import SocialLinksPage from "@/pages/dashboard/social-links/SocialLinksPage";
import MessagesPage from "@/pages/dashboard/messages/MessagesPage";
import ApiKeysPage from "@/pages/dashboard/api-keys/ApiKeysPage";

/* ── Error Pages ── */
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* ── Guest-only (auth) routes ── */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPendingPage />} />
          <Route
            path="/verify-email/confirm"
            element={<VerifyEmailConfirmPage />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/confirm"
            element={<ResetPasswordConfirmPage />}
          />
        </Route>
      </Route>

      {/* OAuth callback (accessible regardless of auth state) */}
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* ── Protected (dashboard) routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Projects */}
          <Route path="projects" element={<ProjectsListPage />} />
          <Route path="projects/new" element={<ProjectFormPage />} />
          <Route path="projects/:id/edit" element={<ProjectFormPage />} />

          {/* Skills */}
          <Route path="skills" element={<SkillsListPage />} />

          {/* Experience */}
          <Route path="experience" element={<ExperienceListPage />} />

          {/* Education */}
          <Route path="education" element={<EducationListPage />} />

          {/* Blog */}
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/new" element={<BlogFormPage />} />
          <Route path="blog/:id/edit" element={<BlogFormPage />} />

          {/* Certifications */}
          <Route path="certifications" element={<CertificationsListPage />} />

          {/* Social Links */}
          <Route path="social-links" element={<SocialLinksPage />} />

          {/* Messages */}
          <Route path="messages" element={<MessagesPage />} />

          {/* API Keys */}
          <Route path="api-keys" element={<ApiKeysPage />} />
        </Route>
      </Route>

      {/* ── Redirects ── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
