import { PlaybookClient } from "@/components/playbook/PlaybookClient";
import { PlaybookLocked } from "@/components/playbook/PlaybookLocked";
import { readAuthUser } from "@/lib/auth/session";
import { getPlaybook } from "@/lib/cache/review-cache";
import { hasAuth0 } from "@/lib/env";
import { getSessionId } from "@/lib/http";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const user = hasAuth0() ? await readAuthUser() : null;
  const canEdit = user?.role === "counsel";
  if (!canEdit) {
    const playbook = getPlaybook(await getSessionId());
    return (
      <PlaybookLocked
        signedIn={Boolean(user)}
        showSignIn={hasAuth0()}
        rules={playbook.rules.map((rule) => ({ id: rule.id, name: rule.name, description: rule.description }))}
      />
    );
  }
  const playbook = getPlaybook(await getSessionId());
  return <PlaybookClient initial={playbook} />;
}
