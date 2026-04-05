"use client";

import { useRef, useState } from "react";
import { Camera, Upload, CreditCard, User, ArrowLeft } from "lucide-react";

interface Props {
  idImages: { front: string | null; back: string | null; selfie: string | null };
  setIdImages: (images: {
    front: string | null;
    back: string | null;
    selfie: string | null;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

type ImageType = "front" | "back" | "selfie";

export function StepIdUpload({ idImages, setIdImages, onNext, onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<ImageType | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeUpload) return;

    const reader = new FileReader();
    reader.onload = () => {
      setIdImages({ ...idImages, [activeUpload]: reader.result as string });
      setActiveUpload(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function triggerUpload(type: ImageType) {
    setActiveUpload(type);
    fileInputRef.current?.click();
  }

  const canProceed = idImages.front !== null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary">
            ID Verification
          </h2>
          <p className="text-xs text-muted">
            Upload your passport or national ID for verification
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Front of ID */}
      <UploadCard
        label="Front of ID"
        description="Passport page or front of national ID"
        image={idImages.front}
        icon={<CreditCard size={28} className="text-muted" />}
        onUpload={() => triggerUpload("front")}
        onRemove={() => setIdImages({ ...idImages, front: null })}
      />

      {/* Back of ID */}
      <UploadCard
        label="Back of ID (optional)"
        description="Back of national ID card"
        image={idImages.back}
        icon={<CreditCard size={28} className="text-muted rotate-180" />}
        onUpload={() => triggerUpload("back")}
        onRemove={() => setIdImages({ ...idImages, back: null })}
      />

      {/* Selfie */}
      <UploadCard
        label="Selfie (optional)"
        description="Take a selfie for facial verification"
        image={idImages.selfie}
        icon={<User size={28} className="text-muted" />}
        onUpload={() => {
          setActiveUpload("selfie");
          // Change to front camera for selfie
          if (fileInputRef.current) {
            fileInputRef.current.setAttribute("capture", "user");
            fileInputRef.current.click();
            fileInputRef.current.setAttribute("capture", "environment");
          }
        }}
        onRemove={() => setIdImages({ ...idImages, selfie: null })}
        isSelfie
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function UploadCard({
  label,
  description,
  image,
  icon,
  onUpload,
  onRemove,
  isSelfie,
}: {
  label: string;
  description: string;
  image: string | null;
  icon: React.ReactNode;
  onUpload: () => void;
  onRemove: () => void;
  isSelfie?: boolean;
}) {
  if (image) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-green-700">{label}</span>
          <button
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
        <img
          src={image}
          alt={label}
          className="w-full rounded-lg object-cover max-h-48"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onUpload}
      className="w-full rounded-xl border-2 border-dashed border-gray-200 p-6 hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <p className="mt-3 text-sm font-medium text-secondary">{label}</p>
      <p className="mt-1 text-xs text-muted">{description}</p>
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary font-medium">
        {isSelfie ? (
          <>
            <Camera size={14} />
            Take Selfie
          </>
        ) : (
          <>
            <Upload size={14} />
            Upload or Take Photo
          </>
        )}
      </div>
    </button>
  );
}
