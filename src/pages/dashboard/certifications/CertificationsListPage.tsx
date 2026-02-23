/* ============================================
   Devfolio — Certifications List Page
   ============================================ */

import { useEffect, useState, useCallback } from "react";
import api, { createFormData, uploadConfig } from "@/lib/api";
import type { Certification, PaginatedResponse } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { TextInput, ImageUpload } from "@/components/ui/FormFields";
import { Plus, Pencil, Trash2, Award, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

export default function CertificationsListPage() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [form, setForm] = useState({
    name: "",
    issuing_organization: "",
    issue_date: "",
    expiry_date: "",
    credential_id: "",
    credential_url: "",
    order: "0",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Certification>>(
        "/certifications/?page_size=100"
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
      name: "",
      issuing_organization: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
      credential_url: "",
      order: "0",
    });
    setImageFile(null);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: Certification) => {
    setEditing(item);
    setForm({
      name: item.name,
      issuing_organization: item.issuing_organization,
      issue_date: item.issue_date,
      expiry_date: item.expiry_date || "",
      credential_id: item.credential_id || "",
      credential_url: item.credential_url || "",
      order: String(item.order),
    });
    setImageFile(null);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Required";
    if (!form.issuing_organization) errs.issuing_organization = "Required";
    if (!form.issue_date) errs.issue_date = "Required";
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        expiry_date: form.expiry_date || null,
        order: Number(form.order) || 0,
      };
      if (imageFile) payload.image = imageFile;

      if (editing) {
        await api.patch(
          `/certifications/${editing.id}/`,
          createFormData(payload),
          uploadConfig()
        );
        toast.success("Updated!");
      } else {
        await api.post(
          "/certifications/",
          createFormData(payload),
          uploadConfig()
        );
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
      await api.delete(`/certifications/${deleteTarget.id}/`);
      toast.success("Deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = (cert: Certification) =>
    cert.expiry_date && new Date(cert.expiry_date) < new Date();

  return (
    <>
      <Breadcrumbs items={[{ label: "Certifications" }]} />
      <PageHeader
        title="Certifications"
        description={`${items.length} certification${
          items.length !== 1 ? "s" : ""
        }`}
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
            Add Certification
          </Button>
        }
      />

      {loading ? (
        <SkeletonList count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Award className="h-8 w-8" />}
          title="No certifications yet"
          description="Showcase your professional certifications"
          action={{ label: "Add Certification", onClick: openCreate }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cert) => (
            <Card
              key={cert.id}
              hover
              padding="none"
              className="overflow-hidden">
              {cert.image ? (
                <img
                  src={cert.image}
                  alt={cert.name}
                  className="h-36 w-full object-cover border-b border-surface-800"
                />
              ) : (
                <div className="flex h-36 items-center justify-center border-b border-surface-800 bg-surface-800/30">
                  <Award className="h-10 w-10 text-surface-600" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={isExpired(cert) ? "danger" : "success"} dot>
                    {isExpired(cert) ? "Expired" : "Valid"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-surface-100 mb-1">
                  {cert.name}
                </h3>
                <p className="text-sm text-surface-400">
                  {cert.issuing_organization}
                </p>
                <p className="mt-1 text-xs text-surface-500">
                  Issued {formatDate(cert.issue_date)}
                  {cert.expiry_date &&
                    ` · Expires ${formatDate(cert.expiry_date)}`}
                </p>
                {cert.credential_id && (
                  <p className="text-xs text-surface-500 mt-1">
                    ID: {cert.credential_id}
                  </p>
                )}

                <div className="flex items-center gap-2 border-t border-surface-800 pt-3 mt-3">
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                      <ExternalLink className="h-3.5 w-3.5" /> View credential
                    </a>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cert)}
                      className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 cursor-pointer"
                      aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cert)}
                      className="rounded-lg p-1.5 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                      aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Certification" : "Add Certification"}
        size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <TextInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={formErrors.name}
            required
          />
          <TextInput
            label="Issuing Organization"
            value={form.issuing_organization}
            onChange={(e) =>
              setForm((p) => ({ ...p, issuing_organization: e.target.value }))
            }
            error={formErrors.issuing_organization}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Issue Date"
              type="date"
              value={form.issue_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, issue_date: e.target.value }))
              }
              error={formErrors.issue_date}
              required
            />
            <TextInput
              label="Expiry Date"
              type="date"
              value={form.expiry_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, expiry_date: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Credential ID"
              value={form.credential_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, credential_id: e.target.value }))
              }
            />
            <TextInput
              label="Credential URL"
              type="url"
              value={form.credential_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, credential_url: e.target.value }))
              }
              placeholder="https://…"
            />
          </div>
          <ImageUpload
            label="Certificate Image"
            value={editing?.image}
            onChange={setImageFile}
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
        title="Delete Certification"
        message={`Delete "${deleteTarget?.name}"?`}
        loading={deleting}
      />
    </>
  );
}
