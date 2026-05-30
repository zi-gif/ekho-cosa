import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildPass1Prompt, buildPass2Prompt } from "@/lib/prompts";
import { matchNearestCompetitor } from "@/lib/competitor-match";
import { ipFromHeaders, rateLimitCheck } from "@/lib/rate-limit";
import type { DealerSnapshot, EvalReport } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6";

const evalSchema = z.object({
  scores: z.array(
    z.object({
      dimension: z.enum([
        "factual_grounding",
        "specificity",
        "voice_match",
        "insight_quality",
        "outbound_discipline",
        "anti_sycophancy",
      ]),
      score: z.number().int().min(1).max(5),
      note: z.string(),
    })
  ),
  flags: z.array(
    z.object({
      excerpt: z.string(),
      dimension: z.enum([
        "factual_grounding",
        "specificity",
        "voice_match",
        "insight_quality",
        "outbound_discipline",
        "anti_sycophancy",
      ]),
      why: z.string(),
      severity: z.enum(["low", "med", "high"]),
    })
  ),
  overall: z.number().int().min(1).max(5),
});

function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
}

export async function POST(req: NextRequest) {
  const ip = ipFromHeaders(req.headers);
  const rl = await rateLimitCheck(ip);
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: "Daily limit reached. Try a curated example or come back tomorrow." }),
      { status: 429, headers: { "content-type": "application/json" } }
    );
  }

  const { dealer } = (await req.json()) as { dealer?: DealerSnapshot };
  if (!dealer) {
    return new Response(JSON.stringify({ error: "dealer required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY not configured on the server. Add it locally in .env.local or in Vercel project settings.",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const competitor = matchNearestCompetitor(dealer);
  const client = new Anthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        send({ kind: "competitor", data: competitor });

        const { system, user } = await buildPass1Prompt(dealer, competitor);

        let pass1 = "";
        const s1 = await client.messages.stream({
          model: MODEL,
          max_tokens: 3500,
          system,
          messages: [{ role: "user", content: user }],
        });

        for await (const chunk of s1) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            pass1 += chunk.delta.text;
            send({ kind: "chunk", text: chunk.delta.text });
          }
        }
        send({ kind: "pass1_done", text: pass1 });

        // Pass 2: eval
        const p2 = await buildPass2Prompt(dealer, competitor, pass1);
        const r2 = await client.messages.create({
          model: MODEL,
          max_tokens: 1800,
          system: p2.system,
          messages: [{ role: "user", content: p2.user }],
        });

        const rawJson = r2.content
          .filter((c): c is Anthropic.TextBlock => c.type === "text")
          .map((c) => c.text)
          .join("");

        try {
          const parsed = evalSchema.parse(JSON.parse(stripFences(rawJson)));
          send({ kind: "eval", data: parsed satisfies EvalReport });
        } catch {
          send({
            kind: "eval_error",
            message: "Flags unavailable, retry to refresh evaluation.",
          });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "generation failed";
        send({ kind: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
