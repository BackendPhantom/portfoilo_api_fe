/* ============================================
   Devfolio — Dashboard Home Page
   ============================================ */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import type { DashboardStats } from "@/types";
import {
  FolderKanban,
  Zap,
  FileText,
  Mail,
  Briefcase,
  Award,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardStats>("/stats/")
      .then(({ data }) => setStats(data))
      .catch(() => {
        // Use fallback data for demo
        setStats({
          total_projects: 0,
          total_skills: 0,
          total_blog_posts: 0,
          unread_messages: 0,
          total_experiences: 0,
          total_certifications: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards: StatCard[] = stats
    ? [
        {
          label: "Projects",
          value: stats.total_projects,
          icon: <FolderKanban className="h-5 w-5" />,
          href: "/dashboard/projects",
          color: "text-brand-400 bg-brand-500/10",
        },
        {
          label: "Skills",
          value: stats.total_skills,
          icon: <Zap className="h-5 w-5" />,
          href: "/dashboard/skills",
          color: "text-warning-500 bg-warning-500/10",
        },
        {
          label: "Blog Posts",
          value: stats.total_blog_posts,
          icon: <FileText className="h-5 w-5" />,
          href: "/dashboard/blog",
          color: "text-success-500 bg-success-500/10",
        },
        {
          label: "Unread Messages",
          value: stats.unread_messages,
          icon: <Mail className="h-5 w-5" />,
          href: "/dashboard/messages",
          color: "text-danger-500 bg-danger-500/10",
        },
        {
          label: "Experience",
          value: stats.total_experiences,
          icon: <Briefcase className="h-5 w-5" />,
          href: "/dashboard/experience",
          color: "text-info-500 bg-info-500/10",
        },
        {
          label: "Certifications",
          value: stats.total_certifications,
          icon: <Award className="h-5 w-5" />,
          href: "/dashboard/certifications",
          color: "text-purple-400 bg-purple-500/10",
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your portfolio data"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="mt-3 h-4 w-24" />
              </Card>
            ))
          : statCards.map((stat) => (
              <Link key={stat.label} to={stat.href}>
                <Card hover className="group">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <span className="text-3xl font-bold text-surface-100">
                      {stat.value}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-surface-400">
                      {stat.label}
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 text-surface-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-surface-400"
                      aria-hidden="true"
                    />
                  </div>
                </Card>
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "New Project",
              href: "/dashboard/projects/new",
              icon: <FolderKanban className="h-4 w-4" />,
            },
            {
              label: "Write Post",
              href: "/dashboard/blog/new",
              icon: <FileText className="h-4 w-4" />,
            },
            {
              label: "Add Skill",
              href: "/dashboard/skills/new",
              icon: <Zap className="h-4 w-4" />,
            },
            {
              label: "View Messages",
              href: "/dashboard/messages",
              icon: <Mail className="h-4 w-4" />,
            },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center gap-3 rounded-lg border border-surface-800 bg-surface-800/30 px-4 py-3 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100 hover:border-surface-700">
              <span className="text-brand-400">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </Card>

      {/* Activity Placeholder */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 rounded-full bg-surface-800 p-3">
            <TrendingUp
              className="h-6 w-6 text-surface-500"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-surface-400">
            Your recent activity will appear here
          </p>
          <p className="text-xs text-surface-500 mt-1">
            Start by creating a project or writing a blog post
          </p>
        </div>
      </Card>
    </>
  );
}
