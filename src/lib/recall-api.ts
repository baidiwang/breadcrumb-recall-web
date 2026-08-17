import { captureFn, recallFn } from "./recall.functions";
import type { CaptureResponse, RecallResponse } from "./recall-types";

export type {
  WorkState,
  RetrievedMemory,
  CaptureResponse,
  RecallResponse,
} from "./recall-types";

export async function captureWorkState(): Promise<CaptureResponse> {
  return (await captureFn()) as CaptureResponse;
}

export async function recallWorkState(): Promise<RecallResponse> {
  return (await recallFn()) as RecallResponse;
}
