/* ============================================
   Devfolio — API Keys Management Page
   ============================================ */

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import type { ApiKey } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { TextInput } from "@/components/ui/FormFields";
import {
  Plus,
  Key,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatDateTime, timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { extractFieldErrors } from "@/lib/api";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  /* create modal */
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", expires_in_days: "90" });
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* raw key display modal — shown once after creation */
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [rawKeyRevealed, setRawKeyRevealed] = useState(false);
  const [rawKeyCopied, setRawKeyCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* revoke */
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/api-keys/?page_size=100");
      const list: ApiKey[] = Array.isArray(data) ? data : data.results ?? [];
      setKeys(list);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setForm({ name: "", expires_in_days: "90" });
    setFormErrors({});
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Required";
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: form.name,
        expires_in_days: Number(form.expires_in_days) || 90,
      };
      // Backend returns { id, name, prefix, api_key, expires_at, created_at }
      const { data } = await api.post<{ api_key: string }>(
        "/auth/api-keys/create/",
        payload
      );
      toast.success("Key created!");
      setCreateOpen(false);
      setRawKey(data.api_key);   // ← correct field name from backend
      setRawKeyRevealed(false);  // always start hidden
      setRawKeyCopied(false);
      fetchData();
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        setFormErrors(fieldErrors);
        return;
      }

      if (isAxiosError(err) && err.response?.data) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setFormErrors(mapped);
      } else {
        toast.error("Failed to create key");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await api.delete(`/auth/api-keys/${revokeTarget.id}/`);
      toast.success("Key revoked");
      setRevokeTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to revoke");
    } finally {
      setRevoking(false);
    }
  };

  const copyRawKey = async () => {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setRawKeyCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setRawKeyCopied(false), 2000);
    } catch {
      toast.error("Copy failed — select the key manually");
    }
  };

  const isExpired = (key: ApiKey) =>
    key.expires_at && new Date(key.expires_at) < new Date();
  const activeKeys = keys.filter((k) => k.is_active && !isExpired(k));
  const inactiveKeys = keys.filter((k) => !k.is_active || isExpired(k));

  return (
    <>
      <Breadcrumbs items={[{ label: "API Keys" }]} />
      <PageHeader
        title="API Keys"
        description="Manage keys for programmatic access"
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
            Create Key
          </Button>
        }
      />

      {loading ? (
        <SkeletonList count={3} />
      ) : keys.length === 0 ? (
        <EmptyState
          icon={<Key className="h-8 w-8" />}
          title="No API keys"
          description="Create a key to access the portfolio API"
          action={{ label: "Create Key", onClick: openCreate }}
        />
      ) : (
        <div className="space-y-6">
          {activeKeys.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-medium text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success-500" /> Active (
                {activeKeys.length})
              </h3>
              <div className="space-y-2">
                {activeKeys.map((key) => (
                  <KeyCard
                    key={key.id}
                    apiKey={key}
                    onRevoke={setRevokeTarget}
                  />
                ))}
              </div>
            </section>
          )}
          {inactiveKeys.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-medium text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-surface-500" /> Expired /
                Revoked ({inactiveKeys.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {inactiveKeys.map((key) => (
                  <KeyCard
                    key={key.id}
                    apiKey={key}
                    onRevoke={setRevokeTarget}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Create Modal ── */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create API Key">
        <div className="space-y-4">
          <TextInput
            label="Key Name"
            placeholder="e.g. Portfolio Website"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={formErrors.name}
            required
          />
          <TextInput
            label="Expires In (days)"
            type="number"
            value={form.expires_in_days}
            onChange={(e) =>
              setForm((p) => ({ ...p, expires_in_days: e.target.value }))
            }
            error={formErrors.error}
            min={1}
            max={180}
          />
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={creating}>
            Create
          </Button>
        </div>
      </Modal>

      {/* ── Raw Key Display Modal (one-time, shown after creation) ── */}
      <Modal
        open={!!rawKey}
        onClose={() => setRawKey(null)}
        title="Your new API Key"
        size="lg">
        <div className="space-y-4">
          <div className="rounded-lg border border-warning-500/30 bg-warning-500/10 p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning-500 shrink-0 mt-0.5" />
            <p className="text-sm text-warning-200">
              This key will only be shown <strong>once</strong>. Copy it now and
              store it securely — it cannot be retrieved later.
            </p>
          </div>

          {/* Key row — masked by default */}
          <div className="flex items-center gap-2 rounded-lg bg-surface-900 px-4 py-3">
            <span className="flex-1 font-mono text-sm text-surface-200 break-all select-all">
              {rawKeyRevealed ? rawKey : "•".repeat(48)}
            </span>

            {/* Reveal / hide toggle */}
            <button
              onClick={() => setRawKeyRevealed((v) => !v)}
              className="shrink-0 rounded-md p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 cursor-pointer"
              aria-label={rawKeyRevealed ? "Hide key" : "Reveal key"}>
              {rawKeyRevealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>

            {/* Copy — always copies the real key value */}
            <button
              onClick={copyRawKey}
              className="shrink-0 rounded-md p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 cursor-pointer"
              aria-label="Copy key">
              {rawKeyCopied ? (
                <Check className="h-4 w-4 text-success-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setRawKey(null)}>Done</Button>
        </div>
      </Modal>

      {/* ── Revoke Confirm ── */}
      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        message={`Revoke "${revokeTarget?.name}"? Applications using this key will lose access.`}
        confirmLabel="Revoke"
        loading={revoking}
      />
    </>
  );
}

/* ── Key Row ── */
function KeyCard({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: (k: ApiKey) => void;
}) {
  // const [revealed, setRevealed] = useState(false);
  // const [copied, setCopied] = useState(false);
  // const copyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const expired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();

  // The backend only ever stores and returns the prefix (8 chars).
  // The full raw key is never stored — it was shown once at creation.
  // const displayValue = revealed
  //   ? `${apiKey.prefix}${"•".repeat(32)}` // prefix visible + remainder shown as dots
  //   : `${apiKey.prefix}••••••••`;          // short masked form

  // const copyPrefix = async () => {
  //   try {
  //     await navigator.clipboard.writeText(apiKey.prefix);
  //     setCopied(true);
  //     if (copyTimeout.current) clearTimeout(copyTimeout.current);
  //     copyTimeout.current = setTimeout(() => setCopied(false), 2000);
  //   } catch {
  //     toast.error("Copy failed");
  //   }
  // };

  return (
    <Card hover className="flex items-center gap-4 px-5 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-800">
        <Key className="h-5 w-5 text-surface-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-surface-100">{apiKey.name}</p>
          <Badge
            variant={apiKey.is_active && !expired ? "success" : "danger"}
            size="sm"
            dot>
            {!apiKey.is_active ? "Revoked" : expired ? "Expired" : "Active"}
          </Badge>
        </div>

        
        

        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-surface-500">
          {apiKey.expires_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expires{" "}
              {formatDateTime(apiKey.expires_at)}
            </span>
          )}
          {apiKey.last_used_at && (
            <span>Last used {timeAgo(apiKey.last_used_at)}</span>
          )}
          <span>Created {timeAgo(apiKey.created_at)}</span>
        </div>
      </div>

      {apiKey.is_active && !expired && (
        <button
          onClick={() => onRevoke(apiKey)}
          className="shrink-0 rounded-lg p-2 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
          aria-label="Revoke">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </Card>
  );
}