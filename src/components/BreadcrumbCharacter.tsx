type Props = {
  size?: number;
  state?: "idle" | "pop";
  className?: string;
};

/** The Breadcrumb toaster companion — crumb-gold body, moss-green line work. */
export function BreadcrumbCharacter({
  size = 76,
  state = "idle",
  className = "",
}: Props) {
  return (
    <div
      className={`${state === "pop" ? "crumb-pop" : "crumb-float"} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* toast slice popping out */}
        <g
          style={{
            transform: state === "pop" ? "translateY(-8px)" : "translateY(0)",
            transition: "transform 420ms var(--spring)",
          }}
        >
          <path
            d="M34 26c0-5 3-8 7-8h18c4 0 7 3 7 8v20H34V26z"
            fill="var(--crumb-soft)"
            stroke="var(--moss)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>

        {/* toaster body */}
        <rect
          x="18"
          y="42"
          width="64"
          height="42"
          rx="14"
          fill="var(--crumb)"
          stroke="var(--moss)"
          strokeWidth="3.2"
        />
        {/* slot */}
        <rect
          x="30"
          y="48"
          width="40"
          height="5"
          rx="2.5"
          fill="var(--moss)"
          opacity="0.5"
        />
        {/* eyes */}
        <circle cx="40" cy="66" r="3.4" fill="var(--moss)" />
        <circle cx="60" cy="66" r="3.4" fill="var(--moss)" />
        {/* smile */}
        <path
          d="M44 73c2.4 2.4 9.6 2.4 12 0"
          stroke="var(--moss)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* lever */}
        <path
          d="M82 58h6"
          stroke="var(--moss)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* crumbs */}
        <circle cx="16" cy="90" r="2.2" fill="var(--crumb)" />
        <circle cx="26" cy="93" r="1.6" fill="var(--crumb)" />
        <circle cx="86" cy="91" r="1.8" fill="var(--crumb)" />
      </svg>
    </div>
  );
}
