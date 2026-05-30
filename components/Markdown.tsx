import React from "react";

/** Tiny markdown renderer for the brief output. Handles ## ### **bold** bullets and paragraphs. */
export function Markdown({ source }: { source: string }) {
  const blocks = splitBlocks(source);
  return (
    <div className="prose-brief">
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function splitBlocks(src: string): Block[] {
  const lines = src.split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ").trim() });
      para = [];
    }
  };
  const flushList = () => {
    if (list && list.length) {
      blocks.push({ type: "ul", items: list });
    }
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara(); flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara(); flushList();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (!list) list = [];
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return blocks;
}

function renderBlock(b: Block, key: number): React.ReactNode {
  switch (b.type) {
    case "h2":
      return <h2 key={key}>{renderInline(b.text)}</h2>;
    case "h3":
      return <h3 key={key}>{renderInline(b.text)}</h3>;
    case "p":
      return <p key={key}>{renderInline(b.text)}</p>;
    case "ul":
      return (
        <ul key={key}>
          {b.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );
  }
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const rx = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = rx.exec(text))) {
    if (m.index > last) parts.push(<span key={i++}>{text.slice(last, m.index)}</span>);
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={i++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) parts.push(<code key={i++}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(<span key={i++}>{text.slice(last)}</span>);
  return parts;
}
