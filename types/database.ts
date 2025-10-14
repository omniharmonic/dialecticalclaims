// Placeholder database types - will be generated from Supabase schema
export type Database = {
  public: {
    Tables: {
      fighters: {
        Row: {
          id: string
          name: string
          fighter_name: string
          slug: string
          era: string
          tradition: string[]
          style: string
          special_move: string
          attributes: string[]
          system_prompt: string
          bio: string
          portrait_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          fighter_name: string
          slug: string
          era: string
          tradition: string[]
          style: string
          special_move: string
          attributes: string[]
          system_prompt: string
          bio: string
          portrait_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          fighter_name?: string
          slug?: string
          era?: string
          tradition?: string[]
          style?: string
          special_move?: string
          attributes?: string[]
          system_prompt?: string
          bio?: string
          portrait_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dialectics: {
        Row: {
          id: string
          fighter1_id: string
          fighter2_id: string
          thesis: string
          round_count: number
          status: 'pending' | 'generating' | 'complete' | 'failed'
          view_count: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          fighter1_id: string
          fighter2_id: string
          thesis: string
          round_count: number
          status?: 'pending' | 'generating' | 'complete' | 'failed'
          view_count?: number
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          fighter1_id?: string
          fighter2_id?: string
          thesis?: string
          round_count?: number
          status?: 'pending' | 'generating' | 'complete' | 'failed'
          view_count?: number
          created_at?: string
          completed_at?: string | null
        }
      }
      rounds: {
        Row: {
          id: string
          dialectic_id: string
          round_number: number
          fighter1_response: string
          fighter2_response: string
          created_at: string
        }
        Insert: {
          id?: string
          dialectic_id: string
          round_number: number
          fighter1_response: string
          fighter2_response: string
          created_at?: string
        }
        Update: {
          id?: string
          dialectic_id?: string
          round_number?: number
          fighter1_response?: string
          fighter2_response?: string
          created_at?: string
        }
      }
      syntheses: {
        Row: {
          id: string
          dialectic_id: string
          title: string
          type: 'resolution' | 'transcendence' | 'paradox' | 'subsumption'
          content: string
          concept_tags: string[]
          used_as_thesis_count: number
          created_at: string
        }
        Insert: {
          id?: string
          dialectic_id: string
          title: string
          type: 'resolution' | 'transcendence' | 'paradox' | 'subsumption'
          content: string
          concept_tags: string[]
          used_as_thesis_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          dialectic_id?: string
          title?: string
          type?: 'resolution' | 'transcendence' | 'paradox' | 'subsumption'
          content?: string
          concept_tags?: string[]
          used_as_thesis_count?: number
          created_at?: string
        }
      }
      provocation_deck: {
        Row: {
          id: string
          thesis: string
          domain: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          thesis: string
          domain: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          thesis?: string
          domain?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          usage_count?: number
          created_at?: string
        }
      }
      dialectic_lineage: {
        Row: {
          parent_synthesis_id: string
          child_dialectic_id: string
          created_at: string
        }
        Insert: {
          parent_synthesis_id: string
          child_dialectic_id: string
          created_at?: string
        }
        Update: {
          parent_synthesis_id?: string
          child_dialectic_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: {
          dialectic_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Fighter = Database['public']['Tables']['fighters']['Row']
export type FighterInsert = Database['public']['Tables']['fighters']['Insert']
export type FighterUpdate = Database['public']['Tables']['fighters']['Update']

export type Dialectic = Database['public']['Tables']['dialectics']['Row']
export type DialecticInsert = Database['public']['Tables']['dialectics']['Insert']
export type DialecticUpdate = Database['public']['Tables']['dialectics']['Update']

export type Round = Database['public']['Tables']['rounds']['Row']
export type RoundInsert = Database['public']['Tables']['rounds']['Insert']
export type RoundUpdate = Database['public']['Tables']['rounds']['Update']

export type Synthesis = Database['public']['Tables']['syntheses']['Row']
export type SynthesisInsert = Database['public']['Tables']['syntheses']['Insert']
export type SynthesisUpdate = Database['public']['Tables']['syntheses']['Update']

export type ProvocationDeck = Database['public']['Tables']['provocation_deck']['Row']
export type ProvocationDeckInsert = Database['public']['Tables']['provocation_deck']['Insert']
export type ProvocationDeckUpdate = Database['public']['Tables']['provocation_deck']['Update']

export type DialecticLineage = Database['public']['Tables']['dialectic_lineage']['Row']
export type DialecticLineageInsert = Database['public']['Tables']['dialectic_lineage']['Insert']
export type DialecticLineageUpdate = Database['public']['Tables']['dialectic_lineage']['Update']