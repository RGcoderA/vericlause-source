"use client";

import { useCopy } from "@/components/i18n/useCopy";
import { useRouter } from "next/navigation";
import { PlaybookEditor } from "@/components/playbook/PlaybookEditor";
import { RuleList } from "@/components/playbook/RuleList";
import { Button } from "@/components/ui/button";
import { usePlaybook } from "@/hooks/usePlaybook";
import type { Playbook } from "@/types/playbook";
import { toast } from "sonner";
import { useEffect } from "react";

export function PlaybookClient({ initial }: { initial: Playbook }) {
  const router = useRouter();
  const copy = useCopy();
  const { playbook, loading, error, compile, saveRules, reset, setPlaybook } = usePlaybook();

  useEffect(() => {
    setPlaybook(initial);
  }, [initial, setPlaybook]);

  const current = playbook ?? initial;

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h1 className="font-heading text-4xl">{copy.playbook.title}</h1>
        <p className="mt-2 text-muted-foreground">{copy.playbook.lead}</p>
      </div>
      <PlaybookEditor
        onCompile={async (text) => {
          await compile(text);
          toast.success(copy.playbook.added);
          router.refresh();
        }}
      />
      {loading && !playbook ? <p className="text-sm text-muted-foreground">{copy.playbook.refreshing}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {copy.playbook.version} {current.version} · {current.rules.filter((rule) => rule.enabled).length} {copy.playbook.active}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/history")}>
            {copy.playbook.openHistory}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              void reset().then(() => router.refresh());
            }}
          >
            {copy.playbook.reset}
          </Button>
        </div>
      </div>
      <RuleList
        rules={current.rules}
        onToggle={(rule) =>
          void saveRules(
            current.rules.map((item) =>
              item.id === rule.id ? { ...item, enabled: !item.enabled } : item
            )
          )
        }
        onRemove={(rule) =>
          void saveRules(current.rules.filter((item) => item.id !== rule.id))
        }
      />
    </div>
  );
}
