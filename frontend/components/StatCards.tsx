export default function StatCard({label,value,icon,sub,accent}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    sub?: string;
    accent?: string;
}) {
    return (
        <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                <span className={`p-1.5 rounded-lg ${accent ?? "bg-muted"}`}>{icon}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold">{value}</span>
                {sub && <span className="text-xs text-muted-foreground mb-0.5">{sub}</span>}
            </div>
        </div>
    );
}