import { useEffect, useState } from "react";
import { Settings, Check, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Props {
  modelUrl: string | null;
  onSave: (url: string) => void;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

export const ModelSettings = ({ modelUrl, onSave, loading, error, loaded }: Props) => {
  const [open, setOpen] = useState(!modelUrl);
  const [val, setVal] = useState(modelUrl ?? "");

  useEffect(() => setVal(modelUrl ?? ""), [modelUrl]);

  const status = loading
    ? { label: "Loading model…", color: "bg-accent text-accent-foreground", icon: AlertCircle }
    : error
    ? { label: "Model error", color: "bg-rotten text-rotten-foreground", icon: AlertCircle }
    : loaded
    ? { label: "Model ready", color: "bg-fresh text-fresh-foreground", icon: Check }
    : { label: "No model", color: "bg-muted text-muted-foreground", icon: AlertCircle };

  const Icon = status.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono font-semibold ${status.color}`}>
          <Icon className="h-3 w-3" />
          {status.label}
        </span>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            <Settings className="h-4 w-4 mr-1" /> Model
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect your Teachable Machine model</DialogTitle>
          <DialogDescription>
            Train an image model at Teachable Machine, click <strong>Export Model → Upload (shareable link)</strong>, and paste the URL below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="murl">Model URL</Label>
          <Input
            id="murl"
            placeholder="https://teachablemachine.withgoogle.com/models/XXXXXXXX/"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Tip: train classes named like <span className="font-mono">fresh apple</span> or <span className="font-mono">rotten banana</span> so the app can auto-categorize.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <a
            href="https://teachablemachine.withgoogle.com/train/image"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Open Teachable Machine <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onSave(val.trim());
              setOpen(false);
            }}
            disabled={!val.trim()}
          >
            Save & Load
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
