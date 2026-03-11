"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UploadThingImageUploaderProps = {
  onUploadComplete: (imageUrl: string) => Promise<void> | void;
};

export function UploadThingImageUploader({ onUploadComplete }: UploadThingImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const selectedLabel = useMemo(() => {
    if (!selectedFile) return "No file selected";
    return `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`;
  }, [selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage("Uploading...");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (typeof reader.result === "string") {
          await onUploadComplete(reader.result);
          setMessage("Upload complete");
          setSelectedFile(null);
        } else {
          setMessage("Could not read file");
        }
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setUploading(false);
      setMessage("Upload failed");
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          setSelectedFile(file);
          setMessage(file ? "Image selected" : "");
        }}
      />

      <p className="text-xs text-muted-foreground">{selectedLabel}</p>

      <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? "Uploading..." : "Upload image"}
      </Button>

      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
