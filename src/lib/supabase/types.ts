export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          subcategories: string[];
          signal: string;
          benchmark: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          subcategories?: string[];
          signal?: string;
          benchmark?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      tools: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category_id: string;
          subcategory: string;
          tagline: string;
          summary: string;
          best_for: string;
          website: string;
          pricing: string;
          founded: string;
          stage: string;
          last_verified_at: string | null;
          freshness_status: "current" | "needs_review" | "stale" | "seed_only";
          evidence_status: "source_verified" | "partially_verified" | "manual_seed" | "insufficient_evidence";
          metrics: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category_id: string;
          subcategory: string;
          tagline: string;
          summary: string;
          best_for?: string;
          website: string;
          pricing: string;
          founded: string;
          stage: string;
          last_verified_at?: string | null;
          freshness_status?: "current" | "needs_review" | "stale" | "seed_only";
          evidence_status?: "source_verified" | "partially_verified" | "manual_seed" | "insufficient_evidence";
          metrics: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tools"]["Insert"]>;
        Relationships: [];
      };
      sources: {
        Row: {
          id: string;
          name: string;
          type: string;
          url: string;
          weight: number;
          credibility: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          url: string;
          weight: number;
          credibility: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
        Relationships: [];
      };
      source_observations: {
        Row: {
          id: string;
          tool_id: string;
          source_id: string;
          title: string;
          observed_at: string;
          score: number;
          confidence: number;
          metric_impacts: Json;
          evidence_url: string | null;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          source_id: string;
          title: string;
          observed_at: string;
          score: number;
          confidence: number;
          metric_impacts?: Json;
          evidence_url?: string | null;
          notes: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["source_observations"]["Insert"]>;
        Relationships: [];
      };
      score_snapshots: {
        Row: {
          id: string;
          tool_id: string;
          captured_at: string;
          snapshot_date: string;
          score: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          captured_at: string;
          snapshot_date?: string;
          score: number;
          reason: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["score_snapshots"]["Insert"]>;
        Relationships: [];
      };
      polls: {
        Row: {
          id: string;
          tool_id: string;
          votes_for: number;
          votes_against: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          votes_for?: number;
          votes_against?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["polls"]["Insert"]>;
        Relationships: [];
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string | null;
          vote: "for" | "against";
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          user_id?: string | null;
          vote: "for" | "against";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["poll_votes"]["Insert"]>;
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          user_id: string;
          role: "admin" | "analyst";
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: "admin" | "analyst";
          created_at?: string;
        };
        Update: {
          role?: "admin" | "analyst";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
