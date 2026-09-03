import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgtchvytqxxtusdfojkj.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndGNodnl0cXh4dHVzZGZvamtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NjE4MzEsImV4cCI6MjA5MjIzNzgzMX0.VOoVRYpcQPwyng_8cXZuThtZEobsdTBhfiJmQo-bPOE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
