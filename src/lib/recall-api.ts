import type { CaptureResponse, RecallResponse } from "./recall-types";

export type { WorkState, RetrievedMemory, CaptureResponse, RecallResponse } from "./recall-types";

const BACKEND_URL = "https://gvzzvmmdaqzhynsm5dwy45iqxi0glflr.lambda-url.us-east-1.on.aws";

const PROJECT_ID = "night-portrait";
const MEMORY_STORE = "CockroachDB";

const CAPTURE_CONTEXT =
  "Night Portrait palette study. I want the character to feel warm and inviting against a cool nighttime environment. " +
  "I tried a warm yellow background but it competed with the subject. I tried a deep blue background but it made the skin tones feel muddy. " +
  "Right now I am leaning toward a muted blue-violet. I still cannot decide how to keep the environment cool without making the skin feel muddy. " +
  "Next I want to reduce background saturation while preserving warm highlights.";

const RECALL_CONTEXT =
  "Night portrait study. Keep the environment cool without losing warm skin tones.";

type RawWorkState = {
  intent?: unknown;
  explored_directions?: unknown;
  rejected_directions?: unknown;
  current_direction?: unknown;
  unresolved_question?: unknown;
  next_experiment?: unknown;
};

function requireString(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Invalid Work State response.");
  }
  return value;
}

function requireStrings(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("Invalid Work State response.");
  }
  return value;
}

function normalizeWorkState(raw: RawWorkState | undefined | null) {
  if (!raw) throw new Error("Invalid Work State response.");
  return {
    intent: requireString(raw.intent),
    explored: requireStrings(raw.explored_directions),
    rejected: requireStrings(raw.rejected_directions),
    currentDirection: requireString(raw.current_direction),
    openQuestion: requireString(raw.unresolved_question),
    nextExperiment: requireString(raw.next_experiment),
  };
}

async function post(path: string, context: string, friendlyError: string) {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId: PROJECT_ID, context }),
    });
    const body = (await response.json().catch(() => null)) as unknown;
    if (!response.ok || !body || typeof body !== "object") {
      throw new Error(friendlyError);
    }
    return body as Record<string, unknown>;
  } catch {
    throw new Error(friendlyError);
  }
}

export async function captureWorkState(): Promise<CaptureResponse> {
  const data = await post(
    "/api/capture",
    CAPTURE_CONTEXT,
    "Breadcrumb couldn't save this work state. Try again.",
  );

  try {
    if (data["saved"] !== true) throw new Error("Capture was not saved.");
    return {
      saved: true,
      memoryId: requireString(data["memoryId"]),
      workState: normalizeWorkState(data["workState"] as RawWorkState),
    };
  } catch {
    throw new Error("Breadcrumb couldn't save this work state. Try again.");
  }
}

export async function recallWorkState(): Promise<RecallResponse> {
  const data = await post(
    "/api/recall",
    RECALL_CONTEXT,
    "Breadcrumb couldn't retrieve this memory. Try again.",
  );

  try {
    if (!Array.isArray(data["retrievedMemories"])) {
      throw new Error("Missing retrieved memories.");
    }

    const retrievedMemories = data["retrievedMemories"].map((item) => {
      if (!item || typeof item !== "object") throw new Error("Invalid memory evidence.");
      const raw = item as Record<string, unknown>;
      const workState = normalizeWorkState(raw["workState"] as RawWorkState);
      const distance = raw["distance"];
      if (distance !== undefined && (typeof distance !== "number" || !Number.isFinite(distance))) {
        throw new Error("Invalid memory distance.");
      }
      return {
        memoryId: requireString(raw["memoryId"]),
        distance: typeof distance === "number" ? distance : null,
        recovered: [
          ...workState.rejected.map((value) => `rejected — ${value}`),
          `direction — ${workState.currentDirection}`,
          `open question — ${workState.openQuestion}`,
        ],
      };
    });

    if (retrievedMemories.length === 0) throw new Error("No memory evidence returned.");

    return {
      recall: requireString(data["recall"]),
      reconstructedWorkState: normalizeWorkState(data["reconstructedWorkState"] as RawWorkState),
      retrievedMemories,
      memoryStore: MEMORY_STORE,
    };
  } catch {
    throw new Error("Breadcrumb couldn't retrieve this memory. Try again.");
  }
}
