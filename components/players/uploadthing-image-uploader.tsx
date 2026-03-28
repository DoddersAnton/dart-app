"use client";

import { useMemo, useState } from "react";
import { useUploadThing } from "@/app/api/uploadthing/upload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UploadThingImageUploaderProps = {
  onUploadComplete: (imageUrl: string) => Promise<void> | void;
};

export function UploadThingImageUploader({ onUploadComplete }: UploadThingImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const { startUpload, isUploading } = useUploadThing("imgUploader", {
    onClientUploadComplete: async (res) => {
      const url = res[0]?.url;
      if (url) {
        await onUploadComplete(url);
        setMessage("Upload complete");
        setSelectedFile(null);
      } else {
        setMessage("Upload failed: no URL returned");
      }
    },
    onUploadError: (error) => {
      setMessage(`Upload failed: ${error.message}`);
    },
  });

  const selectedLabel = useMemo(() => {
    if (!selectedFile) return "No file selected";
    return `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`;
  }, [selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setMessage("Uploading...");
    await startUpload([selectedFile]);
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

      <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? "Uploading..." : "Upload image"}
      </Button>

      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
