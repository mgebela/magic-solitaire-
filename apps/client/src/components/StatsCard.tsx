interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatsCard({ label, value, subtext }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-white/50">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-white">{value}</dd>
      {subtext && <p className="mt-1 text-xs text-white/40">{subtext}</p>}
    </div>
  );
}
