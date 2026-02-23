/* ============================================
   Devfolio — Projects List Page
   ============================================ */

import { useEffect, useState, useCallback } from "react";
// Robust helper to extract UUID from project.id if it's a URL
function extractId(project: Project) {
  if (typeof project.id === "string" && project.id.includes("/")) {
    // Match UUID in the URL
    const match = project.id.match(/[0-9a-fA-F-]{36}/);
    return match ? match[0] : project.id;
  }
  return project.id;
}
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { Project, PaginatedResponse } from "@/types";
import Card from "@/components/ui/Card";
// import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { TextInput, SelectInput } from "@/components/ui/FormFields";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  // Star,
  Search,
  FolderKanban,
} from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import toast from "react-hot-toast";

// const statusVariant: Record<
//   string,
//   "success" | "warning" | "info" | "default"
// > = {
//   completed: "success",
//   in_progress: "warning",
//   planning: "info",
//   archived: "default",
// };

const PAGE_SIZE = 9;

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", String(PAGE_SIZE));
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("project_type", typeFilter);

      const { data } = await api.get<PaginatedResponse<Project>>(
        `/projects/my-projects/?${params}`
      );
      setProjects(data.results);
      setTotal(data.count);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${extractId(deleteTarget)}/delete-project/`);
      toast.success("Project deleted");
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Breadcrumbs items={[{ label: "Projects" }]} />
      <PageHeader
        title="Projects"
        description={`${total} project${total !== 1 ? "s" : ""} total`}
        actions={
          <Button
            onClick={() => navigate("/dashboard/projects/new")}
            icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextInput
              placeholder="Search projects…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {/* <SelectInput
            options={[
              { value: "", label: "All statuses" },
              { value: "planning", label: "Planning" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
          <SelectInput
            options={[
              { value: "", label: "All types" },
              { value: "personal", label: "Personal" },
              { value: "client", label: "Client" },
              { value: "open_source", label: "Open Source" },
              { value: "academic", label: "Academic" },
            ]}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          /> */}
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <SkeletonList count={6} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={
            search ? (
              <Search className="h-8 w-8" />
            ) : (
              <FolderKanban className="h-8 w-8" />
            )
          }
          title={search ? "No projects found" : "No projects yet"}
          description={
            search
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"
          }
          action={
            !search
              ? {
                  label: "Create Project",
                  onClick: () => navigate("/dashboard/projects/new"),
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                hover
                padding="none"
                className="overflow-hidden">
                {/* Thumbnail */}
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="h-40 w-full object-cover border-b border-surface-800"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center border-b border-surface-800 bg-surface-800/30">
                    <FolderKanban
                      className="h-10 w-10 text-surface-600"
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div className="p-5">
                  {/* <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant={statusVariant[project.status] || "default"}
                      dot>
                      {labelFromSnake(project.status)}
                    </Badge>
                    <Badge>{labelFromSnake(project.project_type)}</Badge>
                    {project.featured && (
                      <Star
                        className="h-4 w-4 text-warning-500 fill-warning-500"
                        aria-label="Featured"
                      />
                    )}
                  </div> */}

                  <h3 className="text-base font-semibold text-surface-100 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-surface-400 mb-3">
                    {truncate(project.description, 100)}
                  </p>

                  {/* Tech tags */}
                  {project.tech_stack_display &&
                    project.tech_stack_display.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {project.tech_stack_display.slice(0, 4).map((tech) => (
                          <span
                            key={`${tech.name}-${tech.category}`}
                            className="rounded-md bg-surface-800 px-2 py-0.5 text-xs text-surface-400">
                            {tech.name}
                          </span>
                        ))}
                        {project.tech_stack_display.length > 4 && (
                          <span className="text-xs text-surface-500">
                            +{project.tech_stack_display.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                  {/* <div className="text-xs text-surface-500 mb-4">
                    {formatDate(project.start_date)} —{" "}
                    {formatDate(project.end_date, "Present")}
                  </div> */}

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-surface-800 pt-3">
                    <Link
                      to={`/dashboard/projects/${extractId(project)}/edit`}
                      className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-surface-300 hover:bg-surface-800 transition-colors">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                    </Link>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-surface-300 hover:bg-surface-800 transition-colors">
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />{" "}
                        Live
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-surface-300 hover:bg-surface-800 transition-colors">
                        <Github className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                        Code
                      </a>
                    )}
                    <button
                      onClick={() => setDeleteTarget(project)}
                      className="ml-auto flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-danger-500 hover:bg-danger-500/10 transition-colors cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}
