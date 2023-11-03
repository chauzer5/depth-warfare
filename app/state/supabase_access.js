export async function insertSupabaseRow(supabase, data) {
  const { error } = await supabase
    .from(process.env.SUPABASE_TABLE_NAME) // Specify the table name
    .insert(data); // Specify the conflict resolution strategy

  if (error) {
    console.error(error);
  }
}

export async function updateSupabaseRow(supabase, primaryKey, data) {
  const { error } = await supabase
    .from(process.env.SUPABASE_TABLE_NAME)
    .update(data)
    .eq("room_code", primaryKey);

  if (error) {
    console.error(error);
  }
}

export async function deleteSupabaseRow(supabase, primaryKey) {
  const { error } = await supabase
    .from(process.env.SUPABASE_TABLE_NAME)
    .delete()
    .eq("room_code", primaryKey);

  if (error) {
    console.error(error);
  }
}

export async function getSupabaseRow(supabase, primaryKey) {
  const { data, error } = await supabase
    .from(process.env.SUPABASE_TABLE_NAME)
    .select("*")
    .eq("room_code", primaryKey);

  if (error) {
    return error;
  }

  return data;
}
