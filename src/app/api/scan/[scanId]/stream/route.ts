import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const interval = setInterval(async () => {
        try {
          const scan = await db.scan.findUnique({
            where: { id: scanId },
            select: {
              status: true,
              progress: true,
              currentStep: true,
              overallScore: true,
              errorMessage: true,
            },
          });

          if (!scan) {
            const data = JSON.stringify({ error: "Scan not found" });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            controller.close();
            clearInterval(interval);
            return;
          }

          const data = JSON.stringify({
            status: scan.status,
            progress: scan.progress,
            currentStep: scan.currentStep,
            overallScore: scan.overallScore,
            errorMessage: scan.errorMessage,
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          if (scan.status === "COMPLETED" || scan.status === "FAILED") {
            controller.close();
            clearInterval(interval);
          }
        } catch {
          clearInterval(interval);
          try {
            controller.close();
          } catch {
            // Stream already closed
          }
        }
      }, 1000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
