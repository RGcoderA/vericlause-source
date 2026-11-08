import { createSupabaseServerClient } from "./server";

const BUCKET = "contracts";

function safeFileName(path: string): string {
  const base = path.split(/[/\\]/).pop() || "contract";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return cleaned || "contract";
}

export async function uploadContractFile(
  path: string,
  bytes: Buffer,
  contentType: string
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return null;
  const objectPath = `${userId}/${crypto.randomUUID()}/${safeFileName(path)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType,
    upsert: false,
  });
  if (error) return null;
  return objectPath;
}

export async function downloadContractFile(path: string): Promise<Buffer | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}
