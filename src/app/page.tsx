"use client";

import Link from "next/link";
import { HomeFilm } from "@/components/home/HomeFilm";
import { useCopy } from "@/components/i18n/useCopy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const copy = useCopy();
  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-5">
        <h1 className="font-heading text-4xl leading-tight sm:text-6xl">{copy.home.title}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{copy.home.lead}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/review" className={buttonVariants({ size: "lg" })}>
            {copy.home.start}
          </Link>
          <Link
            href="/faq"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "bg-[#fffdf8] text-[#1a1406] hover:bg-[var(--brand)] hover:text-[var(--on-brand)]"
            )}
          >
            {copy.home.questions}
          </Link>
        </div>
      </section>

      <HomeFilm />

      <section className="stagger-rows grid items-start gap-3 md:grid-cols-3">
        {copy.home.steps.map((step) => (
          <article key={step.title} className="bg-card p-4">
            <h2 className="font-heading text-2xl leading-none">{step.title}</h2>
            <p className="mt-1 text-sm leading-snug text-pretty text-muted-foreground">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="grid items-start gap-6 bg-card p-5 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl leading-none">{copy.home.who}</h2>
          <p className="mt-1 text-sm leading-snug text-pretty text-muted-foreground">{copy.home.whoBody}</p>
        </div>
        <div>
          <h2 className="font-heading text-3xl leading-none">{copy.home.get}</h2>
          <ul className="mt-1 space-y-1 text-sm leading-snug text-pretty text-muted-foreground">
            {copy.home.gets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
