export function TopBar() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-30 backdrop-blur-sm bg-[rgba(255,255,255,0.85)]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 h-[60px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group" aria-label="Ekho home">
          <EkhoMark />
          <span className="display text-[22px] leading-none tracking-[-0.03em] text-[var(--color-text)]">
            Ekho
          </span>
        </a>
        <span className="hidden sm:inline text-[12.5px] text-[var(--color-text-muted)] tracking-tight">
          Dealer Outbound Intelligence Agent
        </span>
      </div>
    </header>
  );
}

function EkhoMark() {
  // Concentric arcs nodding to "echo" — sharp, minimal, on Ekho's black-on-white tone.
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="11" cy="11" r="2.5" fill="var(--color-text)" />
      <path
        d="M11 4.5a6.5 6.5 0 0 1 6.5 6.5"
        stroke="var(--color-text)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 1a10 10 0 0 1 10 10"
        stroke="var(--color-text)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
