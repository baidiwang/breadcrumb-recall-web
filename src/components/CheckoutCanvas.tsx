/**
 * A quiet product-design canvas: a mobile checkout frame mid-iteration,
 * with a small rejected variant pinned beside it. Pure HTML/CSS.
 */

function ProgressBarTreatment() {
  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-2/3 rounded-full bg-primary" />
      </div>
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
        Step 2 of 3
      </p>
    </div>
  );
}

function CircularStepsVariant() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className={`grid h-5 w-5 place-items-center rounded-full border-2 text-[9px] font-bold ${
              i < 2
                ? "border-muted-foreground/50 text-muted-foreground"
                : "border-border text-muted-foreground/50"
            }`}
          >
            {i + 1}
          </span>
          {i < 2 && <span className="h-[2px] w-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function OrderLine({
  name,
  meta,
  price,
}: {
  name: string;
  meta: string;
  price: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold text-foreground">
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground">{meta}</p>
      </div>
      <span className="text-[12.5px] font-semibold text-foreground">
        {price}
      </span>
    </div>
  );
}

export function CheckoutCanvas() {
  return (
    <div className="relative w-full overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-soft sm:p-8">
      {/* canvas grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--moss) 14%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
        {/* main frame */}
        <div className="w-full max-w-[286px]">
          <p className="mb-2 pl-1 text-[11px] font-semibold tracking-wide text-moss-soft">
            Checkout / Header — v7
          </p>
          <div className="rounded-[28px] border-2 border-moss/25 bg-background p-4 shadow-lift">
            {/* status bar */}
            <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-semibold text-muted-foreground">
              <span>9:41</span>
              <span className="flex gap-1">
                <span className="h-2 w-3 rounded-[2px] bg-muted-foreground/40" />
                <span className="h-2 w-3 rounded-[2px] bg-muted-foreground/40" />
              </span>
            </div>

            {/* progress treatment */}
            <ProgressBarTreatment />

            <h2 className="font-display mt-4 text-[19px] font-bold tracking-tight text-foreground">
              Checkout
            </h2>

            <div className="mt-4 space-y-3 rounded-2xl bg-card p-3">
              <OrderLine name="Linen Overshirt" meta="Sand · M" price="$88" />
              <OrderLine name="Wool Socks" meta="2-pack" price="$18" />
            </div>

            <div className="mt-4 space-y-1.5 px-1 text-[12px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>$106.00</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>$6.00</span>
              </div>
              <div className="flex justify-between pt-1 text-[13px] font-bold text-foreground">
                <span>Total</span>
                <span>$112.00</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-full bg-primary py-2.5 text-[13.5px] font-semibold text-primary-foreground shadow-soft"
            >
              Continue
            </button>
          </div>
        </div>

        {/* side rail: rejected variant + layer notes */}
        <div className="w-full max-w-[286px] space-y-4 md:w-[190px] md:pt-6">
          <div className="rounded-2xl border border-dashed border-border bg-background/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Variant A — set aside
            </p>
            <div className="mt-2.5 opacity-55">
              <CircularStepsVariant />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Layers
            </p>
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-muted-foreground">
              {[
                "Header / progress",
                "Order summary",
                "Totals",
                "CTA / Continue",
              ].map((l, i) => (
                <li key={l} className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === 0 ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                  <span className={i === 0 ? "text-moss" : ""}>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="relative mt-6 text-center text-[13px] text-muted-foreground">
        checkout-header_v7 · unsaved changes
      </p>
    </div>
  );
}
