export default function ReviewLoading() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-48 animate-pulse bg-muted" />
        <div className="h-48 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
