"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { CreditCard, Plus, Check, X, Users, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teamSubscriptionSchema, zTeamSubscriptionSchema } from "@/types/add-subscription";
import { createTeamSubscription } from "@/server/actions/create-team-subscription";
import { updateSubscriptionStatus } from "@/server/actions/update-subscription-status";

export type SubRow = { id: number; playerId: number; playerName: string; status: string; amount: number };
export type SubGroup = {
  key: string;
  season: string;
  subscriptionType: string;
  description: string;
  amount: number;
  startDate: string | null;
  endDate: string | null;
  totalCount: number;
  paidCount: number;
  paidPct: number;
  totalValue: number;
  paidValue: number;
  subs: SubRow[];
};

type SeasonOption = { name: string; startDate: string; endDate: string };

export function TeamSubscriptionsClient({
  groups,
  seasons,
  teamName,
  playerCount,
  canManage,
}: {
  groups: SubGroup[];
  seasons: SeasonOption[];
  teamName: string;
  playerCount: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const selected = groups.find((g) => g.key === selectedKey) ?? null;

  const form = useForm<zTeamSubscriptionSchema>({
    resolver: zodResolver(teamSubscriptionSchema),
    defaultValues: { subscriptionType: "", season: "", description: "", amount: undefined as unknown as number },
    mode: "onChange",
  });

  const { execute, status } = useAction(createTeamSubscription, {
    onSuccess: (data) => {
      if (data.data?.error) { toast.error(data.data.error); return; }
      if (data.data?.success) {
        toast.success(data.data.success);
        setCreateOpen(false);
        form.reset();
        router.refresh();
      }
    },
    onError: () => toast.error("Failed to create subscription"),
  });

  const togglePaid = async (row: SubRow) => {
    setPendingId(row.id);
    const next = row.status === "Paid" ? "Unpaid" : "Paid";
    const res = await updateSubscriptionStatus({ id: row.id, status: next });
    setPendingId(null);
    if ("error" in res) toast.error(res.error);
    else { toast.success(res.success); router.refresh(); }
  };

  return (
    <div className="space-y-4">
      {/* Header / create */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Users className="h-4 w-4" /> {playerCount} player{playerCount !== 1 ? "s" : ""} on {teamName}
        </p>
        {canManage && (
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create subscription
          </Button>
        )}
      </div>

      {/* Season tiles */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <CreditCard className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No subscriptions raised yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <button key={g.key} onClick={() => setSelectedKey(g.key)} className="text-left">
              <Card className="hover:bg-muted/40 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="truncate">{g.season}</span>
                    <Badge variant="outline" className="shrink-0">£{g.amount.toFixed(2)}</Badge>
                  </CardTitle>
                  {g.subscriptionType && <p className="text-xs text-muted-foreground">{g.subscriptionType}</p>}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{g.paidCount}/{g.totalCount} paid</span>
                    <span className="font-semibold tabular-nums">{g.paidPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-amber-500/30 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${g.paidPct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">£{g.paidValue.toFixed(2)} of £{g.totalValue.toFixed(2)} collected</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Drill-down: who's paid / unpaid */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedKey(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.season}{selected.subscriptionType ? ` · ${selected.subscriptionType}` : ""}</DialogTitle>
                <DialogDescription>
                  {selected.paidCount}/{selected.totalCount} paid ({selected.paidPct.toFixed(0)}%) · £{selected.paidValue.toFixed(2)} of £{selected.totalValue.toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[55vh] overflow-y-auto space-y-1.5 pr-1">
                {selected.subs.map((row) => {
                  const paid = row.status === "Paid";
                  return (
                    <div key={row.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                      <span className="text-sm truncate">{row.playerName}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={paid ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-500"}>
                          {paid ? "Paid" : "Unpaid"}
                        </Badge>
                        {canManage && (
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={pendingId === row.id} onClick={() => togglePaid(row)}>
                            {paid ? <><X className="h-3 w-3" /> Unpaid</> : <><Check className="h-3 w-3" /> Paid</>}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create subscription */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create subscription</DialogTitle>
            <DialogDescription>
              Raises a subscription for all {playerCount} player{playerCount !== 1 ? "s" : ""} on {teamName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => execute(values))} className="space-y-4">
              <FormField control={form.control} name="subscriptionType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Annual membership" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="season" render={({ field }) => (
                <FormItem>
                  <FormLabel>Season</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select season" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {seasons.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Start/end dates are taken from the season.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (£ per player)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Add a description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={status === "executing"}>{status === "executing" ? "Creating…" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
