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
          website: string;
          pricing: string;
          founded: string;
          stage: string;
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
          website: string;
          pricing: string;
          founded: string;
          stage: string;
          metrics: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tools"]["Insert"]>;
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
          notes: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["source_observations"]["Insert"]>;
      };
      score_snapshots: {
        Row: {
          id: string;
          tool_id: string;
          captured_at: string;
          score: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          captured_at: string;
          score: number;
          reason: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["score_snapshots"]["Insert"]>;
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
      };
    };
  };
};
