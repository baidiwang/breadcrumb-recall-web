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
