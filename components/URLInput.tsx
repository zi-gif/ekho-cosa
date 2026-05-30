"use client";
import { useState } from "react";

export function URLInput({ onSubmit, disabled }: { onSubmit: (url: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
      className="w-full"
    >
      <label
        htmlFor="dealer-url"
        className="block text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-2"
      >
        Or paste any U.S. dealer URL
      </label>
      <div
        className="flex items-stretch bg-[var(--color-surface-elevated)] border border-[var(--color-border-strong)] focus-within:border-[var(--color-accent)] transition-colors overflow-hidden"
        style={{ borderRadius: "var(--radius-md)" }}
      >
        <input
          id="dealer-url"
          type="text"
          inputMode="url"
          placeholder="https://www.dealerwebsite.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className="flex-1 px-4 py-3 text-[14.5px] bg-transparent outline-none placeholder:text-[var(--color-text-faint)]"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-5 text-[13.5px] font-medium text-white bg-[var(--color-text)] hover:bg-black disabled:bg-[var(--color-text-faint)] disabled:cursor-not-allowed transition-colors"
        >
          Scrape live
        </button>
      </div>
      <p className="text-[11.5px] text-[var(--color-text-faint)] mt-2">
        Live scrape uses cheerio. Sites with anti-bot will fail; fall back to a curated example.
      </p>
    </form>
  );
}
