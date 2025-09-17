export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          links: Json
          occupation: string | null
          plan: string
          created_at: string
        }
        Insert: {
          id: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          links?: Json
          occupation?: string | null
          plan?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          links?: Json
          occupation?: string | null
          plan?: string
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          creator_id: string
          destination: string
          start_date: string
          end_date: string
          description: string | null
          is_private: boolean
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          destination: string
          start_date: string
          end_date: string
          description?: string | null
          is_private?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          destination?: string
          start_date?: string
          end_date?: string
          description?: string | null
          is_private?: boolean
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          followed_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          followed_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          followed_id?: string
          created_at?: string
        }
      }
      interests: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          status: 'interested' | 'not_interested'
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          status?: 'interested' | 'not_interested'
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          status?: 'interested' | 'not_interested'
          message?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Trip = Database['public']['Tables']['trips']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Interest = Database['public']['Tables']['interests']['Row']

export type ProfileWithTrips = Profile & {
  trips?: Trip[]
}

export type TripWithCreator = Trip & {
  creator?: Profile
}

export type TripWithInterests = Trip & {
  creator?: Profile
  interests?: (Interest & { user?: Profile })[]
  interests_count?: number
}