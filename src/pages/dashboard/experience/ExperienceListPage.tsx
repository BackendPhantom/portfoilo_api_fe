/* ============================================
   Devfolio — Experience List Page
   ============================================ */

import { useEffect, useState, useCallback } from "react";
// react-router-dom not needed here
import api from "@/lib/api";
import type {
  Experience,
  PaginatedResponse,
  Skill,
  EmploymentType,
} from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import {
  TextInput,
  TextArea,
  SelectInput,
  Toggle,
  TagInput,
} from "@/components/ui/FormFields";
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { formatDate, labelFromSnake } from "@/lib/utils";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

const employmentOptions = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

export default function ExperienceListPage() {
  // const navigate = useNavigate();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState({
    company: "",
    role: "",
    description: "",
    employment_type: "full_time" as EmploymentType,
    start_date: "",
    end_date: "",
    is_current: false,
    company_url: "",
    location: "",
    order: "0",
  });
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Experience>>(
        "/experiences/?page_size=100&ordering=-start_date"
      );
      setExperiences(data.results || []);
    } catch {
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
    api
      .get<{ results: Skill[] }>("/skills/?page_size=200")
      .then(({ data }) => setAllSkills(data.results || []))
      .catch(() => {});
  }, [fetchExperiences]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      company: "",
      role: "",
      description: "",
      employment_type: "full_time",
      start_date: "",
      end_date: "",
      is_current: false,
      company_url: "",
      location: "",
      order: "0",
    });
    setSelectedTechs([]);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (exp: Experience) => {
    setEditing(exp);
    setForm({
      company: exp.company,
      role: exp.role,
      description: exp.description || "",
      employment_type: exp.employment_type,
      start_date: exp.start_date,
      end_date: exp.end_date || "",
      is_current: exp.is_current,
      company_url: exp.company_url || "",
      location: exp.location || "",
      order: String(exp.order),
    });
    setSelectedTechs(exp.technologies.map((t) => t.name));
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.company) errs.company = "Company is required";
    if (!form.role) errs.role = "Role is required";
    if (!form.start_date) errs.start_date = "Start date is required";
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const techIds = allSkills
        .filter((s) => selectedTechs.includes(s.name))
        .map((s) => s.id);
      const payload = {
        ...form,
        end_date: form.is_current ? null : form.end_date || null,
        order: Number(form.order) || 0,
        technology_ids: techIds,
      };

      if (editing) {
        await api.patch(`/experiences/${editing.id}/`, payload);
        toast.success("Experience updated!");
      } else {
        await api.post("/experiences/", payload);
        toast.success("Experience added!");
      }
      setModalOpen(false);
      fetchExperiences();
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          mapped[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setFormErrors(mapped);
      } else {
        toast.error("Failed to save experience");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/experiences/${deleteTarget.id}/`);
      toast.success("Experience deleted");
      setDeleteTarget(null);
      fetchExperiences();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Experience" }]} />
      <PageHeader
        title="Experience"
        description={`${experiences.length} position${
          experiences.length !== 1 ? "s" : ""
        }`}
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
            Add Experience
          </Button>
        }
      />

      {loading ? (
        <SkeletonList count={3} />
      ) : experiences.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8" />}
          title="No experience yet"
          description="Add your work history"
          action={{ label: "Add Experience", onClick: openCreate }}
        />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-px bg-surface-800 hidden sm:block"
            aria-hidden="true"
          />

          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative sm:pl-14">
                {/* Timeline dot */}
                <div
                  className="absolute left-3.5 top-6 hidden h-3 w-3 rounded-full border-2 border-brand-500 bg-surface-950 sm:block"
                  aria-hidden="true"
                />

                <Card hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-surface-100">
                          {exp.role}
                        </h3>
                        <Badge variant="brand">
                          {labelFromSnake(exp.employment_type)}
                        </Badge>
                        {exp.is_current && (
                          <Badge variant="success" dot>
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-surface-400 mb-2">
                        <span className="font-medium text-surface-300">
                          {exp.company}
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {exp.location}
                          </span>
                        )}
                        {exp.company_url && (
                          <a
                            href={exp.company_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-400 hover:text-brand-300">
                            <ExternalLink className="h-3.5 w-3.5" /> Website
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-surface-500 mb-2">
                        {formatDate(exp.start_date)} —{" "}
                        {exp.is_current ? "Present" : formatDate(exp.end_date)}
                      </p>

                      {exp.description && (
                        <p className="text-sm text-surface-400 line-clamp-2">
                          {exp.description}
                        </p>
                      )}

                      {exp.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {exp.technologies.map((t) => (
                            <span
                              key={t.id}
                              className="rounded-md bg-surface-800 px-2 py-0.5 text-xs text-surface-400">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(exp)}
                        className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 cursor-pointer"
                        aria-label={`Edit ${exp.role}`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(exp)}
                        className="rounded-lg p-1.5 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                        aria-label={`Delete ${exp.role}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Experience" : "Add Experience"}
        size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Company"
              value={form.company}
              onChange={(e) =>
                setForm((p) => ({ ...p, company: e.target.value }))
              }
              error={formErrors.company}
              required
            />
            <TextInput
              label="Role"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              error={formErrors.role}
              required
            />
          </div>
          <SelectInput
            label="Employment Type"
            options={employmentOptions}
            value={form.employment_type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                employment_type: e.target.value as EmploymentType,
              }))
            }
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={4}
            placeholder="Describe your responsibilities…"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, start_date: e.target.value }))
              }
              error={formErrors.start_date}
              required
            />
            {!form.is_current && (
              <TextInput
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, end_date: e.target.value }))
                }
              />
            )}
          </div>
          <Toggle
            label="I currently work here"
            checked={form.is_current}
            onChange={(val) =>
              setForm((p) => ({
                ...p,
                is_current: val,
                end_date: val ? "" : p.end_date,
              }))
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Location"
              value={form.location}
              onChange={(e) =>
                setForm((p) => ({ ...p, location: e.target.value }))
              }
              placeholder="San Francisco, CA"
            />
            <TextInput
              label="Company URL"
              type="url"
              value={form.company_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, company_url: e.target.value }))
              }
              placeholder="https://company.com"
            />
          </div>
          <TagInput
            label="Technologies"
            value={selectedTechs}
            onChange={setSelectedTechs}
            suggestions={allSkills.map((s) => s.name)}
          />
          <TextInput
            label="Display Order"
            type="number"
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
            min={0}
          />
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {editing ? "Update" : "Create"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Experience"
        message={`Delete "${deleteTarget?.role} at ${deleteTarget?.company}"?`}
        loading={deleting}
      />
    </>
  );
}
