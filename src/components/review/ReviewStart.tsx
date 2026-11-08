"use client";

import { DemoContractPicker } from "@/components/upload/DemoContractPicker";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { useCopy } from "@/components/i18n/useCopy";

export function ReviewStart() {
  const copy = useCopy();
  return (
    <div className="space-y-10">
      <section className="max-w-3xl space-y-4">
        <h1 className="font-heading text-4xl leading-tight sm:text-5xl">{copy.reviewStart.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{copy.reviewStart.lead}</p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <UploadDropzone />
        <div className="space-y-3">
          <h2 className="font-heading text-xl">{copy.reviewStart.demo}</h2>
          <DemoContractPicker />
        </div>
      </section>
    </div>
  );
}
