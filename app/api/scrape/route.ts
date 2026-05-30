import { NextRequest } from "next/server";
import { scrapeDealer } from "@/lib/scrape";
import { ipFromHeaders, rateLimitCheck } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = ipFromHeaders(req.headers);
  const rl = await rateLimitCheck(ip);
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: "Daily limit reached. Try a curated example or come back tomorrow." }),
      { status: 429, headers: { "content-type": "application/json" } }
    );
  }

  const { url } = (await req.json()) as { url?: string };
  if (!url || typeof url !== "string") {
    return new Response(JSON.stringify({ error: "URL required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of scrapeDealer(url)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "scrape failed";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ kind: "error", message })}\n\n`)
        );
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
