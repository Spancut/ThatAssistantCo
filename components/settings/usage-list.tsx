import type { FeatureUsageSummary } from "@/lib/server/entitlements";

const FEATURE_LABELS: Record<string, string> = {
  ai_generations_per_month: "AI generations / month",
  max_clients: "Clients",
  max_contacts: "Contacts",
};

function labelFor(featureKey: string): string {
  return FEATURE_LABELS[featureKey] ?? featureKey.replace(/_/g, " ");
}

export function UsageList({ features }: { features: FeatureUsageSummary[] }) {
  if (features.length === 0) {
    return <p className="text-sm text-muted-foreground">No entitlements configured yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {features.map((feature) => (
        <li key={feature.featureKey} className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm font-medium capitalize text-foreground">
            {labelFor(feature.featureKey)}
          </span>
          <span className="text-sm text-muted-foreground">
            {feature.limit === null
              ? `${feature.used} used · unlimited`
              : `${feature.used} / ${feature.limit} used`}
          </span>
        </li>
      ))}
    </ul>
  );
}
