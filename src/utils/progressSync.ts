import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Persists the user's game progress (solved problems + streak) to Supabase.
 * Updates the `solved_problems` and `streak` columns on the `profiles` row.
 */
export async function saveProgressToDb(
  supabase: SupabaseClient,
  userId: string,
  solvedIds: number[],
  streak: number
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ solved_problems: solvedIds, streak })
    .eq('id', userId);

  if (error) {
    console.error('[progressSync] Failed to save progress:', error.message);
  }
}

/**
 * Loads saved game progress from Supabase for the given user.
 */
export async function loadProgressFromDb(
  supabase: SupabaseClient,
  userId: string
): Promise<{ solvedIds: number[]; streak: number }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('solved_problems, streak')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return { solvedIds: [], streak: 0 };
  }

  return {
    solvedIds: Array.isArray(data.solved_problems) ? data.solved_problems : [],
    streak: typeof data.streak === 'number' ? data.streak : 0,
  };
}
