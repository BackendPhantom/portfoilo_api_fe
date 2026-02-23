/* ============================================
   Devfolio — Blog Posts List Page
   ============================================ */

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { BlogPost, PaginatedResponse } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { TextInput, SelectInput } from "@/components/ui/FormFields";
import { Plus, Pencil, Trash2, FileText, Clock } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import toast from "react-hot-toast";

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  published: "success",
  draft: "warning",
  archived: "default",
};

const PAGE_SIZE = 10;

export default function BlogListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", String(PAGE_SIZE));
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const { data } = await api.get<PaginatedResponse<BlogPost>>(
        `/blog/?${params}`
      );
      setPosts(data.results);
      setTotal(data.count);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/blog/${deleteTarget.id}/`);
      toast.success("Post deleted");
      setDeleteTarget(null);
      fetchPosts();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Blog Posts" }]} />
      <PageHeader
        title="Blog Posts"
        description={`${total} post${total !== 1 ? "s" : ""}`}
        actions={
          <Button
            onClick={() => navigate("/dashboard/blog/new")}
            icon={<Plus className="h-4 w-4" />}>
            New Post
          </Button>
        }
      />

      <Card className="mb-6" padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextInput
              placeholder="Search posts…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <SelectInput
            options={[
              { value: "", label: "All statuses" },
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {loading ? (
        <SkeletonList count={5} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title={search ? "No posts found" : "No blog posts yet"}
          description={
            search ? "Try different search terms" : "Write your first blog post"
          }
          action={
            !search
              ? {
                  label: "Write Post",
                  onClick: () => navigate("/dashboard/blog/new"),
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} hover>
                <div className="flex items-start gap-4">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="hidden sm:block h-20 w-28 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="hidden sm:flex h-20 w-28 items-center justify-center rounded-lg bg-surface-800 shrink-0">
                      <FileText className="h-6 w-6 text-surface-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusVariant[post.status]} dot>
                        {post.status}
                      </Badge>
                      {post.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-surface-800 px-1.5 py-0.5 text-xs text-surface-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-surface-100">
                      {post.title}
                    </h3>
                    <p className="text-sm text-surface-400 line-clamp-1 mt-0.5">
                      {truncate(post.excerpt || post.content, 120)}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-surface-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {post.reading_time} min read
                      </span>
                      <span>
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/dashboard/blog/${post.id}/edit`}
                      className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200"
                      aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(post)}
                      className="rounded-lg p-1.5 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 cursor-pointer"
                      aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}
