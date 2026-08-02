export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_completions: {
        Row: {
          completed_at: string;
          lesson_id: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          lesson_id: string;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          lesson_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_completions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_attempts: {
        Row: {
          answered_at: string;
          correct: boolean;
          lesson_id: string;
          user_id: string;
        };
        Insert: {
          answered_at?: string;
          correct: boolean;
          lesson_id: string;
          user_id: string;
        };
        Update: {
          answered_at?: string;
          correct?: boolean;
          lesson_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      favorite_cards: {
        Row: {
          card_id: string;
          changed_at: string;
          favorite: boolean;
          user_id: string;
        };
        Insert: {
          card_id: string;
          changed_at?: string;
          favorite?: boolean;
          user_id: string;
        };
        Update: {
          card_id?: string;
          changed_at?: string;
          favorite?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorite_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      study_days: {
        Row: {
          created_at: string;
          study_date: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          study_date: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          study_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_days_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_state: {
        Row: {
          last_lesson_changed_at: string | null;
          last_lesson_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          last_lesson_changed_at?: string | null;
          last_lesson_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          last_lesson_changed_at?: string | null;
          last_lesson_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_state_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
