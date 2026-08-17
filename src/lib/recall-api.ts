/**
 * Integration points for the Breadcrumb Recall backend.
 *
 * Real endpoints (swap MOCK to false once available):
 *   POST /api/capture -> { workState, memoryId, saved }
 *   POST /api/recall  -> { recall, currentContext, retrievedMemories, reconstructedWorkState }
 */

export type WorkState = {
  project: string;
  intent: string;
  explored: string[];
  rejected: { label: string; reason: string }[];
  currentDirection: string;
  openQuestion: string;
  nextExperiment: string;
};

export type RetrievedMemory = {
  title: string;
  date: string;
  similarity: number;
  recovered: string[];
};

export type CaptureResponse = {
  workState: WorkState;
  memoryId: string;
  saved: boolean;
};

export type RecallResponse = {
  recall: string;
  currentContext: string;
  retrievedMemories: RetrievedMemory[];
  reconstructedWorkState: WorkState;
  memoryStore: string;
};

const USE_MOCK = true;

export const NIGHT_PORTRAIT_STATE: WorkState = {
  project: "Night Portrait",
  intent: "Create a warm character against a cool nighttime environment.",
  explored: ["Warm yellow", "Deep blue", "Muted blue-violet"],
  rejected: [
    { label: "Warm yellow", reason: "Competed with the subject." },
    { label: "Deep blue", reason: "Made the skin tones feel muddy." },
  ],
  currentDirection: "Muted blue-violet.",
  openQuestion:
    "How can the environment remain cool without making the skin feel muddy?",
  nextExperiment:
    "Reduce background saturation while preserving warm highlights.",
};

const MOCK_MEMORIES: RetrievedMemory[] = [
  {
    title: "Night Portrait",
    date: "Aug 16",
    similarity: 0.89,
    recovered: [
      "deep blue was rejected",
      "muted blue-violet became the current direction",
      "unresolved palette decision",
    ],
  },
  {
    title: "Palette test — cool backdrops",
    date: "Aug 14",
    similarity: 0.74,
    recovered: ["cool backdrop dulled warm skin", "kept highlights untouched"],
  },
  {
    title: "Evening light study",
    date: "Aug 09",
    similarity: 0.68,
    recovered: ["warm rim light reads best at low saturation"],
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function captureWorkState(
  workState: WorkState,
): Promise<CaptureResponse> {
  if (USE_MOCK) {
    await delay(700);
    return { workState, memoryId: "mem_night_portrait_0816", saved: true };
  }
  const res = await fetch("/api/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workState }),
  });
  return (await res.json()) as CaptureResponse;
}

export async function recallWorkState(query: string): Promise<RecallResponse> {
  if (USE_MOCK) {
    await delay(900);
    return {
      recall: "Welcome back. I remember where you left off.",
      currentContext:
        "Night portrait study. Keep the environment cool without losing warm skin tones.",
      retrievedMemories: MOCK_MEMORIES,
      reconstructedWorkState: NIGHT_PORTRAIT_STATE,
      memoryStore: "CockroachDB",
    };
  }
  const res = await fetch("/api/recall", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return (await res.json()) as RecallResponse;
}
