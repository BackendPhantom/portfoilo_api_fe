/* ============================================
   Devfolio — Education List Page
   ============================================ */

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Education, PaginatedResponse } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { TextInput, TextArea, Toggle } from "@/components/ui/FormFields";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

export default function EducationListPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    is_current: false,
    grade: "",
    description: "",
    order: "0",
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Education>>(
        "/education/?page_size=100&ordering=-start_date"
      );
      setItems(data.results || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      is_current: false,
      grade: "",
      description: "",
      order: "0",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: Education) => {
    setEditing(item);
    setForm({
      institution: item.institution,
      degree: item.degree,
      field_of_study: item.field_of_study || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      is_current: item.is_current,
      grade: item.grade || "",
      description: item.description || "",
      order: String(item.order),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.institution) errs.institution = "Required";
    if (!form.degree) errs.degree = "Required";
    if (!form.start_date) errs.start_date = "Required";
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        end_date: form.is_current ? null : form.end_date || null,
        order: Number(form.order) || 0,
      };
      if (editing) {
        await api.patch(`/education/${editing.id}/`, payload);
        toast.success("Updated!");
      } else {
        await api.post("/education/", payload);
        toast.success("Added!");
      }
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          mapped[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setFormErrors(mapped);
      } else {
        toast.error("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/education/${deleteTarget.id}/`);
      toast.success("Deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Education" }]} />
      <PageHeader
        title="Education"
        description={`${items.length} entries`}
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
            Add Education
          </Button>
        }
      />

      {loading ? (
        <SkeletonList count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8" />}
          title="No education yet"
          description="Add your educational background"
          action={{ label: "Add Education", onClick: openCreate }}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600/10 text-brand-400 shrink-0">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-100">
                      {item.degree}
                    </h3>
                    <p className="text-sm text-surface-300">
                      {item.institution}
                    </p>
                    {item.field_of_study && (
                      <p className="text-sm text-surface-400">
                        {item.field_of_study}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-surface-500">
                      {formatDate(item.start_date)} —{" "}
                      {item.is_current ? "Present" : formatDate(item.end_date)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {item.grade && <Badge variant="info">{item.grade}</Badge>}
                      {item.is_current && (
                        <Badge variant="success" dot>
                          Current
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-2 text-sm text-surface-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 cursor-pointer"
                    aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-lg p-1.5 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                    aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Education" : "Add Education"}
        size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <TextInput
            label="Institution"
            value={form.institution}
            onChange={(e) =>
              setForm((p) => ({ ...p, institution: e.target.value }))
            }
            error={formErrors.institution}
            required
          />
          <TextInput
            label="Degree"
            value={form.degree}
            onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
            error={formErrors.degree}
            placeholder="e.g. BSc Computer Science"
            required
          />
          <TextInput
            label="Field of Study"
            value={form.field_of_study}
            onChange={(e) =>
              setForm((p) => ({ ...p, field_of_study: e.target.value }))
            }
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
            label="Currently studying here"
            checked={form.is_current}
            onChange={(val) => setForm((p) => ({ ...p, is_current: val }))}
          />
          <TextInput
            label="Grade"
            value={form.grade}
            onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
            placeholder="e.g. First Class, 3.8 GPA"
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
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
        title="Delete Education"
        message={`Delete "${deleteTarget?.degree} at ${deleteTarget?.institution}"?`}
        loading={deleting}
      />
    </>
  );
}
