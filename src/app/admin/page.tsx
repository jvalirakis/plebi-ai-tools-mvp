import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getCategories, getSources, getTools, isSupabaseConfigured } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Admin Dashboard | Plebi"
};

export default function AdminPage() {
  return (
    <AdminDashboard
      categories={getCategories()}
      tools={getTools()}
      sources={getSources()}
      configured={isSupabaseConfigured()}
    />
  );
}
