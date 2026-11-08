import { hasTiger } from "@/lib/env";
import type { Review } from "@/types/review";

let ready: Promise<void> | null = null;

async function ensureTable(): Promise<void> {
  const url = process.env.TIGER_DATABASE_URL?.trim();
  if (!url) return;
  const { Client } = await import("pg");
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 8_000 });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS vericlause_review_events (
        time timestamptz NOT NULL DEFAULT now(),
        review_id text NOT NULL,
        filename text NOT NULL,
        verdict text NOT NULL,
        duration_ms integer NOT NULL,
        finding_count integer NOT NULL,
        red_count integer NOT NULL,
        mode text NOT NULL,
        model text NOT NULL,
        digest text NOT NULL
      )
    `);
    await client.query(`
      SELECT create_hypertable('vericlause_review_events', 'time', if_not_exists => TRUE)
    `).catch(() => undefined);
  } finally {
    await client.end();
  }
}

export async function recordReview(review: Review): Promise<boolean> {
  if (!hasTiger()) return false;
  const url = process.env.TIGER_DATABASE_URL?.trim();
  if (!url) return false;
  try {
    ready ??= ensureTable();
    await ready;
    const { Client } = await import("pg");
    const client = new Client({ connectionString: url, connectionTimeoutMillis: 8_000 });
    await client.connect();
    try {
      const reds = review.findings.filter((finding) => finding.severity === "red").length;
      await client.query(
        `INSERT INTO vericlause_review_events
          (review_id, filename, verdict, duration_ms, finding_count, red_count, mode, model, digest)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          review.id,
          review.filename,
          review.verdict,
          review.durationMs,
          review.findings.length,
          reds,
          review.mode,
          review.attribution?.model || "sample",
          review.attribution?.digest || "",
        ]
      );
      return true;
    } finally {
      await client.end();
    }
  } catch {
    ready = null;
    return false;
  }
}
