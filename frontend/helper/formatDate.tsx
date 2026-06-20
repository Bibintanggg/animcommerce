export function formatDate(dateStr: string | null) {
    if (!dateStr) return <span className="text-muted-foreground text-xs">—</span>;
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}