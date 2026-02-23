/* ============================================
   Devfolio — Blog Post Form (Create / Edit)
   with live Markdown preview
   ============================================ */

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { createFormData, uploadConfig } from "@/lib/api";
import type { BlogPost, PostStatus } from "@/types";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TextInput,
  TextArea,
  SelectInput,
  TagInput,
  ImageUpload,
} from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Save, ArrowLeft, Eye, Edit3 } from "lucide-react";
import { cn, readingTime } from "@/lib/utils";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft" as PostStatus,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setFetchLoading(true);
    api
      .get<BlogPost>(`/blog/${id}/`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || "",
          status: data.status,
        });
        setTags(data.tags || []);
        setCoverPreview(data.cover_image);
      })
      .catch(() => toast.error("Failed to load post"))
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
    if (!form.title) {
      setErrors({ title: "Title is required" });
      return;
    }
    if (!form.content) {
      setErrors({ content: "Content is required" });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const payload: Record<string, unknown> = { ...form, tags };
      if (coverImage) payload.cover_image = coverImage;

      if (isEdit) {
        await api.patch(
          `/blog/${id}/`,
          createFormData(payload),
          uploadConfig()
        );
        toast.success("Post updated!");
      } else {
        await api.post("/blog/", createFormData(payload), uploadConfig());
        toast.success("Post created!");
      }
      navigate("/dashboard/blog");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          mapped[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setErrors(mapped);
      } else {
        toast.error("Failed to save post");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/dashboard/blog" },
          { label: isEdit ? "Edit Post" : "New Post" },
        ]}
      />
      <PageHeader
        title={isEdit ? "Edit Post" : "New Post"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/blog")}
              icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            <span className="text-xs text-surface-500">
              {readingTime(form.content)} min read
            </span>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <TextInput
              label="Title"
              value={form.title}
              onChange={update("title")}
              error={errors.title}
              placeholder="An interesting blog title…"
              required
            />
            <TextInput
              label="Excerpt"
              value={form.excerpt}
              onChange={update("excerpt")}
              error={errors.excerpt}
              placeholder="Brief summary (auto-generated if blank)"
              hint="Max 500 characters"
              maxLength={500}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput
                label="Status"
                options={statusOptions}
                value={form.status}
                onChange={update("status")}
              />
              <TagInput
                label="Tags"
                value={tags}
                onChange={setTags}
                placeholder="Add tags…"
              />
            </div>
            <ImageUpload
              label="Cover Image"
              value={coverPreview}
              onChange={setCoverImage}
            />
          </div>
        </Card>

        {/* Content editor with preview */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <div className="flex rounded-lg border border-surface-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  !showPreview
                    ? "bg-brand-600 text-white"
                    : "text-surface-400 hover:bg-surface-800"
                )}>
                <Edit3 className="h-3.5 w-3.5" /> Write
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  showPreview
                    ? "bg-brand-600 text-white"
                    : "text-surface-400 hover:bg-surface-800"
                )}>
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>
          </CardHeader>

          {showPreview ? (
            <div className="prose min-h-[300px] rounded-lg border border-surface-700 bg-surface-800/30 p-6">
              {form.content ? (
                <ReactMarkdown>{form.content}</ReactMarkdown>
              ) : (
                <p className="text-surface-500 italic">
                  Nothing to preview yet…
                </p>
              )}
            </div>
          ) : (
            <TextArea
              value={form.content}
              onChange={update("content")}
              error={errors.content}
              placeholder="Write your post content here… (Markdown supported)"
              rows={16}
              className="font-mono text-sm"
              required
            />
          )}
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate("/dashboard/blog")}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={<Save className="h-4 w-4" />}>
            {isEdit ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </form>
    </>
  );
}
