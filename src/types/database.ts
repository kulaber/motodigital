// AUTO-GENERATED — do not edit manually
// Run: npm run db:types  (requires: npx supabase login + supabase link)
//
// This file will be overwritten by the Supabase CLI.
// Until then, this scaffold gives you type safety.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'rider' | 'custom-werkstatt' | 'superadmin'
export type BikeStatus = 'draft' | 'active' | 'sold'
export type ListingType = 'showcase' | 'for_sale'
export type BikeStyle =
  | 'naked'
  | 'cafe_racer'
  | 'bobber'
  | 'scrambler'
  | 'tracker'
  | 'chopper'
  | 'street'
  | 'enduro'
  | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          bio: string | null
          instagram_url: string | null
          tiktok_url: string | null
          website_url: string | null
          youtube_url: string | null
          city: string | null
          specialty: string | null
          since_year: number | null
          tags: string[] | null
          is_verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      builder_media: {
        Row: {
          id: string
          builder_id: string
          url: string
          type: 'image' | 'video'
          title: string | null
          position: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['builder_media']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['builder_media']['Insert']>
      }
      workshops: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          address: string | null
          city: string | null
          services: string[]
          logo_url: string | null
          is_verified: boolean
          avg_rating: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['workshops']['Row'], 'id' | 'created_at' | 'avg_rating'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['workshops']['Insert']>
      }
      base_bike_brands: {
        Row: {
          id: string
          name: string
          slug: string
          country: string | null
          founded: number | null
          description: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['base_bike_brands']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['base_bike_brands']['Insert']>
      }
      base_bikes: {
        Row: {
          id: string
          make: string
          model: string
          cc: number | null
          year_from: number | null
          year_to: number | null
          typical_styles: string[]
          notes: string | null
          brand_id: string | null
          slug: string | null
          engine_cc: number | null
          engine_type: string | null
          custom_styles: string[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['base_bikes']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['base_bikes']['Insert']>
      }
      bikes: {
        Row: {
          id: string
          seller_id: string
          workshop_id: string | null
          base_bike_id: string | null
          title: string
          make: string
          model: string
          year: number
          cc: number | null
          mileage_km: number | null
          price: number
          style: BikeStyle
          description: string | null
          city: string | null
          status: BikeStatus
          is_verified: boolean
          view_count: number
          listing_type: ListingType
          price_amount: number | null
          price_on_request: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bikes']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count'> & {
          id?: string
          view_count?: number
        }
        Update: Partial<Database['public']['Tables']['bikes']['Insert']>
      }
      bike_images: {
        Row: {
          id: string
          bike_id: string
          url: string
          position: number
          is_cover: boolean
          media_type: 'image' | 'video'
          thumbnail_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['bike_images']['Row'], 'id' | 'media_type'> & { id?: string; media_type?: 'image' | 'video' }
        Update: Partial<Database['public']['Tables']['bike_images']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          bike_id: string
          buyer_id: string
          seller_id: string
          last_message_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      saved_bikes: {
        Row: {
          user_id: string
          bike_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['saved_bikes']['Row'], 'created_at'>
        Update: never
      }
      saved_builders: {
        Row: {
          user_id: string
          builder_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['saved_builders']['Row'], 'created_at'>
        Update: never
      }
      followers: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['followers']['Row'], 'created_at'>
        Update: never
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewee_id: string
          bike_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'custom-werkstatt' | 'rider'
          invited_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at' | 'invited_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>
      }
    }
    Functions: {
      search_bikes_nearby: {
        Args: {
          lat: number
          lng: number
          radius_m: number
          style_filter?: BikeStyle | null
        }
        Returns: Database['public']['Tables']['bikes']['Row'][]
      }
    }
  }
}
