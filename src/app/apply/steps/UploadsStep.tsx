import React from "react";
import SectionCard from "../ui/SectionCard";
import UploadRow, { type UploadItem } from "../ui/UploadRow";

export default function UploadsStep({
  items,
  files,
  invMissing,
  onPick,
}: {
  items: UploadItem[];
  files: Record<string, File | null>;
  invMissing: (required: boolean, key: string) => boolean;
  onPick: (key: string, raw: File | null, pdfOnly?: boolean) => void;
}) {
  return (
    <SectionCard
      title="Required Documents"
      subtitle="Only PDF / JPG / JPEG files are accepted (max 10 MB each)."
    >
      <section className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">
          Upload supporting documents
        </h3>
        <p className="text-[11px] text-gray-500 mb-4">
          The list below adapts to your applicant type and visa category.
        </p>

        <div className="space-y-4">
          {items.map((item) => (
            <UploadRow
              key={item.key}
              item={item}
              file={files[item.key] ?? null}
              missing={invMissing(!!item.required, item.key)}
              onPick={(raw) => onPick(item.key, raw, item.pdfOnly)}
            />
          ))}
        </div>
      </section>
    </SectionCard>
  );
}
