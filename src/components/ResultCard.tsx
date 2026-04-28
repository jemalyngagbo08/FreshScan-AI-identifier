import { CheckCircle2, AlertTriangle, HelpCircle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Prediction } from "@/hooks/useTeachableMachine";
import { classifyResult } from "@/hooks/useTeachableMachine";

const TIPS = {
  fresh: [
    "Store in a cool, dry place to maintain freshness.",
    "Refrigerate cut produce in airtight containers.",
    "Consume within a few days for best nutrition.",
  ],
  rotten: [
    "Do not consume — discard safely to avoid illness.",
    "Compost organic waste when possible.",
    "Inspect nearby produce — spoilage spreads quickly.",
  ],
  unknown: [
    "Try better lighting or a closer angle.",
    "Center the item inside the scan area.",
    "Make sure your trained model covers this item.",
  ],
  invalid: [
    "Invalid object detected. Please scan fruits and vegetables only.",
    "Remove non-produce items from the frame before scanning.",
    "Try again with one fruit or vegetable centered in view.",
  ],
};

export const ResultCard = ({ predictions }: { predictions: Prediction[] }) => {
  if (!predictions.length) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-8 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
        <p className="text-muted-foreground font-medium">Awaiting scan…</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Results will appear here</p>
      </div>
    );
  }

  const result = classifyResult(predictions);
  const pct = Math.round(result.confidence * 100);
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);

  const config = {
    fresh: {
      gradient: "bg-gradient-fresh",
      shadow: "shadow-fresh",
      icon: CheckCircle2,
      label: "FRESH",
      ring: "ring-fresh/40",
    },
    rotten: {
      gradient: "bg-gradient-rotten",
      shadow: "shadow-rotten",
      icon: AlertTriangle,
      label: "ROTTEN",
      ring: "ring-rotten/40",
    },
    unknown: {
      gradient: "bg-muted",
      shadow: "shadow-soft",
      icon: HelpCircle,
      label: "UNCERTAIN",
      ring: "ring-border",
    },
    invalid: {
      gradient: "bg-destructive",
      shadow: "shadow-soft",
      icon: AlertTriangle,
      label: "INVALID OBJECT",
      ring: "ring-destructive/40",
    },
  }[result.status];

  const Icon = config.icon;

  return (
    <div className="space-y-4 animate-fade-up">
      <div className={`relative overflow-hidden rounded-3xl ${config.gradient} ${config.shadow} p-6 text-white`}>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
            <Icon className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest opacity-80">Status</p>
            <h3 className="text-3xl font-bold leading-tight">{config.label}</h3>
            <p className="text-sm opacity-90 mt-1 truncate capitalize">
              {result.status === "invalid" ? "Fruits and vegetables only" : result.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase tracking-widest opacity-80">Confidence</p>
            <p className="text-3xl font-bold font-mono">{pct}%</p>
          </div>
        </div>
      </div>

      {/* Top predictions breakdown */}
      <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">All Predictions</p>
        <div className="space-y-3">
          {sorted.slice(0, 4).map((p) => {
            const pp = Math.round(p.probability * 100);
            return (
              <div key={p.className}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium capitalize truncate pr-2">{p.className}</span>
                  <span className="font-mono text-muted-foreground">{pp}%</span>
                </div>
                <Progress value={pp} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-3xl bg-secondary/60 border border-border p-5">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          {result.status === "rotten" ? "Safety Tips" : result.status === "fresh" ? "Storage Tips" : "Tips"}
        </p>
        <ul className="space-y-2">
          {TIPS[result.status].map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
