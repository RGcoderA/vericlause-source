"use client";

import Link from "next/link";
import { useCopy } from "@/components/i18n/useCopy";

export function PlaybookLocked({
  signedIn,
  showSignIn,
  rules,
}: {
  signedIn: boolean;
  showSignIn: boolean;
  rules: { id: string; name: string; description: string }[];
}) {
  const copy = useCopy();
  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-heading text-4xl">{copy.playbook.title}</h1>
      <p className="text-sm text-muted-foreground">{signedIn ? copy.playbook.signedIn : copy.playbook.signedOut}</p>
      <ul className="space-y-3">
        {rules.map((rule) => (
          <li key={rule.id} className="bg-card p-4">
            <p className="font-bold">{rule.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
          </li>
        ))}
      </ul>
      <Link href={showSignIn ? "/login" : "/review"} className="text-sm font-bold underline">
        {showSignIn ? copy.playbook.signIn : copy.playbook.start}
      </Link>
    </section>
  );
}
