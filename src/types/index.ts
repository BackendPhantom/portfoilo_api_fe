/* ============================================
   Devfolio — Type Definitions
   ============================================ */

// ---- User & Auth ----
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string;
  phone_number: string;
  date_of_birth: string | null;
  email_verified: boolean;
  auth_provider: "email" | "google" | "github";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PasswordChangePayload {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
  confirm_new_password: string;
}

// ---- Profile ----
export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
  date_of_birth?: string | null;
  avatar?: File | null;
}

// ---- Project ----
// export type ProjectType = "personal" | "client" | "open_source" | "academic";
// export type ProjectStatus =
//   | "planning"
//   | "in_progress"
//   | "completed"
//   | "archived";

export interface Project {
  id: number;
  title: string;
  // slug: string;
  description: string;
  // short_description: string;
  // project_type: ProjectType;
  // status: ProjectStatus;
  featured: boolean;
  live_url: string;
  github_url: string;
  thumbnail: string | null;
  tech_stack_display: TechSkill[];
  // start_date: string | null;
  // end_date: string | null;
  // order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectPayload {
  title: string;
  description: string;
  short_description?: string;
  // project_type: ProjectType;
  // status: ProjectStatus;
  featured?: boolean;
  live_url?: string;
  source_code_url?: string;
  thumbnail?: File | null;
  tech_stack?: TechSkill[];
  start_date?: string | null;
  end_date?: string | null;
  // order?: number;
}

// ---- Skill / Tech Stack ----
/** What the backend returns for project tech_stack_display */
export interface TechSkill {
  name: string;
  category: string;
}

/** What the skills list endpoint returns */
export interface Skill {
  id: number;
  name: string;
  category: string;
}

// ---- Experience ----
export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "freelance"
  | "internship";

export interface Experience {
  id: number;
  company: string;
  role: string;
  description: string;
  employment_type: EmploymentType;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  company_url: string;
  location: string;
  technologies: Skill[];
  order: number;
}

export interface ExperiencePayload {
  company: string;
  role: string;
  description?: string;
  employment_type: EmploymentType;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  company_url?: string;
  location?: string;
  technology_ids?: number[];
  order?: number;
}

// ---- Education ----
export interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  grade: string;
  description: string;
  order: number;
}

export interface EducationPayload {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  grade?: string;
  description?: string;
  order?: number;
}

// ---- Blog Post ----
export type PostStatus = "draft" | "published" | "archived";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  status: PostStatus;
  tags: string[];
  published_at: string | null;
  reading_time: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: File | null;
  status: PostStatus;
  tags?: string[];
}

// ---- Contact Message ----
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ---- Certification ----
export interface Certification {
  id: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string;
  credential_url: string;
  image: string | null;
  order: number;
}

export interface CertificationPayload {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string | null;
  credential_id?: string;
  credential_url?: string;
  image?: File | null;
  order?: number;
}

// ---- Social Link ----
export type SocialPlatform =
  | "github"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "dev_to"
  | "medium"
  | "personal_website"
  | "other";

export interface SocialLink {
  id: number;
  platform: SocialPlatform;
  url: string;
  icon: string | null;
  order: number;
}

export interface SocialLinkPayload {
  platform: SocialPlatform;
  url: string;
  icon?: File | null;
  order?: number;
}

// ---- API Key ----
export interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  is_active: boolean;
  expires_at: string;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreatePayload {
  name: string;
  expires_in_days: number;
}

export interface ApiKeyCreateResponse {
  key: string;
  api_key: ApiKey;
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  total_projects: number;
  total_skills: number;
  total_blog_posts: number;
  unread_messages: number;
  total_experiences: number;
  total_certifications: number;
}
