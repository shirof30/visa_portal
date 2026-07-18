import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";

export default function TermsStep({
  accepted,
  setAccepted,
  showError,
}: {
  accepted: boolean;
  setAccepted: (v: boolean) => void;
  showError: boolean;
}) {
  return (
    <SectionCard
      subtitle="Please read and accept before submitting your visa application."
    >
      <div className="rounded-xl border border-gray-200 bg-gray-50 max-h-72 overflow-y-auto p-4 text-xs leading-relaxed text-gray-700 space-y-3">
        <div>
          <p className="font-semibold text-gray-900 mb-1">1. Accuracy of Information</p>
          <p>
            The applicant is responsible for the truthfulness of all information and documents
            submitted. False or inaccurate information may result in refusal of the application
            and/or legal consequences under applicable regulations.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">2. Passport Validity</p>
          <p>
            Your passport must be valid for at least six (6) months beyond your intended stay in
            Indonesia and contain adequate blank pages.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">3. Supporting Documents</p>
          <p>
            Additional documents may be required depending on your applicant type and visa
            category. Non-Canadian applicants must provide proof of legal residence in Canada, and
            business, official, medical-care, and journalistic categories (C2–C5) require a
            sponsor / guarantor letter from Indonesia.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">4. Right of Entry</p>
          <p>
            The issuance of a visa does not guarantee entry to Indonesia. Final admission remains
            at the discretion of the Indonesian Immigration authorities at the port of entry.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">5. Processing Time & Fees</p>
          <p>
            Processing times and applicable fees follow the prevailing schedule of the Consulate
            General of the Republic of Indonesia in Vancouver. Fees are non-refundable once the
            application is processed.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-red-200 bg-red-50 p-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-red-600"
        />
        <span className="text-xs leading-relaxed text-gray-800">
          I have read and agree to the Terms &amp; Conditions above. I declare that the information
          I provide is true and correct to the best of my knowledge.
        </span>
      </label>
      <FieldError show={showError} message="You must accept the Terms & Conditions to continue." />
    </SectionCard>
  );
}
