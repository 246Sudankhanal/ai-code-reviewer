import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";

/**
 * Next.js loads this on boot. Traces go to SigNoz Cloud only when both
 * SIGNOZ_INGESTION_KEY and OTEL_EXPORTER_OTLP_TRACES_ENDPOINT are set.
 * Production-only. Local `next dev` never exports, even if keys exist in `.env`.
 */
export function register() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const ingestionKey = process.env.SIGNOZ_INGESTION_KEY?.trim();
  const tracesUrl = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim();

  if (!ingestionKey || !tracesUrl) {
    return;
  }

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME?.trim() || "aiprreviewer",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: tracesUrl,
      headers: { "signoz-ingestion-key": ingestionKey },
    }),
  });
}
