/* ============================================
   Devfolio — Soft Skill Form (Create Only)
   ============================================ */

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { extractFieldErrors } from "@/lib/api";
import { Save, ArrowLeft } from "lucide-react";

export default function SoftSkillFormPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  /* ── Submit handler ── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!form.name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim().toLowerCase(),
        category: "soft skills",
      };
      await api.post("/skills/", payload);
      toast.success("Soft skill created!");
      navigate("/dashboard/skills");
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
        toast.error("Failed to create soft skill");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Skills", href: "/dashboard/skills" },
          { label: "New Soft Skill" },
        ]}
      />
      <PageHeader
        title="New Soft Skill"
        actions={
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/skills")}
            icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Soft Skill Details</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <TextInput
              label="Name"
              value={form.name}
              onChange={update("name")}
              error={errors.name}
              placeholder="e.g. Communication, Leadership, Teamwork…"
              required
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate("/dashboard/skills")}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={<Save className="h-4 w-4" />}>
            Create Soft Skill
          </Button>
        </div>
      </form>
    </>
  );
}
