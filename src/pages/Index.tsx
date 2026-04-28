import { useCallback, useEffect, useState } from "react";
import { Leaf, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeachableMachine, classifyResult, type Prediction } from "@/hooks/useTeachableMachine";
import { WebcamScanner } from "@/components/WebcamScanner";
import { ImageUploader } from "@/components/ImageUploader";
import { ResultCard } from "@/components/ResultCard";
import { HistoryPanel, type HistoryEntry } from "@/components/HistoryPanel";
import { ModelSettings } from "@/components/ModelSettings";
import { toast } from "@/components/ui/sonner";

const STORAGE_KEY = "tm_model_url";
const HISTORY_KEY = "freshscan_history";
const INVALID_SCAN_MESSAGE = "Invalid object detected. Please scan fruits and vegetables only.";

const formatScanDescription = (label: string, confidence: number) =>
  `${label} detected with ${Math.round(confidence * 100)}% confidence.`;

const Index = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [camActive, setCamActive] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });

  const { model, loading, error } = useTeachableMachine(modelUrl);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  }, [history]);

  const saveModelUrl = (url: string) => {
    localStorage.setItem(STORAGE_KEY, url);
    setModelUrl(url);
    setPredictions([]);
  };

  const lastSig = useState<{ sig: string; t: number }>({ sig: "", t: 0 })[0];

  const handleLivePredictions = useCallback((preds: Prediction[]) => {
    setPredictions(preds);
    const r = classifyResult(preds);
    if (r.confidence < 0.7) return;
    const sig = `${r.label}|${r.status}`;
    const now = Date.now();
    if (sig === lastSig.sig && now - lastSig.t < 4000) return;
    lastSig.sig = sig; lastSig.t = now;
    if (!r.isValidProduce) {
      toast.error(INVALID_SCAN_MESSAGE);
      return;
    }
    setHistory((h) => [{ id: crypto.randomUUID(), timestamp: now, label: r.label, status: r.status, confidence: r.confidence }, ...h].slice(0, 50));
    toast.success("Image successfully scanned", {
      description: formatScanDescription(r.label, r.confidence),
    });
  }, [lastSig]);

  const handleUploadPredictions = useCallback((preds: Prediction[], thumb: string) => {
    setPredictions(preds);
    const r = classifyResult(preds);
    if (!r.isValidProduce) {
      toast.error(INVALID_SCAN_MESSAGE);
      return;
    }
    setHistory((h) => [{ id: crypto.randomUUID(), timestamp: Date.now(), label: r.label, status: r.status, confidence: r.confidence, thumbnail: thumb }, ...h].slice(0, 50));
    toast.success("Image successfully scanned", {
      description: formatScanDescription(r.label, r.confidence),
    });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur bg-background/70 sticky top-0 z-40">
        <div className="container max-w-6xl flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero blur-md opacity-60 rounded-2xl" />
              <div className="relative bg-gradient-hero rounded-2xl p-2.5 shadow-glow">
                <Leaf className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">FreshScan AI</h1>
              <p className="text-xs text-muted-foreground font-mono">fresh · or · rotten</p>
            </div>
          </div>
          <ModelSettings modelUrl={modelUrl} onSave={saveModelUrl} loading={loading} error={error} loaded={!!model} />
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-mono font-semibold text-secondary-foreground mb-4">
          <Sparkles className="h-3 w-3" /> AI-POWERED FRESHNESS CHECK
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
          Scan a fruit or veggie.<br />
          <span className="bg-gradient-hero bg-clip-text text-transparent">Know if it's fresh in seconds.</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Reduce food waste and stay safe. Powered by a model you trained on Google Teachable Machine.
        </p>
      </section>

      {/* App grid */}
      <section className="container max-w-6xl pb-16 grid gap-6 lg:grid-cols-[1fr_1fr_360px]">
        {/* Scanner */}
        <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
          <Tabs defaultValue="camera" className="w-full">
            <TabsList className="grid grid-cols-2 w-full rounded-2xl h-12 p-1 mb-4">
              <TabsTrigger value="camera" className="rounded-xl font-semibold">Live Camera</TabsTrigger>
              <TabsTrigger value="upload" className="rounded-xl font-semibold">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="camera">
              <WebcamScanner model={model} onPredictions={handleLivePredictions} active={camActive} onToggle={setCamActive} />
            </TabsContent>
            <TabsContent value="upload">
              <ImageUploader model={model} onPredictions={handleUploadPredictions} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Result */}
        <div>
          <ResultCard predictions={predictions} />
        </div>

        {/* History */}
        <div className="lg:col-span-1">
          <HistoryPanel entries={history} onClear={() => setHistory([])} />
        </div>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground font-mono">
        Built with Teachable Machine · TensorFlow.js · Reduce food waste 🌱
      </footer>
    </main>
  );
};

export default Index;
