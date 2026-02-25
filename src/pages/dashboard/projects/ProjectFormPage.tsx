/* ============================================
   Devfolio — Project Form Page (Create / Edit)
   ============================================ */

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { uploadConfig } from "@/lib/api";
import type { Project, TechSkill } from "@/types";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TextInput,
  TextArea,
  // SelectInput,
  // Toggle,
  // ImageUpload,
} from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { extractFieldErrors } from "@/lib/api";
import { Save, ArrowLeft } from "lucide-react";

// const projectTypeOptions = [
//   { value: "personal", label: "Personal" },
//   { value: "client", label: "Client" },
//   { value: "open_source", label: "Open Source" },
//   { value: "academic", label: "Academic" },
// ];

// const statusOptions = [
//   { value: "planning", label: "Planning" },
//   { value: "in_progress", label: "In Progress" },
//   { value: "completed", label: "Completed" },
//   { value: "archived", label: "Archived" },
// ];

export default function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    // short_description: "",
    // project_type: "personal" as ProjectType,
    // status: "planning" as ProjectStatus,
    // featured: false,
    live_url: "",
    github_url: "",
    // start_date: "",
    // end_date: "",
    // order: 0,
  });
  // const [thumbnail, setThumbnail] = useState<File | null>(null);
  // const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [techStack, setTechStack] = useState<TechSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing project on edit
  useEffect(() => {
    if (!isEdit) return;
    setFetchLoading(true);
    api
      .get<Project>(`/projects/${id}/details/`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          // short_description: data.short_description || "",
          // project_type: data.project_type,
          // status: data.status,
          // featured: data.featured,
          live_url: data.live_url || "",
          github_url: data.github_url || "",
          // start_date: data.start_date || "",
          // end_date: data.end_date || "",
          // order: data.order,
        });
        // setThumbnailPreview(data.thumbnail);
        setTechStack(data.tech_stack_display || []);
      })
      .catch(() => toast.error("Failed to load project"))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const update =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!form.title) {
      setErrors({ title: "Title is required" });
      return;
    }
    if (!form.description) {
      setErrors({ description: "Description is required" });
      return;
    }

    setLoading(true);
    try {
      // If you add file upload (thumbnail), switch to FormData
      // For now, send as JSON
      const payload = {
        ...form,
        tech_stack: techStack,
      };

      if (isEdit) {
        await api.patch(`/projects/${id}/update-project/`, payload);
        toast.success("Project updated!");
      } else {
        await api.post("/projects/create-new/", payload);
        toast.success("Project created!");
      }
      navigate("/dashboard/projects");
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
        return;
      }

      if (isAxiosError(err) && err.response?.data) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          mapped[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setErrors(mapped);
      } else {
        toast.error("Failed to save project");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/dashboard/projects" },
          { label: isEdit ? "Edit Project" : "New Project" },
        ]}
      />
      <PageHeader
        title={isEdit ? "Edit Project" : "New Project"}
        actions={
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/projects")}
            icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <TextInput
              label="Title"
              value={form.title}
              onChange={update("title")}
              error={errors.title}
              placeholder="My Awesome Project"
              required
            />

            {/* <TextInput
              label="Short Description"
              value={form.short_description}
              onChange={update("short_description")}
              error={errors.short_description}
              placeholder="A brief one-liner…"
              hint="Max 300 characters"
              maxLength={300}
            /> */}

            <TextArea
              label="Description"
              value={form.description}
              onChange={update("description")}
              error={errors.description}
              placeholder="Detailed description of your project (supports markdown)…"
              rows={8}
              required
            />

            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput
                label="Project Type"
                options={projectTypeOptions}
                value={form.project_type}
                onChange={update("project_type")}
              />
              <SelectInput
                label="Status"
                options={statusOptions}
                value={form.status}
                onChange={update("status")}
              />
            </div> */}

            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={update("start_date")}
              />
              <TextInput
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={update("end_date")}
              />
            </div> */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="Live URL"
                type="url"
                value={form.live_url}
                onChange={update("live_url")}
                error={errors.live_url}
                placeholder="https://example.com"
              />
              <TextInput
                label="Source Code URL"
                type="url"
                value={form.github_url}
                onChange={update("github_url")}
                error={errors.github_url}
                placeholder="https://github.com/…"
              />
            </div>

            <TechStackInput value={techStack} onChange={setTechStack} />

            {/* <ImageUpload
              label="Thumbnail"
              value={thumbnailPreview}
              onChange={setThumbnail}
            /> */}

            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
             <TextInput
                label="Display Order"
                type="number"
                value={String(form.order)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, order: Number(e.target.value) }))
                }
                min={0}
              />
              <div className="flex items-end pb-2">
                <Toggle
                  label="Featured project"
                  checked={form.featured}
                  onChange={(val) => setForm((p) => ({ ...p, featured: val }))}
                />
              </div> 
            </div>*/}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/projects")}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={<Save className="h-4 w-4" />}>
            {isEdit ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </>
  );
}

/* ── Tech Stack inline editor ── */

import { Plus as PlusIcon, X } from "lucide-react";

function TechStackInput({
  value,
  onChange,
}: {
  value: TechSkill[];
  onChange: (v: TechSkill[]) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const add = () => {
    const n = name.trim().toLowerCase();
    const c = category.trim().toLowerCase();
    if (!n || !c) return;
    if (value.some((t) => t.name === n && t.category === c)) return;
    onChange([...value, { name: n, category: c }]);
    setName("");
    setCategory("");
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-surface-300">
        Tech Stack
      </label>

      {/* Existing tags */}
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((t, i) => (
            <span
              key={`${t.name}-${t.category}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600/20 px-2.5 py-1 text-xs font-medium text-brand-400">
              <span>{t.name}</span>
              <span className="text-brand-600">·</span>
              <span className="text-brand-500/70">{t.category}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-0.5 text-brand-400 hover:text-brand-300 cursor-pointer"
                aria-label={`Remove ${t.name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add new row */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skill name (e.g. react)"
            className="w-full rounded-lg border border-surface-700 bg-surface-800/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Category (e.g. framework)"
            className="w-full rounded-lg border border-surface-700 bg-surface-800/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!name.trim() || !category.trim()}
          className="flex h-[38px] items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Add tech">
          <PlusIcon className="h-4 w-4" /> Add
        </button>
      </div>
      <p className="mt-1.5 text-xs text-surface-500">
        Type a skill name and its category, then press Enter or click Add.
      </p>
    </div>
  );
}
