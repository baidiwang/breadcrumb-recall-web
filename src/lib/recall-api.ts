/**
 * Breadcrumb Recall — production backend integration.
 *
 *   GET  /api/health
 *   POST /api/capture  { projectId, context } -> { saved, memoryId, workState }
 *   POST /api/recall   { projectId, context } -> { recall, retrievedMemories, reconstructedWorkState }
 */

export type WorkState = {
  intent: string;
  explored: string[];
  rejected: string[];
  currentDirection: string;
  openQuestion: string;
  nextExperiment: string;
};

export type RetrievedMemory = {
  memoryId: string;
  similarity: number | null;
  recovered: string[];
};

export type CaptureResponse = {
  workState: WorkState;
  memoryId: string;
  saved: boolean;
};

export type RecallResponse = {
  recall: string;
  retrievedMemories: RetrievedMemory[];
  reconstructedWorkState: WorkState;
  memoryStore: string;
};

const BACKEND_URL =
  "https://gvzzvmmdaqzhynsm5dwy45iqxi0glflr.lambda-url.us-east-1.on.aws";

export const PROJECT_ID = "night-portrait";
export const MEMORY_STORE = "CockroachDB";

/** Full session-1 context the artist was working in (sent on capture). */
export const CAPTURE_CONTEXT =
  "Night Portrait palette study. I want the character to feel warm and inviting against a cool nighttime environment. " +
  "I tried a warm yellow background but it competed with the subject. I tried a deep blue background but it made the skin tones feel muddy. " +
  "Right now I am leaning toward a muted blue-violet. I still cannot decide how to keep the environment cool without making the skin feel muddy. " +
  "Next I want to reduce background saturation while preserving warm highlights.";

/** Session-2 partial context only — no history, no rejected directions. */
export const RECALL_CONTEXT =
  "Night portrait study. Keep the environment cool without losing warm skin tones.";

type RawWorkState = {
  intent?: string;
  explored_directions?: string[];
  rejected_directions?: string[];
  current_direction?: string;
  unresolved_question?: string;
  next_experiment?: string;
};

function normalizeWorkState(raw: RawWorkState | undefined | null): WorkState {
  return {
    intent: raw?.intent ?? "",
    explored: raw?.explored_directions ?? [],
    rejected: raw?.rejected_directions ?? [],
    currentDirection: raw?.current_direction ?? "",
    openQuestion: raw?.unresolved_question ?? "",
    nextExperiment: raw?.next_experiment ?? "",
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach Breadcrumb's memory. Check your connection.");
  }
  const json = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!res.ok || !json || json.error) {
    throw new Error(json?.error ?? `Request failed (${res.status}).`);
  }
  return json;
}

export async function captureWorkState(): Promise<CaptureResponse> {
  const data = await post<{
    saved?: boolean;
    memoryId?: string;
    workState?: RawWorkState;
  }>("/api/capture", { projectId: PROJECT_ID, context: CAPTURE_CONTEXT });

  return {
    saved: data.saved ?? true,
    memoryId: data.memoryId ?? "",
    workState: normalizeWorkState(data.workState),
  };
}

export async function recallWorkState(): Promise<RecallResponse> {
  const data = await post<{
    recall?: string;
    reconstructedWorkState?: RawWorkState;
    retrievedMemories?: {
      memoryId?: string;
      distance?: number;
      workState?: RawWorkState;
    }[];
  }>("/api/recall", { projectId: PROJECT_ID, context: RECALL_CONTEXT });

  const retrievedMemories: RetrievedMemory[] = (data.retrievedMemories ?? []).map(
    (m, i) => {
      const ws = normalizeWorkState(m.workState);
      const recovered = [
        ...ws.rejected.map((r) => `rejected — ${r}`),
        ws.currentDirection ? `direction — ${ws.currentDirection}` : "",
        ws.openQuestion ? `open question — ${ws.openQuestion}` : "",
      ].filter(Boolean);
      return {
        memoryId: m.memoryId ?? `memory-${i}`,
        similarity: typeof m.distance === "number" ? 1 - m.distance : null,
        recovered,
      };
    },
  );

  return {
    recall: data.recall ?? "",
    reconstructedWorkState: normalizeWorkState(data.reconstructedWorkState),
    retrievedMemories,
    memoryStore: MEMORY_STORE,
  };
}
