/* ============================================
   Devfolio — Profile / Settings Page
   ============================================ */

import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TextInput,
  TextArea,
  PasswordInput,
  ImageUpload,
} from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import api, { createFormData, uploadConfig } from "@/lib/api";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { extractFieldErrors } from "@/lib/api";
import { Shield, User, Lock } from "lucide-react";
import { labelFromSnake } from "@/lib/utils";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  // Profile form
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    phone_number: "",
    date_of_birth: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {}
  );

  // Password form
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        phone_number: user.phone_number || "",
        date_of_birth: user.date_of_birth || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileLoading(true);

    try {
      const payload: Record<string, unknown> = { ...profile };
      if (avatarFile) payload.avatar = avatarFile;

      await api.patch(
        "/users/update-profile/",
        createFormData(payload),
        uploadConfig()
      );
      await refreshUser();
      toast.success("Profile updated!");
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      console.log(fieldErrors)
      if (fieldErrors) {
        setProfileErrors(fieldErrors);
        return;
      }

      if (isAxiosError(err) && err.response?.data) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          mapped[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setProfileErrors(mapped);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const errs: Record<string, string> = {};
    if (!passwords.current_password)
      errs.current_password = "Current password is required";
    if (!passwords.new_password) errs.new_password = "New password is required";
    else if (passwords.new_password.length < 8)
      errs.new_password = "Must be at least 8 characters";
    if (passwords.new_password !== passwords.new_password_confirm)
      errs.new_password_confirm = "Passwords do not match";

    if (Object.keys(errs).length) {
      setPasswordErrors(errs);
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch(`/users/${user!.id}/change-password/`, passwords);
      toast.success("Password changed! You may need to log in again.");
      setPasswords({
        current_password: "",
        new_password: "",
        new_password_confirm: "",
      });
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      console.log(fieldErrors)
      if (fieldErrors) {
        
        setPasswordErrors(fieldErrors);
        return;
      }

      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data;

        if (data.message && !data.errors) {
          toast.error(data.message);
          return;
        }

        // If backend sends validation errors
        if (data.errors) {
          const mapped: Record<string, string> = {};

          Object.entries(data.errors).forEach(([key, val]) => {
            mapped[key] = Array.isArray(val) ? val[0] : String(val);
          });

          setPasswordErrors(mapped);
          return;
        }

        toast.error("Validation failed.");
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <PageHeader
        title="Profile & Settings"
        description="Manage your account information and security"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Profile info card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <ImageUpload
                  value={user?.avatar}
                  onChange={setAvatarFile}
                  previewSize="lg"
                />
              </div>
              <h3 className="text-lg font-semibold text-surface-100">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-sm text-surface-400">{user?.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant={user?.email_verified ? "success" : "warning"}
                  dot>
                  {user?.email_verified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant="info">
                  {labelFromSnake(user?.auth_provider || "email")}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand-400" aria-hidden="true" />
                <CardTitle>Personal Information</CardTitle>
              </div>
            </CardHeader>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  label="First name"
                  value={profile.first_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, first_name: e.target.value }))
                  }
                  error={profileErrors.first_name}
                  required
                />
                <TextInput
                  label="Last name"
                  value={profile.last_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, last_name: e.target.value }))
                  }
                  error={profileErrors.last_name}
                  required
                />
              </div>

              <TextInput
                label="Email"
                value={user?.email || ""}
                disabled
                hint="Email cannot be changed"
              />

              <TextArea
                label="Bio"
                value={profile.bio}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, bio: e.target.value }))
                }
                error={profileErrors.bio}
                placeholder="Tell the world about yourself…"
                rows={4}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  label="Phone Number"
                  type="tel"
                  value={profile.phone_number}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone_number: e.target.value }))
                  }
                  error={profileErrors.phone_number}
                  placeholder="+1 (555) 000-0000"
                />
                <TextInput
                  label="Date of birth"
                  type="date"
                  value={profile.date_of_birth}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, date_of_birth: e.target.value }))
                  }
                  error={profileErrors.date_of_birth}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={profileLoading}>
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Password change */}
          {user?.auth_provider === "email" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock
                    className="h-5 w-5 text-warning-500"
                    aria-hidden="true"
                  />
                  <CardTitle>Change Password</CardTitle>
                </div>
              </CardHeader>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <PasswordInput
                  label="Current password"
                  value={passwords.current_password}
                  onChange={(e) =>
                    setPasswords((p) => ({
                      ...p,
                      current_password: e.target.value,
                    }))
                  }
                  error={passwordErrors.current_password}
                  autoComplete="current-password"
                  required
                />
                <PasswordInput
                  label="New password"
                  value={passwords.new_password}
                  onChange={(e) =>
                    setPasswords((p) => ({
                      ...p,
                      new_password: e.target.value,
                    }))
                  }
                  error={passwordErrors.new_password}
                  autoComplete="new-password"
                  required
                />
                <PasswordInput
                  label="Confirm new password"
                  value={passwords.new_password_confirm}
                  onChange={(e) =>
                    setPasswords((p) => ({
                      ...p,
                      new_password_confirm: e.target.value,
                    }))
                  }
                  error={passwordErrors.new_password_confirm}
                  autoComplete="new-password"
                  required
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    loading={passwordLoading}
                    variant="secondary">
                    Update password
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Account info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-info-500" aria-hidden="true" />
                <CardTitle>Account Security</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-surface-800/30 px-4 py-3">
                <span className="text-surface-400">Auth Provider</span>
                <Badge variant="info">
                  {labelFromSnake(user?.auth_provider || "email")}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-800/30 px-4 py-3">
                <span className="text-surface-400">Email Verification</span>
                <Badge
                  variant={user?.email_verified ? "success" : "warning"}
                  dot>
                  {user?.email_verified ? "Verified" : "Pending"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
