/* ============================================
   Devfolio — Skills List Page

   Technical skills are created automatically when
   you add tech_stack to a project. Soft skills
   can be created and deleted manually.
   ============================================ */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { Skill } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { Zap, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SkillsListPage() {
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/skills/?page_size=200");
      // Handle both paginated and plain array responses
      const list: Skill[] = Array.isArray(data) ? data : data.results ?? [];
      setAllSkills(list);
    } catch {
      setAllSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/skills/${deleteTarget.id}/`);
      toast.success("Soft skill deleted");
      setDeleteTarget(null);
      fetchSkills();
    } catch {
      toast.error("Failed to delete soft skill");
    } finally {
      setDeleting(false);
    }
  };

  // Split into soft skills and technical skills by category
  const softSkills = allSkills.filter((s) => s.category === "soft skills");
  const technicalSkills = allSkills.filter((s) => s.category !== "soft skills");

  // Group technical skills by sub_category
  const grouped = technicalSkills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      const key = skill.sub_category || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(skill);
      return acc;
    },
    {}
  );

  const totalCount = allSkills.length;

  return (
    <>
      <Breadcrumbs items={[{ label: "Skills" }]} />
      <PageHeader
        title="Skills"
        description={
          totalCount > 0
            ? `${totalCount} skill${totalCount !== 1 ? "s" : ""} total`
            : "Skills are created automatically when you add tech stack to a project."
        }
        actions={
          <Button
            onClick={() => navigate("/dashboard/skills/soft-skills/new")}
            icon={<Plus className="h-4 w-4" />}>
            New Soft Skill
          </Button>
        }
      />

      {loading ? (
        <SkeletonList count={6} />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={<Zap className="h-8 w-8" />}
          title="No skills yet"
          description="Skills and categories are created automatically when you add tech stack to a project. You can also add soft skills manually."
        />
      ) : (
        <div className="space-y-8">
          {/* ── Soft Skills ── */}
          {softSkills.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-500">
                Soft Skills ({softSkills.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {softSkills.map((skill) => (
                  <Card key={skill.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/10 text-brand-400 font-bold text-sm">
                      {skill.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-100 capitalize">
                        {skill.name}
                      </p>
                      <p className="text-xs text-surface-500">Soft Skill</p>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(skill)}
                      className="rounded-lg p-1.5 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                      aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* ── Technical Skills (grouped by sub_category) ── */}
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([subCategory, items]) => (
              <section key={subCategory}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-500">
                  {subCategory} ({items.length})
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
                          {skill.sub_category || skill.category}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Soft Skill"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}
