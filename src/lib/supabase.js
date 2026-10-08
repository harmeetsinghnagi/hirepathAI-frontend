// This file connects our React website to Supabase
// Supabase gives us login system and database for free
// We import this file whenever we need to talk to the database or handle login

import { createClient } from '@supabase/supabase-js'

// We are reading the keys from our .env file
// import.meta.env is how Vite reads environment variables
// VITE_ prefix is required for Vite to expose the variable to frontend
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// This creates the Supabase client
// We export it so any file in our project can import and use it
// For example: import { supabase } from '../lib/supabase'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)