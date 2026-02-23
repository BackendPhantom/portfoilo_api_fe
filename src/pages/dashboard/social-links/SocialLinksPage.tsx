/* ============================================
   Devfolio — Social Links Page
   ============================================ */

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { SocialLink, PaginatedResponse } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { TextInput, SelectInput } from "@/components/ui/FormFields";
import {
  Plus,
  Pencil,
  Trash2,
  Link2,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

const PLATFORM_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "dribbble", label: "Dribbble" },
  { value: "behance", label: "Behance" },
  { value: "medium", label: "Medium" },
  { value: "dev_to", label: "DEV.to" },
  { value: "hashnode", label: "Hashnode" },
  { value: "stackoverflow", label: "Stack Overflow" },
  { value: "codepen", label: "CodePen" },
  { value: "telegram", label: "Telegram" },
  { value: "discord", label: "Discord" },
  { value: "website", label: "Personal Website" },
  { value: "other", label: "Other" },
];

/* Simple SVG icons per platform */
function PlatformIcon({
  platform,
  className = "",
}: {
  platform: string;
  className?: string;
}) {
  const base = `${className}`;
  switch (platform) {
    case "github":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.8.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.9 1.2 2 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
      );
    case "twitter":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return <Link2 className={className} />;
  }
}

export default function SocialLinksPage() {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [form, setForm] = useState({ platform: "github", url: "", order: "0" });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<SocialLink>>(
        "/social-links/?page_size=100"
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
    setForm({ platform: "github", url: "", order: "0" });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: SocialLink) => {
    setEditing(item);
    setForm({
      platform: item.platform,
      url: item.url,
      order: String(item.order),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.url) errs.url = "Required";
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platform: form.platform,
        url: form.url,
        order: Number(form.order) || 0,
      };
      if (editing) {
        await api.patch(`/social-links/${editing.id}/`, payload);
        toast.success("Updated!");
      } else {
        await api.post("/social-links/", payload);
        toast.success("Added!");
      }
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
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
      await api.delete(`/social-links/${deleteTarget.id}/`);
      toast.success("Deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const platformLabel = (val: string) =>
    PLATFORM_OPTIONS.find((o) => o.value === val)?.label ?? val;

  return (
    <>
      <Breadcrumbs items={[{ label: "Social Links" }]} />
      <PageHeader
        title="Social Links"
        description={`${items.length} link${items.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
            Add Link
          </Button>
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Link2 className="h-8 w-8" />}
          title="No social links yet"
          description="Add links to your profiles"
          action={{ label: "Add Link", onClick: openCreate }}
        />
      ) : (
        <div className="space-y-2">
          {items.map((link) => (
            <Card
              key={link.id}
              hover
              className="flex items-center gap-4 px-5 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-surface-600 cursor-grab" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-800">
                <PlatformIcon
                  platform={link.platform}
                  className="h-5 w-5 text-surface-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-surface-100">
                  {platformLabel(link.platform)}
                </p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 truncate">
                  {link.url} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(link)}
                  className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 cursor-pointer"
                  aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(link)}
                  className="rounded-lg p-2 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                  aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Social Link" : "Add Social Link"}>
        <div className="space-y-4">
          <SelectInput
            label="Platform"
            value={form.platform}
            onChange={(e) =>
              setForm((p) => ({ ...p, platform: e.target.value }))
            }
            options={PLATFORM_OPTIONS}
            error={formErrors.platform}
          />
          <TextInput
            label="URL"
            type="url"
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            placeholder="https://…"
            error={formErrors.url}
            required
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
        title="Delete Social Link"
        message={`Delete your ${platformLabel(
          deleteTarget?.platform ?? ""
        )} link?`}
        loading={deleting}
      />
    </>
  );
}
