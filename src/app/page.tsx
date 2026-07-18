"use client";

import Link from "next/link";
import { useState } from "react";

// Matches the application wizard's visaConfig.ts exactly — keep these two in sync.
const VISA_CATEGORIES = [
  { code: "C1", title: "Personal Visit", items: ["Tourism", "Family Visit"], itemsId: "Wisata / Kunjungan Keluarga" },
  { code: "C2", title: "Business Visit", items: ["Business", "Meeting", "Goods Purchase"], itemsId: "Bisnis / Rapat / Pembelian Barang" },
  { code: "C3", title: "Medical Care", items: ["Medical Care"], itemsId: "Pengobatan" },
  { code: "C4", title: "Official Government Duty", items: ["Official Government Duty"], itemsId: "Tugas Pemerintah Resmi" },
  { code: "C5", title: "Journalism", items: ["Journalism"], itemsId: "Jurnalistik" },
] as const;

// All five categories (C1–C5) fall under the same visa product — the
// "60-Days Single Entry Visa" — so there's one shared requirements list,
// not five different ones. Source: official KJRI Vancouver visa page.
const MANDATORY_REQUIREMENTS = [
  "Original passport valid for more than 6 months beyond your intended length of stay, with at least 2 blank pages (amendment/endorsement pages don't count)",
  "Completed Visa Application Form",
  "One 4×6 cm passport photo, taken within the last 6 months",
  "Copy of a round-trip flight itinerary / electronic airline ticket to and from Indonesia",
  "A bank letter or statement showing at least C$2,000.00 in funds (from the last two weeks)",
  "For non-tourism purposes: a letter of employment or sponsorship from a legitimate institution stating your purpose of visit",
];

const ADDITIONAL_REQUIREMENTS = [
  "Non-Canadian citizens: copy of a valid Canadian residence permit (PR Card / Study Permit / Work Permit)",
  "Dual citizens: copy of your other citizenship's passport",
  "Travellers under 18 not travelling with both parents: a Letter of Consent signed by both parents and certified by a Provincial Notary Public",
  "Cruise ship passengers: airline ticket leaving Canada plus the full cruise itinerary and proof of passage",
];

