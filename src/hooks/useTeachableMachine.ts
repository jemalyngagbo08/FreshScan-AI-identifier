import { useEffect, useRef, useState } from "react";

export type Prediction = { className: string; probability: number };
export type TeachableMachineModel = {
  predict: (input: HTMLVideoElement | HTMLImageElement) => Promise<Prediction[]>;
};

export function useTeachableMachine(modelUrl: string | null) {
  const [model, setModel] = useState<TeachableMachineModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    if (!modelUrl) {
      setModel(null);
      return;
    }
    setLoading(true);
    setError(null);
    const base = modelUrl.endsWith("/") ? modelUrl : modelUrl + "/";
    (async () => {
      try {
        const tmImage = await import("@teachablemachine/image");
        const m = await tmImage.load(base + "model.json", base + "metadata.json");
        if (!cancelled.current) setModel(m);
      } catch (e) {
        if (!cancelled.current) setError("Could not load model. Check the URL.");
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    })();
    return () => { cancelled.current = true; };
  }, [modelUrl]);

  return { model, loading, error };
}

export function classifyResult(predictions: Prediction[]) {
  const top = [...predictions].sort((a, b) => b.probability - a.probability)[0];
  if (!top) return { label: "Unknown", confidence: 0, status: "unknown" as const, item: "" };
  const lower = top.className.toLowerCase();
  let status: "fresh" | "rotten" | "unknown" = "unknown";
  if (/(rotten|spoil|bad|stale|moldy)/.test(lower)) status = "rotten";
  else if (/(fresh|good|ripe|healthy)/.test(lower)) status = "fresh";
  // Try to extract item name (e.g., "fresh apple" -> "apple")
  const item = top.className.replace(/(fresh|rotten|good|bad|spoiled|moldy)/gi, "").trim() || top.className;
  return { label: top.className, confidence: top.probability, status, item };
}
