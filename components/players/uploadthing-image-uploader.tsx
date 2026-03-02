"use client";

import { useState } from "react";

import { UploadDropzone } from "@/app/api/uploadthing/upload";

type UploadThingImageUploaderProps = {
  onUploadComplete: (imageUrl: string) => Promise<void> | void;
};

export function UploadThingImageUploader({ onUploadComplete }: UploadThingImageUploaderProps) {
  const [imgUploading, setImgUploading] = useState(false);

  return (
    <UploadDropzone
      className="scale-95 ut-button:ring-primary ut-button:bg-primary/75 hover:ut-button:bg-primary/100 ut-button:transition-all ut-button:duration-500 ut-label:hidden ut-allowed-content:hidden"
      endpoint="imgUploader"
      onUploadBegin={() => {
        setImgUploading(true);
      }}
      onUploadError={() => {
        setImgUploading(false);
      }}
      onClientUploadComplete={async (res) => {
        const first = res?.[0];
        const uploadedUrl = first?.ufsUrl || first?.url;

        if (uploadedUrl) {
          await onUploadComplete(uploadedUrl);
        }

        setImgUploading(false);
      }}
      content={{
        button() {
          if (imgUploading) return <div>Uploading...</div>;
          return <div>Upload avatar</div>;
        },
      }}
    />
  );
}
