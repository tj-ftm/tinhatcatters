export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      nft_categories: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      nfts: {
        Row: {
          boost_duration: number | null
          boost_type: string
          boost_value: number
          category_id: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          name: string
          price: number
        }
        Insert: {
          boost_duration?: number | null
          boost_type: string
          boost_value: number
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id: string
          image_url: string
          name: string
          price: number
        }
        Update: {
          boost_duration?: number | null
          boost_type?: string
          boost_value?: number
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "nfts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "nft_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          growth_stage: string
          id: string
          is_growing: boolean | null
          last_updated: string | null
          planted_date: string | null
          progress: number | null
          quality: number | null
          wallet_address: string
        }
        Insert: {
          growth_stage: string
          id?: string
          is_growing?: boolean | null
          last_updated?: string | null
          planted_date?: string | null
          progress?: number | null
          quality?: number | null
          wallet_address: string
        }
        Update: {
          growth_stage?: string
          id?: string
          is_growing?: boolean | null
          last_updated?: string | null
          planted_date?: string | null
          progress?: number | null
          quality?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      user_equipment: {
        Row: {
          equipment_type: string
          id: string
          level: number | null
          wallet_address: string
        }
        Insert: {
          equipment_type: string
          id?: string
          level?: number | null
          wallet_address: string
        }
        Update: {
          equipment_type?: string
          id?: string
          level?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      user_nfts: {
        Row: {
          id: string
          nft_id: string | null
          purchase_date: string | null
          used: boolean | null
          wallet_address: string
        }
        Insert: {
          id?: string
          nft_id?: string | null
          purchase_date?: string | null
          used?: boolean | null
          wallet_address: string
        }
        Update: {
          id?: string
          nft_id?: string | null
          purchase_date?: string | null
          used?: boolean | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nfts_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
