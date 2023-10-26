export async function insertSupabaseRow(supabase, data) {
  const { error } = await supabase
    .from(process.env.SUPABASE_TABLE_NAME) // Specify the table name
    .insert(data); // Specify the conflict resolution strategy

  console.error(error);
}

export async function updateSupabaseRow(supabase, primaryKey, data) {
  const { error } = await supabase
    .from(process.env.SUPABASE_TABLE_NAME)
    .update(data)
    .eq("room_code", primaryKey);

  console.error(error);
}

export async function deleteSupabaseRow(supabase, primaryKey) {}

export async function getSupabaseRow(supabase, primaryKey) {}