function RequirementsModal({ category, onClose }: { category: (typeof VISA_CATEGORIES)[number] | null; onClose: () => void }) {
  if (!category) return null;
  const isTourism = category.code === "C1";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-[#E8E9ED]">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded bg-[#111318] text-white text-xs font-bold px-2 py-0.5 mb-2">
              {category.code}
            </span>
            <h3 className="text-lg font-bold text-[#111318]">{category.title}</h3>
            <p className="text-xs text-[#8C909D] mt-0.5">{category.itemsId} — {category.items.join(" · ")}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 h-8 w-8 rounded-lg border border-[#E8E9ED] text-[#8C909D] hover:text-[#111318] hover:bg-gray-50 transition cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-[#4B5060] leading-relaxed">
            This category falls under Indonesia's <strong>60-Day Single Entry Visa</strong>. The
            entry permit is valid for 60 days from your arrival date and can be extended twice at
            an Immigration Office in Indonesia, 60 days at a time.
          </p>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C909D] mb-2">Mandatory Requirements</p>
            <ul className="space-y-2">
              {MANDATORY_REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-[#4B5060]">
                  <svg className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C909D] mb-2">Additional Requirements (if applicable)</p>
            <ul className="space-y-2">
              {ADDITIONAL_REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-[#4B5060]">
                  <svg className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3.75h.008v.008h-.008v-.008z" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-gray-50 border border-[#E8E9ED] p-4 text-sm text-[#4B5060]">
            <p><strong className="text-[#111318]">Fee:</strong> {isTourism ? "CA$100 (tourism)" : "CA$200 (non-tourism)"} — credit/debit card at the consular counter, or Interac e-transfer to <span className="font-mono text-xs">pk.kjrivancouver@gmail.com</span> for mail-in applications. Payments are not refundable.</p>
            <p className="mt-2"><strong className="text-[#111318]">Processing time:</strong> approximately 5–7 business days after your application is approved (allow 5 extra business days if sending documents by mail).</p>
          </div>

          <p className="text-xs text-[#8C909D] leading-relaxed">
            Submit your application and documents through the online form below — you'll choose
            at the end whether to mail your original documents or book an appointment to visit
            in person. Apply no later than 14 days before departure and no more than 90 days
            before leaving Canada.
          </p>
        </div>

        <div className="px-6 pb-6">
          <Link
            href="/apply"
            className="block w-full text-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Start This Application →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<(typeof VISA_CATEGORIES)[number] | null>(null);

  return (
    <div className="text-gray-900 pt-14">
      <main>
        <div className="mx-auto max-w-[1160px] px-6 py-14">

          {/* Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-14">
            <div className="flex flex-col gap-7 justify-center">
              <div className="bg-white/85 backdrop-blur-md rounded-2xl px-6 py-6 border border-white shadow-md">
                <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8C909D] mb-3">
                  Indonesian Visa Application
                </p>
                <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-[64px] font-extrabold leading-none tracking-[-2px] text-[#111318] mb-1">
                  VISA<span className="text-emerald-600">.</span>
                </h1>
                <p className="text-[17px] font-medium text-[#8C909D] mt-3 leading-relaxed max-w-[380px]">
                  Official Indonesian visa application portal of the Consulate General of Indonesia in Vancouver, Canada.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Link href="/apply" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-7 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-emerald-700 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Apply Now
                </Link>
                <Link href="/check" className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#E8E9ED] shadow-sm px-6 py-3 text-[15px] font-medium text-[#4B5060] transition-all duration-150 hover:border-[#C0C3CE] hover:-translate-y-px">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                  </svg>
                  Check Status
                </Link>
              </div>

              {/* Info card */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-xl px-6 py-5 shadow-md">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-4">Consulate Service Hours</p>
                <div className="flex flex-col gap-3">
                  {[
                    { day: "Mon – Thu", t1: "09:30 – 11:30", t2: "13:00 – 16:30" },
                    { day: "Friday", t1: "09:30 – 11:30", t2: "14:30 – 17:00" },
                  ].map(({ day, t1, t2 }, i) => (
                    <div key={day}>
                      {i > 0 && <div className="h-px bg-[#E8E9ED] mb-3" />}
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] font-medium text-[#4B5060]">{day}</span>
                        <div className="text-right">
                          <div className="text-[15px] font-semibold text-[#111318] tabular-nums">{t1}</div>
                          <div className="text-[13px] text-[#8C909D] tabular-nums">{t2}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#8C909D] mt-4 pt-3 border-t border-[#E8E9ED] leading-relaxed">
                  Sat, Sun &amp; public holidays — closed<br />
                  Inquiries: 1 (604) 682-8855 ext. 244, 228, 240
                </p>
              </div>
            </div>

            {/* Visa categories */}
            <div className="flex flex-col gap-4 justify-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D]">
                Visa Categories — Jenis Visa berdasarkan Tujuan Kunjungan
              </p>
              {VISA_CATEGORIES.map((v) => (
                <button
                  key={v.code}
                  onClick={() => setActiveCategory(v)}
                  className="text-left bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-4 shadow-sm flex items-center justify-between gap-4 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
                >
                  <div>
                    <p className="text-[15px] font-semibold text-[#111318]">{v.title}</p>
                    <p className="text-[13px] text-[#8C909D]">{v.items.join(" / ")}</p>
                  </div>
                  <span className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">{v.code}</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Requirements →</span>
                  </span>
                </button>
              ))}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
                <span className="font-bold">Note:</span> Indonesian citizens holding a valid Indonesian passport do not require a visa to enter Indonesia. This portal is for non-Indonesian passport holders applying for an Indonesian visa through KJRI Vancouver.
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="pb-14">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-6">How to Apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Complete the Form", desc: "Fill in your personal details, passport information, and purpose of visit, and upload your documents online." },
                { step: "2", title: "Choose How to Submit", desc: "At the end of the form, choose to mail your original documents or book an appointment to visit KJRI Vancouver in person." },
                { step: "3", title: "Finalize", desc: "Mail your original passport, photo, and payment — or bring them with you to your appointment at 1630 Alberni St." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-5 shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold mb-3">{step}</div>
                  <p className="text-[15px] font-semibold text-[#111318] mb-1">{title}</p>
                  <p className="text-[13px] text-[#8C909D] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Good to know */}
          <section className="pb-14">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-6">Good to Know</p>
            <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white shadow-md px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  "Fee: CA$100 (tourism) or CA$200 (non-tourism)",
                  "Processing takes approximately 5–7 business days after approval",
                  "Add 5 business days if applying by mail",
                  "Print all documents single-sided",
                  "Attach documents with a paper or binder clip — do not staple",
                  "The Consulate does not provide printing or copy services",
                  "The Consulate does not offer expedited processing",
                  "Visas cannot be issued to holders of a Visitor Permit, Travel Document, Alien Passport, or Temporary Passport",
                ].map((note) => (
                  <div key={note} className="flex items-start gap-2.5 text-sm text-[#4B5060]">
                    <svg className="h-4 w-4 text-[#8C909D] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    {note}
                  </div>
                ))}
              </div>
              <p className="mt-5 pt-5 border-t border-[#E8E9ED] text-xs text-[#8C909D] leading-relaxed">
                Full document requirements are specific to each visa category — click any
                category above under "Visa Categories" to see exactly what's needed.
              </p>
            </div>
          </section>

        </div>
      </main>

      <RequirementsModal category={activeCategory} onClose={() => setActiveCategory(null)} />
    </div>
  );
}
