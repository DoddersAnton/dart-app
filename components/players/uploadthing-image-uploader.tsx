"use client";

import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";

interface UploadThingImageUploaderProps {
  playerId: number;
  onUploadComplete: (playerId: number, imageUrl: string) => void;
}

export function UploadThingImageUploader({
  playerId,
  onUploadComplete,
}: UploadThingImageUploaderProps) {
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUploadComplete(playerId, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return <Input type="file" accept="image/*" onChange={onFileChange} />;
}
