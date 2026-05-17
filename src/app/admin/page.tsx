import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getCategories, getSources, getTools, isSupabaseConfigured } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Admin Dashboard | Plebi"
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [categories, tools, sources] = await Promise.all([getCategories(), getTools(), getSources()]);

  return (
    <AdminDashboard
      categories={categories}
      tools={tools}
      sources={sources}
      configured={isSupabaseConfigured()}
    />
  );
}
