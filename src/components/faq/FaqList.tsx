"use client";

import { HomeFilm } from "@/components/home/HomeFilm";
import { useCopy } from "@/components/i18n/useCopy";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FaqList() {
  const copy = useCopy();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="space-y-3">
        <h1 className="font-heading text-4xl leading-tight sm:text-5xl">{copy.faqPage.title}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">{copy.faqPage.lead}</p>
      </section>
      <HomeFilm src="/faq-review.mp4" poster="/faq-review.jpg" label={copy.faqPage.title} />
      <Accordion className="stagger-rows bg-card px-4">
        {copy.faqPage.items.map((entry) => (
          <AccordionItem key={entry.id} value={entry.id}>
            <AccordionTrigger className="font-heading text-base">{entry.question}</AccordionTrigger>
            <AccordionContent>
              <p className="leading-6 text-muted-foreground">{entry.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
