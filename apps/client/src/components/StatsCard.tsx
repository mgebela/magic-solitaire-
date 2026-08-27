interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatsCard({ label, value, subtext }: StatsCardProps) {
  return (
    <div className="stat-cell">
      <dt className="text-xs font-medium uppercase tracking-wide text-white/50">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-white">{value}</dd>
      {subtext && <p className="mt-1 text-xs text-white/40">{subtext}</p>}
    </div>
  );
}
