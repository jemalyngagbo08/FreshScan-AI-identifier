import { Trash2, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export type HistoryEntry = {
  id: string;
  timestamp: number;
  label: string;
  status: "fresh" | "rotten" | "unknown";
  confidence: number;
  thumbnail?: string;
};

interface Props {
  entries: HistoryEntry[];
  onClear: () => void;
}

export const HistoryPanel = ({ entries, onClear }: Props) => {
  return (
    <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Scan History</h3>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {entries.length}
          </span>
        </div>
        {entries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {entries.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No scans yet. Your results will appear here.
        </div>
      ) : (
        <ScrollArea className="h-[420px]">
          <div className="p-3 space-y-2">
            {entries.map((e) => {
              const dotColor = e.status === "fresh" ? "bg-fresh" : e.status === "rotten" ? "bg-rotten" : "bg-muted-foreground";
              return (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition-colors">
                  {e.thumbnail ? (
                    <img src={e.thumbnail} alt={e.label} className="h-14 w-14 rounded-xl object-cover border border-border" />
                  ) : (
                    <div className={`h-14 w-14 rounded-xl ${dotColor}/20 flex items-center justify-center`}>
                      <span className={`h-3 w-3 rounded-full ${dotColor}`} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm capitalize truncate">{e.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {new Date(e.timestamp).toLocaleTimeString()} · {Math.round(e.confidence * 100)}%
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold font-mono uppercase px-2 py-1 rounded-md tracking-wider ${
                      e.status === "fresh"
                        ? "bg-fresh/15 text-fresh"
                        : e.status === "rotten"
                        ? "bg-rotten/15 text-rotten"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
