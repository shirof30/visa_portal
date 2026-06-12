import Link from "next/link";

const VISA_TYPES = [
  { label: "Tourist Visa", code: "B211A", note: "Tourism / Family Visit" },
  { label: "Business Visa", code: "B211B", note: "Commercial / Conference" },
  { label: "Social Visa", code: "B211C", note: "Arts / Sports / Study" },
  { label: "Transit Visa", code: "C316", note: "Transit through Indonesia" },
];

export default function HomePage() {
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
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-4">Consulate Hours</p>
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
              </div>
            </div>

            {/* Visa types */}
            <div className="flex flex-col gap-4 justify-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D]">Visa Types Available</p>
              {VISA_TYPES.map((v) => (
                <div key={v.code} className="bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-4 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-semibold text-[#111318]">{v.label}</p>
                    <p className="text-[13px] text-[#8C909D]">{v.note}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">{v.code}</span>
                </div>
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
                { step: "1", title: "Complete the Form", desc: "Fill in your personal details, passport information, and purpose of visit online." },
                { step: "2", title: "Upload Documents", desc: "Upload your passport scan, photo, and any supporting documents as PDF." },
                { step: "3", title: "Visit the Consulate", desc: "Bring your original documents and confirmation reference to KJRI Vancouver at 1630 Alberni St." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-5 shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold mb-3">{step}</div>
                  <p className="text-[15px] font-semibold text-[#111318] mb-1">{title}</p>
                  <p className="text-[13px] text-[#8C909D] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Required documents */}
          <section className="pb-14">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-6">Required Documents</p>
            <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white shadow-md px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Valid passport (min. 6 months remaining)",
                  "Completed visa application form",
                  "Passport-size photo (40mm × 60mm)",
                  "Return flight/vessel ticket",
                  "Proof of accommodation in Indonesia",
                  "Financial proof (bank statement)",
                  "Invitation letter (if applicable)",
                  "Travel insurance (recommended)",
                ].map((doc) => (
                  <div key={doc} className="flex items-center gap-2.5 text-sm text-[#4B5060]">
                    <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
