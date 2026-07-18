import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";

const OPTIONS = [
  {
    value: "in_person",
    label: "I'll come in person",
    hint: "Visit KJRI Vancouver in person. You'll pick an appointment date and time next.",
    icon: "user",
  },
  {
    value: "mail",
    label: "I'll mail my documents",
    hint: "Send your application documents to KJRI Vancouver by mail. No appointment needed — we'll process your application once your documents arrive.",
    icon: "mail",
  },
] as const;

function Icon({ name }: { name: string }) {
  if (name === "mail") {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export default function DeliveryMethodStep({
  value,
  onSelect,
  showError,
}: {
  value: string;
  onSelect: (v: string) => void;
  showError: boolean;
}) {
  return (
    <SectionCard
      subtitle="Choose whichever is easier for you — both are accepted."
    >
      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex items-start gap-3 text-left rounded-xl border px-4 py-4 transition cursor-pointer ${
                active ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                <Icon name={opt.icon} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-1">{opt.hint}</p>
              </div>
            </button>
          );
        })}
      </div>
      <FieldError show={showError} message="Please choose how you'll submit your application." />
    </SectionCard>
  );
}
