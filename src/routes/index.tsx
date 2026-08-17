import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import artwork from "@/assets/night-portrait.jpg";
import { BreadcrumbCharacter } from "@/components/BreadcrumbCharacter";
import {
  captureWorkState,
  recallWorkState,
  type RecallResponse,
  type WorkState,
} from "@/lib/recall-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Breadcrumb Recall — Remember where you left off" },
      {
        name: "description",
        content:
          "A quiet creative workspace where Breadcrumb remembers the decision you were still trying to make. Night Portrait study demo.",
      },
      {
        property: "og:title",
        content: "Breadcrumb Recall — Remember where you left off",
      },
      {
        property: "og:description",
        content:
          "A quiet creative workspace where Breadcrumb remembers the decision you were still trying to make. Night Portrait study demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ---------- small building blocks ---------- */

function Field({
  label,
  delay,
  children,
}: {
  label: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div className="reveal-up" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 text-[15px] leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

function OpenQuestion({ delay, text }: { delay: number; text: string }) {
  return (
    <div
      className="reveal-up rounded-3xl border-2 border-dashed border-primary/60 bg-primary/10 px-5 py-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">
        Open question — still unresolved
      </p>
      <p className="font-display mt-2 text-[19px] font-semibold leading-snug text-foreground">
        {text}
      </p>
    </div>
  );
}

function WorkStateBody({
  state,
  base = 0,
}: {
  state: WorkState;
  base?: number;
}) {
  return (
    <div className="space-y-5">
      {state.intent && (
        <Field label="Intent" delay={base}>
          {state.intent}
        </Field>
      )}

      {state.explored.length > 0 && (
      <Field label="Explored" delay={base + 220}>
        <div className="flex flex-wrap gap-2">
          {state.explored.map((e) => (
            <span
              key={e}
              className="rounded-full bg-secondary px-3 py-1 text-[13px] text-moss"
            >
              {e}
            </span>
          ))}
        </div>
      </Field>
      )}

      {state.rejected.length > 0 && (
      <Field label="Rejected" delay={base + 440}>
        <ul className="space-y-1.5">
          {state.rejected.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                {r}
              </span>
            </li>
          ))}
        </ul>
      </Field>
      )}

      {state.currentDirection && (
        <Field label="Current direction" delay={base + 660}>
          <span className="font-display text-[17px] font-semibold text-moss">
            {state.currentDirection}
          </span>
        </Field>
      )}

      {state.openQuestion && (
        <OpenQuestion delay={base + 880} text={state.openQuestion} />
      )}

      {state.nextExperiment && (
        <Field label="Next experiment" delay={base + 1100}>
          {state.nextExperiment}
        </Field>
      )}
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="crumb-enter relative max-w-[19rem] rounded-3xl rounded-br-lg border border-border bg-card px-4 py-3 text-[15px] leading-snug text-foreground shadow-soft">
      {children}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="crumb-enter w-[26rem] max-w-[calc(100vw-3rem)] overflow-hidden rounded-[28px] border border-border bg-card shadow-lift">
      <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
    </div>
  );
}

/* ---------- page ---------- */

type Phase =
  | "working"
  | "noticed"
  | "capture"
  | "saved"
  | "transition"
  | "returned"
  | "welcome"
  | "recalled";

function Index() {
  const [phase, setPhase] = useState<Phase>("working");
  const [session, setSession] = useState(1);
  const [saving, setSaving] = useState(false);
  const [recalling, setRecalling] = useState(false);
  const [captured, setCaptured] = useState<WorkState | null>(null);
  const [recall, setRecall] = useState<RecallResponse | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [recallError, setRecallError] = useState<string | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    later(() => setPhase("noticed"), 2400);
    later(() => setPhase("capture"), 5200);
    return () => timers.current.forEach(clearTimeout);
  }, [later]);

  const onRemember = async () => {
    setSaving(true);
    setCaptureError(null);
    try {
      const res = await captureWorkState();
      setCaptured(res.workState);
      setPop(true);
      setTimeout(() => setPop(false), 700);
      setPhase("saved");
    } catch (e) {
      setCaptureError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const onNewSession = () => {
    setPhase("transition");
    later(() => {
      setSession(2);
      setPhase("returned");
      window.scrollTo({ top: 0 });
    }, 2600);
    later(() => setPhase("welcome"), 4600);
  };

  const onRecall = async () => {
    setRecalling(true);
    setRecallError(null);
    try {
      const res = await recallWorkState();
      setRecall(res);
      setPop(true);
      setTimeout(() => setPop(false), 700);
      setPhase("recalled");
    } catch (e) {
      setRecallError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRecalling(false);
    }
  };

  const companionVisible = phase !== "working" && phase !== "transition";
  const showPanel = phase === "capture" || phase === "saved";
  const showRecallPanel = phase === "recalled" && recall;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* quiet workspace */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-8 pt-8">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-moss">
            Breadcrumb
          </span>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[12px] text-muted-foreground">
          {session === 1 ? "Studio — today" : "Studio — 2 days later"}
        </span>
      </header>

      <main className="mx-auto max-w-5xl px-8 pb-40 pt-14">
        <div className="max-w-xl">
          <h1 className="font-display text-[44px] font-bold leading-tight tracking-tight text-foreground">
            Night Portrait
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
            {session === 1
              ? "Palette study · last edited 14 minutes ago"
              : "Night portrait study. Keep the environment cool without losing warm skin tones."}
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <figure className="w-full max-w-[520px] rounded-[32px] bg-card p-3 shadow-soft">
            <img
              src={artwork}
              alt="Night Portrait study: a warmly lit face against a cool blue-violet night city"
              width={1280}
              height={1600}
              className="w-full rounded-[24px] object-cover"
            />
            <figcaption className="px-2 pb-1 pt-3 text-[13px] text-muted-foreground">
              night-portrait_v7.psd
            </figcaption>
          </figure>
        </div>
      </main>

      {/* time-passing transition */}
      {phase === "transition" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <p
            className="font-display reveal-up text-[28px] font-semibold tracking-tight text-moss-soft"
            style={{ animationDuration: "1.2s" }}
          >
            2 days later…
          </p>
        </div>
      )}

      {/* companion */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
        {phase === "noticed" && (
          <div className="pointer-events-auto">
            <Bubble>I noticed you stopped working on this piece.</Bubble>
          </div>
        )}

        {phase === "welcome" && (
          <div className="pointer-events-auto flex flex-col items-end gap-3">
            <Bubble>
              <span className="font-display text-[16px] font-semibold text-moss">
                Welcome back. I remember where you left off.
              </span>
            </Bubble>
            {recallError && (
              <Bubble>
                <span className="text-[14px] text-clay">{recallError}</span>
              </Bubble>
            )}
            <button
              onClick={onRecall}
              disabled={recalling}
              className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground shadow-soft transition-transform duration-200 hover:scale-[1.03] disabled:opacity-70"
            >
              {recalling
                ? "Retrieving…"
                : recallError
                  ? "Try again"
                  : "Show me"}
            </button>
          </div>
        )}

        {showPanel && (
          <div className="pointer-events-auto">
            <Panel>
              <p className="text-[15px] leading-snug text-muted-foreground">
                {captured
                  ? "I noticed you stopped working on this piece. Here's where you were."
                  : "I noticed you stopped working on this piece. Want me to remember where you are?"}
              </p>
              {captured && (
                <div className="mt-5">
                  <WorkStateBody state={captured} />
                </div>
              )}

              <div className="mt-6 border-t border-border pt-5">
                {phase === "capture" ? (
                  <div className="space-y-3">
                    <button
                      onClick={onRemember}
                      disabled={saving}
                      className="w-full rounded-full bg-primary py-3 text-[15px] font-semibold text-primary-foreground shadow-soft transition-transform duration-200 hover:scale-[1.02] disabled:opacity-70"
                    >
                      {saving
                        ? "Remembering where you left off…"
                        : captureError
                          ? "Try again"
                          : "Remember this"}
                    </button>
                    {captureError && (
                      <p className="text-center text-[13px] text-clay">
                        {captureError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="reveal-up space-y-3 text-center">
                    <p className="text-[15px] text-moss">
                      Saved. I'll hold on to the open question for you.
                    </p>
                    <button
                      onClick={onNewSession}
                      className="w-full rounded-full border border-border bg-secondary py-3 text-[15px] font-semibold text-moss transition-colors hover:bg-accent"
                    >
                      New session
                    </button>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        )}

        {showRecallPanel && (
          <div className="pointer-events-auto">
            <Panel>
              <p className="font-display text-[17px] font-semibold leading-snug text-moss">
                {recall.recall}
              </p>
              <div className="mt-5">
                <WorkStateBody state={recall.reconstructedWorkState} base={80} />
              </div>

              <div
                className="reveal-up mt-6 border-t border-border pt-4"
                style={{ animationDelay: "1300ms" }}
              >
                <p className="text-[12.5px] text-muted-foreground">
                  {recall.retrievedMemories.length} related work memories
                  retrieved from {recall.memoryStore}
                </p>
                <button
                  onClick={() => setWhyOpen((o) => !o)}
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-moss hover:text-clay"
                >
                  Why this recall?
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      whyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {whyOpen && (
                  <ul className="reveal-up mt-3 space-y-3">
                    {recall.retrievedMemories.map((m) => (
                      <li
                        key={m.memoryId}
                        className="rounded-2xl bg-secondary/70 px-4 py-3"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[13.5px] font-semibold text-foreground">
                            Memory {m.memoryId.slice(0, 8)}
                          </span>
                          {m.similarity !== null && (
                            <span className="text-[12px] text-muted-foreground">
                              Similarity {m.similarity.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Recovered
                        </p>
                        <ul className="mt-1 space-y-0.5 text-[13px] text-muted-foreground">
                          {m.recovered.map((r) => (
                            <li key={r}>• {r}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Panel>
          </div>
        )}

        {companionVisible && (
          <div className="crumb-enter pointer-events-auto">
            <BreadcrumbCharacter size={82} state={pop ? "pop" : "idle"} />
          </div>
        )}
      </div>
    </div>
  );
}
