import { supabase } from './supabase'

// Gets stats for the logged in user
export const getUserStats = async (userId) => {
  try {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    return {
      jd_count: data?.jd_count || 0,
      cv_rewrite_count: data?.cv_rewrite_count || 0,
    }
  } catch (err) {
    return { jd_count: 0, cv_rewrite_count: 0 }
  }
}

// Adds 1 to JD analysis count — called from Results.jsx
export const incrementJDCount = async (userId) => {
  try {
    const { data } = await supabase
      .from('user_stats')
      .select('jd_count')
      .eq('user_id', userId)
      .single()
    if (data) {
      await supabase
        .from('user_stats')
        .update({ jd_count: (data.jd_count || 0) + 1 })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('user_stats')
        .insert({ user_id: userId, jd_count: 1, cv_rewrite_count: 0 })
    }
  } catch (err) {
    console.error('incrementJDCount error:', err)
  }
}

// Adds 1 to CV rewrite count — called from CVRewrite.jsx
export const incrementCVRewriteCount = async (userId) => {
  try {
    const { data } = await supabase
      .from('user_stats')
      .select('cv_rewrite_count')
      .eq('user_id', userId)
      .single()
    if (data) {
      await supabase
        .from('user_stats')
        .update({ cv_rewrite_count: (data.cv_rewrite_count || 0) + 1 })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('user_stats')
        .insert({ user_id: userId, jd_count: 0, cv_rewrite_count: 1 })
    }
  } catch (err) {
    console.error('incrementCVRewriteCount error:', err)
  }
}