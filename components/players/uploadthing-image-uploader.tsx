"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUploadThing } from "@/app/api/uploadthing/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UploadThingImageUploaderProps = {
  onUploadComplete: (imageUrl: string) => Promise<void> | void;
};

export function UploadThingImageUploader({ onUploadComplete }: UploadThingImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

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
          setMessage("");
        }}
      />

      {previewUrl && (
        <div className="flex justify-center">
          <Image
            src={previewUrl}
            alt="Preview"
            width={120}
            height={120}
            unoptimized
            className="h-28 w-28 rounded-full object-cover border"
          />
        </div>
      )}

      <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? "Uploading..." : "Upload image"}
      </Button>

      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
