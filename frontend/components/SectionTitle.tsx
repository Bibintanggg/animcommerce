export default function SectionTitle({ title, sub }: { title: string; sub?: string }) {
    return (
        <div className="mb-4">
            <h2 className="text-base font-semibold">{title}</h2>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
    );
}