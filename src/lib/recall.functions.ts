import { createServerFn } from "@tanstack/react-start";

import { capture, recall } from "./recall-backend.server";

export const captureFn = createServerFn({ method: "POST" }).handler(async () =>
  capture(),
);

export const recallFn = createServerFn({ method: "POST" }).handler(async () =>
  recall(),
);
