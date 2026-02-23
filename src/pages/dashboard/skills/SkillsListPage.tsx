/* ============================================
   Devfolio — Skills List Page (Read-Only)

   Skills and categories are created automatically
   when you add tech_stack to a project. This page
   displays them grouped by category.
   ============================================ */

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Skill } from "@/types";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { Zap } from "lucide-react";

export default function SkillsListPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/skills/?page_size=200");
      // Handle both paginated and plain array responses
      const list: Skill[] = Array.isArray(data) ? data : data.results ?? [];
      setSkills(list);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Group skills by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const key = skill.category || "Uncategorised";
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill);
    return acc;
  }, {});

  return (
    <>
      <Breadcrumbs items={[{ label: "Skills" }]} />
      <PageHeader
        title="Skills"
        description={
          skills.length > 0
            ? `${skills.length} skill${skills.length !== 1 ? "s" : ""} across ${
                Object.keys(grouped).length
              } ${
                Object.keys(grouped).length !== 1 ? "categories" : "category"
              }`
            : "Skills are created automatically when you add tech stack to a project."
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-8 w-8" />}
          title="No skills yet"
          description="Skills and categories are created automatically when you add tech stack to a project."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <section key={category}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-500">
                  {category} ({items.length})
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((skill) => (
                    <Card key={skill.id} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/10 text-brand-400 font-bold text-sm">
                        {skill.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-100 capitalize">
                          {skill.name}
                        </p>
                        <p className="text-xs text-surface-500 capitalize">
                          {skill.category}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
