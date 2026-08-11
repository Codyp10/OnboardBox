/**
 * Reporting service boundary.
 * Returns mock/high-level metrics until provider APIs are wired.
 * Never includes individual lead records.
 */

import { demoDb, isDemoMode } from "@/lib/demo/store";
import type { ReportingMetric } from "@/lib/types/database";

export type ChannelSummary = {
  channel: string;
  label: string;
  metrics: Record<string, number>;
};

const CHANNEL_LABELS: Record<string, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  google_lsa: "Google LSA",
  seo: "SEO",
  geo: "GEO",
  google_business_profile: "Google Business Profile",
};

export async function getCompanyReporting(companyId: string): Promise<{
  source: "mock" | "live";
  periodLabel: string;
  overall: Record<string, number>;
  channels: ChannelSummary[];
  raw: ReportingMetric[];
}> {
  const metrics = isDemoMode()
    ? demoDb.listMetrics(companyId)
    : ([] as ReportingMetric[]);

  const byChannel = new Map<string, Record<string, number>>();
  for (const metric of metrics) {
    const bucket = byChannel.get(metric.channel) ?? {};
    bucket[metric.metric_name] = metric.metric_value;
    byChannel.set(metric.channel, bucket);
  }

  const channels: ChannelSummary[] = [...byChannel.entries()].map(
    ([channel, channelMetrics]) => ({
      channel,
      label: CHANNEL_LABELS[channel] ?? channel,
      metrics: enrichChannelMetrics(channel, channelMetrics),
    }),
  );

  const overall = {
    spend: sumMetric(metrics, "spend"),
    leads: sumMetric(metrics, "leads"),
    clicks: sumMetric(metrics, "clicks"),
    impressions: sumMetric(metrics, "impressions"),
  };
  const cpl =
    overall.leads > 0 ? Math.round((overall.spend / overall.leads) * 100) / 100 : 0;

  return {
    source: "mock",
    periodLabel: "July 2026",
    overall: { ...overall, cost_per_lead: cpl },
    channels,
    raw: metrics,
  };
}

function sumMetric(metrics: ReportingMetric[], name: string) {
  return metrics
    .filter((m) => m.metric_name === name)
    .reduce((acc, m) => acc + Number(m.metric_value), 0);
}

function enrichChannelMetrics(
  channel: string,
  metrics: Record<string, number>,
): Record<string, number> {
  const next = { ...metrics };
  if (
    (channel === "google_ads" || channel === "meta_ads" || channel === "google_lsa") &&
    next.spend != null &&
    next.leads
  ) {
    next.cost_per_lead = Math.round((next.spend / next.leads) * 100) / 100;
  }
  return next;
}
