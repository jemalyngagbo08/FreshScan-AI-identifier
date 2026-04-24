import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Prediction, TeachableMachineModel } from "@/hooks/useTeachableMachine";

interface Props {
  model: TeachableMachineModel | null;
  onPredictions: (preds: Prediction[]) => void;
  active: boolean;
  onToggle: (next: boolean) => void;
}

export const WebcamScanner = ({ model, onPredictions, active, onToggle }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      stopStream();
      return;
    }
    startStream();
    return stopStream;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active || !model) return;
    const loop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        try {
          const preds = await model.predict(videoRef.current);
          onPredictions(preds);
        } catch {}
      }
      rafRef.current = window.setTimeout(() => requestAnimationFrame(loop), 400) as unknown as number;
    };
    loop();
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [active, model, onPredictions]);

  const startStream = async () => {
    setStarting(true);
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setErr("Camera access denied or unavailable.");
      onToggle(false);
    } finally {
      setStarting(false);
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (rafRef.current) clearTimeout(rafRef.current);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted shadow-soft border-2 border-border">
        {active ? (
          <>
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            {/* Scanner overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-6 rounded-2xl border-2 border-primary-glow/70 shadow-glow" />
              <div className="absolute left-6 right-6 h-1 scanner-line animate-scan rounded-full" />
              {/* Corner brackets */}
              {["top-4 left-4 border-t-4 border-l-4", "top-4 right-4 border-t-4 border-r-4", "bottom-4 left-4 border-b-4 border-l-4", "bottom-4 right-4 border-b-4 border-r-4"].map((c, i) => (
                <div key={i} className={`absolute h-8 w-8 border-primary-glow rounded-md ${c}`} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-card">
            <div className="rounded-full bg-primary/10 p-6">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Camera is off</p>
          </div>
        )}
      </div>
      {err && <p className="text-sm text-destructive text-center">{err}</p>}
      <Button
        size="lg"
        variant={active ? "outline" : "default"}
        onClick={() => onToggle(!active)}
        disabled={starting || !model}
        className="w-full h-14 text-base font-semibold rounded-2xl"
      >
        {starting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : active ? <CameraOff className="mr-2 h-5 w-5" /> : <Camera className="mr-2 h-5 w-5" />}
        {starting ? "Starting…" : active ? "Stop Camera" : "Start Live Scan"}
      </Button>
    </div>
  );
};
