/**
 * Server-side proxy to the Breadcrumb Recall production backend.
 * The backend only allows CORS from the published origin, so all calls
 * are made server-side.
 *
 *   GET  /api/health
 *   POST /api/capture  { projectId, context } -> { saved, memoryId, workState }
 *   POST /api/recall   { projectId, context } -> { recall, retrievedMemories, reconstructedWorkState }
 */
import type {
  CaptureResponse,
  RecallResponse,
  RetrievedMemory,
  WorkState,
} from "./recall-types";

const BACKEND_URL =
  "https://gvzzvmmdaqzhynsm5dwy45iqxi0glflr.lambda-url.us-east-1.on.aws";

const PROJECT_ID = "night-portrait";
const MEMORY_STORE = "CockroachDB";

/** Full session-1 context the artist was working in (sent on capture). */
const CAPTURE_CONTEXT =
  "Night Portrait palette study. I want the character to feel warm and inviting against a cool nighttime environment. " +
  "I tried a warm yellow background but it competed with the subject. I tried a deep blue background but it made the skin tones feel muddy. " +
  "Right now I am leaning toward a muted blue-violet. I still cannot decide how to keep the environment cool without making the skin feel muddy. " +
  "Next I want to reduce background saturation while preserving warm highlights.";

/** Session-2 partial context only — no history, no rejected directions. */
const RECALL_CONTEXT =
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

async function post<T extends { error?: string }>(
  path: string,
  context: string,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: PROJECT_ID, context }),
    });
  } catch {
    throw new Error("Couldn't reach Breadcrumb's memory. Please try again.");
  }
  const json = (await res.json().catch(() => null)) as T | null;
  if (!res.ok || !json || json.error) {
    throw new Error(json?.error ?? `Request failed (${res.status}).`);
  }
  return json;
}

export async function capture(): Promise<CaptureResponse> {
  const data = await post<{
    error?: string;
    saved?: boolean;
    memoryId?: string;
    workState?: RawWorkState;
  }>("/api/capture", CAPTURE_CONTEXT);

  return {
    saved: data.saved ?? true,
    memoryId: data.memoryId ?? "",
    workState: normalizeWorkState(data.workState),
  };
}

export async function recall(): Promise<RecallResponse> {
  const data = await post<{
    error?: string;
    recall?: string;
    reconstructedWorkState?: RawWorkState;
    retrievedMemories?: {
      memoryId?: string;
      distance?: number;
      workState?: RawWorkState;
    }[];
  }>("/api/recall", RECALL_CONTEXT);

  const retrievedMemories: RetrievedMemory[] = (
    data.retrievedMemories ?? []
  ).map((m, i) => {
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
  });

  return {
    recall: data.recall ?? "",
    reconstructedWorkState: normalizeWorkState(data.reconstructedWorkState),
    retrievedMemories,
    memoryStore: MEMORY_STORE,
  };
}
