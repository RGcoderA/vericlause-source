import type { Contract } from "@/types/contract";
import type { Playbook } from "@/types/playbook";
import type { Review } from "@/types/review";
import { createDefaultPlaybook } from "@/lib/playbook/default-playbook";

type Store = {
  contracts: Map<string, Contract>;
  reviews: Map<string, Review>;
  playbooks: Map<string, Playbook>;
  fingerprints: Map<string, string>;
  pending: Map<string, Promise<Review>>;
};

const globalStore = globalThis as typeof globalThis & { __vericlause?: Store };

function store(): Store {
  if (!globalStore.__vericlause) {
    globalStore.__vericlause = {
      contracts: new Map(),
      reviews: new Map(),
      playbooks: new Map(),
      fingerprints: new Map(),
      pending: new Map(),
    };
  }
  if (!globalStore.__vericlause.pending) globalStore.__vericlause.pending = new Map();
  return globalStore.__vericlause;
}

export function shareReviewRun(key: string, run: () => Promise<Review>): Promise<Review> {
  const pending = store().pending;
  const existing = pending.get(key);
  if (existing) return existing;
  const promise = run().finally(() => {
    if (pending.get(key) === promise) pending.delete(key);
  });
  pending.set(key, promise);
  return promise;
}

export function saveContract(contract: Contract): Contract {
  store().contracts.set(contract.id, contract);
  return contract;
}

export function getContract(id: string): Contract | undefined {
  return store().contracts.get(id);
}

export function saveReview(review: Review): Review {
  store().reviews.set(review.id, review);
  store().fingerprints.set(`${review.sessionId}:${review.fingerprint}`, review.id);
  return review;
}

export function getReview(id: string): Review | undefined {
  return store().reviews.get(id);
}

export function getReviewByFingerprint(sessionId: string, fingerprint: string): Review | undefined {
  const id = store().fingerprints.get(`${sessionId}:${fingerprint}`);
  if (!id) return undefined;
  const review = store().reviews.get(id);
  if (!review || review.status !== "complete") return undefined;
  return review;
}

export function listReviews(sessionId: string): Review[] {
  return [...store().reviews.values()]
    .filter((review) => review.sessionId === sessionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPlaybook(sessionId: string): Playbook {
  const existing = store().playbooks.get(sessionId);
  if (existing) return existing;
  const created = createDefaultPlaybook();
  store().playbooks.set(sessionId, created);
  return created;
}

export function savePlaybook(sessionId: string, playbook: Playbook): Playbook {
  const next: Playbook = {
    ...playbook,
    version: playbook.version + 1,
    updatedAt: new Date().toISOString(),
  };
  store().playbooks.set(sessionId, next);
  return next;
}

export function replacePlaybook(sessionId: string, playbook: Playbook): Playbook {
  store().playbooks.set(sessionId, playbook);
  return playbook;
}