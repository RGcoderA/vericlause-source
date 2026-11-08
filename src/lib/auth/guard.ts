import { hasAuth0 } from "@/lib/env";
import { HttpError } from "@/lib/http";
import { readAuthUser } from "@/lib/auth/session";

export async function requireCounsel(): Promise<void> {
  if (!hasAuth0()) {
    throw new HttpError(403, "Playbook edits stay off until Auth0 counsel is configured.");
  }
  const user = await readAuthUser();
  if (!user) throw new HttpError(401, "Sign in with Auth0 to edit the playbook.");
  if (user.role !== "counsel") {
    throw new HttpError(403, "Only counsel can edit the playbook. Business users can review contracts.");
  }
}
