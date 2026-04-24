import { useRef, useState } from "react";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as tmImage from "@teachablemachine/image";
import type { Prediction } from "@/hooks/useTeachableMachine";

interface Props {
  model: tmImage.CustomMobileNet | null;
  onPredictions: (preds: Prediction[], imgDataUrl: string) => void;
}

export const ImageUploader = ({ model, onPredictions }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (!model) return;
    setBusy(true);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const preds = await model.predict(img);
        // Convert to data URL for history
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const ratio = Math.min(size / img.width, size / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        onPredictions(preds, canvas.toDataURL("image/jpeg", 0.7));
      } finally {
        setBusy(false);
      }
    };
    img.src = url;
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-dashed border-border bg-gradient-card shadow-soft">
        {preview ? (
          <img src={preview} alt="upload preview" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-accent/20 p-6">
              <ImageIcon className="h-12 w-12 text-accent-foreground" />
            </div>
            <p className="font-semibold">Upload a photo</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, or WEBP of a fruit or vegetable</p>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button
        size="lg"
        onClick={() => inputRef.current?.click()}
        disabled={busy || !model}
        className="w-full h-14 text-base font-semibold rounded-2xl"
      >
        <Upload className="mr-2 h-5 w-5" />
        Choose Image
      </Button>
    </div>
  );
};
