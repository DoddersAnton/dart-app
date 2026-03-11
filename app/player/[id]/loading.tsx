import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlayerLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader><div className="h-5 w-28 animate-pulse rounded bg-muted" /></CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
