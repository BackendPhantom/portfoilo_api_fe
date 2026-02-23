/* ============================================
   Devfolio — Contact Messages Inbox
   ============================================ */

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { ContactMessage, PaginatedResponse } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { SkeletonList } from "@/components/ui/Skeleton";
import {
  Mail,
  MailOpen,
  Trash2,
  Inbox,
  ArrowLeft,
  ExternalLink,
  Clock,
} from "lucide-react";
import { formatDateTime, timeAgo, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  /* detail view */
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  /* delete */
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const PAGE_SIZE = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        page_size: PAGE_SIZE,
      };
      if (filter === "unread") params.is_read = 0;
      if (filter === "read") params.is_read = 1;
      const { data } = await api.get<PaginatedResponse<ContactMessage>>(
        "/contact-messages/",
        { params }
      );
      setMessages(data.results || []);
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.is_read) {
      try {
        await api.patch(`/contact-messages/${msg.id}/`, { is_read: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
      } catch {
        /* silent */
      }
    }
  };

  const toggleRead = async (msg: ContactMessage) => {
    try {
      const newState = !msg.is_read;
      await api.patch(`/contact-messages/${msg.id}/`, { is_read: newState });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: newState } : m))
      );
      if (selected?.id === msg.id) setSelected({ ...msg, is_read: newState });
      toast.success(newState ? "Marked as read" : "Marked as unread");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/contact-messages/${deleteTarget.id}/`);
      toast.success("Deleted");
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <>
      <Breadcrumbs items={[{ label: "Messages" }]} />
      <PageHeader
        title="Messages"
        description={`${totalCount} message${totalCount !== 1 ? "s" : ""}${
          unreadCount > 0 ? ` · ${unreadCount} unread` : ""
        }`}
      />

      {/* Filter tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-lg bg-surface-900 p-1 w-fit">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              filter === f
                ? "bg-surface-800 text-surface-100 shadow-sm"
                : "text-surface-400 hover:text-surface-200"
            )}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {selected ? (
        /* ── Detail View ── */
        <div>
          <button
            onClick={() => setSelected(null)}
            className="mb-4 flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to inbox
          </button>
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-surface-100">
                  {selected.subject || "(no subject)"}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-surface-400">
                  <span className="font-medium text-surface-200">
                    {selected.name}
                  </span>
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-1 text-brand-400 hover:text-brand-300">
                    {selected.email} <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />{" "}
                    {formatDateTime(selected.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRead(selected)}>
                  {selected.is_read ? "Mark unread" : "Mark read"}
                </Button>
                <button
                  onClick={() => setDeleteTarget(selected)}
                  className="rounded-lg p-2 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                  aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <hr className="border-surface-800" />
            <div className="whitespace-pre-wrap text-surface-300 leading-relaxed">
              {selected.message}
            </div>
          </Card>
        </div>
      ) : (
        /* ── List View ── */
        <>
          {loading ? (
            <SkeletonList count={6} />
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-8 w-8" />}
              title={
                filter === "unread"
                  ? "No unread messages"
                  : filter === "read"
                  ? "No read messages"
                  : "Inbox is empty"
              }
              description="Contact messages from your portfolio will appear here"
            />
          ) : (
            <div className="space-y-1">
              {messages.map((msg) => (
                <Card
                  key={msg.id}
                  hover
                  className={cn(
                    "flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors",
                    !msg.is_read && "border-brand-500/20 bg-brand-500/5"
                  )}
                  onClick={() => openMessage(msg)}>
                  <div className="shrink-0">
                    {msg.is_read ? (
                      <MailOpen className="h-5 w-5 text-surface-500" />
                    ) : (
                      <Mail className="h-5 w-5 text-brand-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm",
                          msg.is_read
                            ? "text-surface-300"
                            : "font-semibold text-surface-100"
                        )}>
                        {msg.name}
                      </span>
                      {!msg.is_read && (
                        <Badge variant="info" size="sm">
                          New
                        </Badge>
                      )}
                    </div>
                    <p
                      className={cn(
                        "truncate text-sm",
                        msg.is_read ? "text-surface-500" : "text-surface-300"
                      )}>
                      {msg.subject ? (
                        <span className="font-medium">{msg.subject}</span>
                      ) : null}
                      {msg.subject && msg.message ? " — " : ""}
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-surface-500 whitespace-nowrap">
                      {timeAgo(msg.created_at)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(msg);
                      }}
                      className="rounded-lg p-1.5 text-surface-500 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                      aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-6"
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message={`Delete message from "${deleteTarget?.name}"?`}
        loading={deleting}
      />
    </>
  );
}
