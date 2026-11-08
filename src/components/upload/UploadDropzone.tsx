"use client";

import { useRef, useState } from "react";
import { FileUp, LoaderCircle } from "lucide-react";
import { useCopy } from "@/components/i18n/useCopy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadDropzone({ disabled }: { disabled?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const copy = useCopy();

  function submitWith(file: File) {
    const input = inputRef.current;
    const form = formRef.current;
    if (!input || !form) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    setBusy(true);
    form.submit();
  }

  return (
    <form
      ref={formRef}
      className={cn(
        "bg-card p-8 text-center",
        dragging && "bg-[var(--paper-2)]",
        disabled && "opacity-60"
      )}
      action="/api/upload-and-review"
      method="post"
      encType="multipart/form-data"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) submitWith(file);
      }}
    >
      <FileUp className="mx-auto mb-3 size-8 text-[var(--brand)]" />
      <p className="font-heading text-lg">{copy.reviewStart.drop}</p>
      <p className="mt-1 text-sm text-muted-foreground">{copy.reviewStart.hint}</p>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        name="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        required
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setBusy(true);
            formRef.current?.submit();
          }
        }}
      />
      <div className="mt-4">
        <Button
          type="button"
          disabled={busy || disabled}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <LoaderCircle className="animate-spin" /> : null}
          {busy ? copy.reviewStart.extracting : copy.reviewStart.choose}
        </Button>
      </div>
    </form>
  );
}
