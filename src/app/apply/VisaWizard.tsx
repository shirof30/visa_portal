"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
type StepId = "personal" | "otp" | "passport" | "address" | "purpose" | "indonesia" | "sponsor" | "questions" | "uploads";

const STEPS: { id: StepId; title: string }[] = [
  { id: "personal",  title: "Personal Info" },
  { id: "otp",       title: "Verify Email" },
  { id: "passport",  title: "Passport" },
  { id: "address",   title: "Canada Address" },
  { id: "purpose",   title: "Purpose" },
  { id: "indonesia", title: "Indonesia Stay" },
  { id: "sponsor",   title: "Sponsor" },
  { id: "questions", title: "Background" },
  { id: "uploads",   title: "Documents" },
];

const VISA_TYPES = ["Transit", "Single Entry", "Multiple Entry", "Limited/Temporary Stay"];
const PURPOSES = ["Tourism", "Study", "Conference / Seminar / Workshop", "Arts", "Family Visit", "Commercial / Business", "Industrial / Mining", "Sports", "Press and Media", "Others"];
const PASSPORT_TYPES = ["Ordinary Passport", "Official Passport", "Diplomatic Passport", "Special Passport"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];

const CA_PROVINCES: Record<string, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories",
  NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon",
};

type Form = {
  firstName: string; middleName: string; familyName: string; sex: string;
  placeOfBirth: string; dateOfBirth: string; nationality: string;
  maritalStatus: string; phoneNumber: string; email: string;
  occupation: string; employer: string; position: string;
  companyAddress: string; companyCity: string; companyProvince: string;
  companyCountry: string; workPhone: string;
  passportNumber: string; passportPlace: string; passportIssueDate: string;
  passportExpiryDate: string; passportType: string;
  addressStreet: string; addressUnit: string; addressCity: string;
  addressProvince: string; addressPostalCode: string;
  visaType: string; purposeOfVisit: string; purposeOther: string;
  intendedAddressIndonesia: string; intendedCityIndonesia: string; intendedPhone: string;
  portOfEntry: string; dateOfEntry: string; flightIn: string;
  portOfExit: string; dateOfExit: string; flightOut: string;
  hasInvitationLetter: string;
  sponsorName: string; sponsorPosition: string; sponsorCompany: string;
  sponsorAddress: string; sponsorCity: string; sponsorPhone: string; sponsorFax: string;
  beenToIndonesiaBefore: string; indonesiaVisitDetails: string;
  hasOtherCountryVisa: string; otherVisaDetails: string;
  visaDenied: string; orderedToLeave: string; everArrested: string;
  disclaimerAccepted: boolean;
};

const INITIAL: Form = {
  firstName: "", middleName: "", familyName: "", sex: "",
  placeOfBirth: "", dateOfBirth: "", nationality: "Canada",
  maritalStatus: "", phoneNumber: "", email: "",
  occupation: "", employer: "", position: "",
  companyAddress: "", companyCity: "", companyProvince: "", companyCountry: "Canada", workPhone: "",
  passportNumber: "", passportPlace: "", passportIssueDate: "", passportExpiryDate: "", passportType: "Ordinary Passport",
  addressStreet: "", addressUnit: "", addressCity: "", addressProvince: "", addressPostalCode: "",
  visaType: "", purposeOfVisit: "", purposeOther: "",
  intendedAddressIndonesia: "", intendedCityIndonesia: "", intendedPhone: "",
  portOfEntry: "", dateOfEntry: "", flightIn: "",
  portOfExit: "", dateOfExit: "", flightOut: "",
  hasInvitationLetter: "No",
  sponsorName: "", sponsorPosition: "", sponsorCompany: "",
  sponsorAddress: "", sponsorCity: "", sponsorPhone: "", sponsorFax: "",
  beenToIndonesiaBefore: "No", indonesiaVisitDetails: "",
  hasOtherCountryVisa: "No", otherVisaDetails: "",
  visaDenied: "No", orderedToLeave: "No", everArrested: "No",
  disclaimerAccepted: false,
};

// ── Field helpers ────────────────────────────────────────────────────────────
function cls(invalid: boolean) {
  return `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${invalid ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`;
}
function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return <label className="block mb-1 text-sm font-medium text-gray-700">{children}{req && <span className="text-red-500 ml-0.5">*</span>}</label>;
}
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Err({ show, msg }: { show: boolean; msg: string }) {
  if (!show) return null;
  return <p className="mt-1 text-xs font-medium text-red-600 flex items-center gap-1"><svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>{msg}</p>;
}
function YesNo({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-4">
      {["Yes", "No"].map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="accent-emerald-600" />
          {opt}
        </label>
      ))}
    </div>
  );
}

// ── OTP Step ─────────────────────────────────────────────────────────────────
function OtpStep({ phone, email, onVerified }: { phone: string; email: string; onVerified: () => void }) {
  const [digits, setDigits] = useState(["","","","","",""]);
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"verifying"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const refs = useRef<(HTMLInputElement|null)[]>([]);
  const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, (_,a,b,c) => a + "*".repeat(Math.max(2,b.length)) + c);

  useEffect(() => { sendOtp(); }, []);
  useEffect(() => { if (status==="sent") refs.current[0]?.focus(); }, [status]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c=>c-1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendOtp() {
    setStatus("sending"); setErrorMsg(""); setDigits(["","","","","",""]);
    try {
      const res = await fetch("/api/send-otp", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone, email }) });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(data.error ?? "Failed to send code."); return; }
      setStatus("sent"); setCooldown(60);
    } catch { setStatus("error"); setErrorMsg("Connection failed. Please try again."); }
  }

  async function verify(code: string) {
    setStatus("verifying"); setErrorMsg("");
    try {
      const res = await fetch("/api/verify-otp", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone, email, code }) });
      const data = await res.json();
      if (!res.ok) { setStatus("sent"); setErrorMsg(data.error ?? "Incorrect code."); setDigits(["","","","","",""]); setTimeout(()=>refs.current[0]?.focus(),50); return; }
      onVerified();
    } catch { setStatus("sent"); setErrorMsg("Connection failed. Please try again."); }
  }

  function onInput(i: number, v: string) {
    const d = v.replace(/\D/g,"").slice(-1);
    const next = [...digits]; next[i] = d; setDigits(next); setErrorMsg("");
    if (d && i<5) refs.current[i+1]?.focus();
    if (d && next.every(x=>x!=="")) setTimeout(()=>verify(next.join("")),100);
  }
  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key==="Backspace" && !digits[i] && i>0) refs.current[i-1]?.focus();
  }
  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    const next = ["","","","","",""];
    for (let i=0; i<p.length; i++) next[i]=p[i];
    setDigits(next); setErrorMsg("");
    refs.current[Math.min(p.length,5)]?.focus();
    if (p.length===6) setTimeout(()=>verify(p),100);
  }

  const isVerifying = status==="verifying", isSending = status==="sending";

  return (
    <Card title="Email Verification" subtitle="A 6-digit verification code has been sent to your email.">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Code sent to</p>
          <p className="text-base font-semibold text-gray-800">{maskedEmail}</p>
          {isSending && <p className="text-sm text-emerald-600 mt-2 animate-pulse">Sending email…</p>}
          {(status==="sent"||isVerifying) && <p className="text-sm text-emerald-600 mt-2">✓ Email sent successfully</p>}
          {status==="error" && <p className="text-sm text-red-600 mt-2">{errorMsg}</p>}
        </div>
        <div className="flex gap-3" onPaste={onPaste}>
          {digits.map((d,i)=>(
            <input key={i} ref={el=>{refs.current[i]=el;}} type="text" inputMode="numeric" maxLength={1} value={d}
              disabled={isVerifying||isSending} onChange={e=>onInput(i,e.target.value)} onKeyDown={e=>onKeyDown(i,e)}
              className={["w-11 h-14 text-center text-2xl font-bold rounded-lg border-2 outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
                errorMsg?"border-red-400 bg-red-50":d?"border-emerald-400 bg-emerald-50":"border-gray-300 bg-white",
                (isVerifying||isSending)?"opacity-50 cursor-not-allowed":""].join(" ")} />
          ))}
        </div>
        {isVerifying && <p className="text-sm text-emerald-600 animate-pulse">Verifying…</p>}
        {errorMsg && status==="sent" && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center max-w-xs">{errorMsg}</div>}
        <p className="text-sm text-gray-500 text-center">
          Didn't receive the email?{" "}
          {cooldown>0 ? <span className="text-gray-400">Resend in {cooldown}s</span> :
            <button type="button" onClick={sendOtp} disabled={isSending} className="text-emerald-600 font-semibold hover:underline disabled:opacity-50">Resend code</button>}
        </p>
        <p className="text-xs text-gray-400 text-center max-w-xs">Check your <strong>spam folder</strong> if you don't see it. Code is valid for 10 minutes.</p>
      </div>
    </Card>
  );
}

// ── Address Step with Google Places ─────────────────────────────────────────
function AddressStep({ form, touched, setForm }: { form: Form; touched: boolean; setForm: React.Dispatch<React.SetStateAction<Form>> }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const sessionRef = useRef<any>(null);
  const placesRef = useRef<any>(null);
  const debRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  async function ensurePlaces() {
    if (placesRef.current) return placesRef.current;
    if (!(window as any).google?.maps?.importLibrary) return null;
    const lib: any = await (window as any).google.maps.importLibrary("places");
    placesRef.current = lib; return lib;
  }

  async function fetchSuggestions(input: string) {
    const lib = await ensurePlaces();
    if (!lib?.AutocompleteSuggestion) return;
    if (!sessionRef.current) sessionRef.current = new lib.AutocompleteSessionToken();
    try {
      const { suggestions: results } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input, sessionToken: sessionRef.current, includedRegionCodes: ["ca"],
        includedPrimaryTypes: ["street_address","premise","subpremise"], language:"en", region:"ca",
      });
      const mapped = (results??[]).filter((r:any)=>r.placePrediction).map((r:any)=>{
        const p = r.placePrediction;
        return { placeId: p.placeId, text: p.text?.text ?? "", prediction: p };
      });
      setSuggestions(mapped); setOpen(mapped.length>0); setActiveIdx(-1);
    } catch { setSuggestions([]); setOpen(false); }
  }

  async function selectSuggestion(s: any) {
    setOpen(false); setSuggestions([]);
    try {
      const place = s.prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents"] });
      let streetNumber="", streetName="", city="", province="", postalCode="";
      for (const c of place.addressComponents??[]) {
        const t = c.types;
        if (t.includes("street_number")) streetNumber = c.longText;
        if (t.includes("route")) streetName = c.longText;
        if (t.includes("locality")) city = c.longText;
        if (t.includes("administrative_area_level_1")) {
          const code = c.shortText?.toUpperCase()??""
          province = CA_PROVINCES[code] ?? c.longText;
        }
        if (t.includes("postal_code")) postalCode = c.longText;
      }
      setForm(prev=>({...prev, addressStreet:`${streetNumber} ${streetName}`.trim()||s.text, addressCity:city, addressProvince:province, addressPostalCode:postalCode}));
    } catch { setForm(prev=>({...prev, addressStreet:s.text})); }
    finally { sessionRef.current=null; }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open||!suggestions.length) return;
    if (e.key==="ArrowDown") { e.preventDefault(); setActiveIdx(i=>(i+1)%suggestions.length); }
    else if (e.key==="ArrowUp") { e.preventDefault(); setActiveIdx(i=>(i-1+suggestions.length)%suggestions.length); }
    else if (e.key==="Enter" && activeIdx>=0) { e.preventDefault(); selectSuggestion(suggestions[activeIdx]); }
    else if (e.key==="Escape") setOpen(false);
  }

  useEffect(()=>{
    const fn=(ev:MouseEvent)=>{ if(wrapRef.current&&!wrapRef.current.contains(ev.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",fn); return ()=>document.removeEventListener("mousedown",fn);
  },[]);

  const inv = (c:boolean) => touched&&c;

  return (
    <Card title="3. Address in Canada" subtitle="Your current residential address. Start typing for autocomplete.">
      <div>
        <Label req>Street Address</Label>
        <div ref={wrapRef} className="relative">
          <input className={cls(inv(!form.addressStreet.trim()))} name="addressStreet" value={form.addressStreet} maxLength={150}
            autoComplete="off" placeholder="Start typing your address…"
            onChange={e=>{
              setForm(prev=>({...prev,addressStreet:e.target.value}));
              if(debRef.current) clearTimeout(debRef.current);
              if(!e.target.value.trim()) { setSuggestions([]); setOpen(false); return; }
              debRef.current=setTimeout(()=>fetchSuggestions(e.target.value),250);
            }}
            onKeyDown={onKeyDown} onFocus={()=>{ if(suggestions.length) setOpen(true); }} />
          {open&&suggestions.length>0&&(
            <ul className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
              {suggestions.map((s,idx)=>(
                <li key={s.placeId} onMouseDown={ev=>{ev.preventDefault();selectSuggestion(s);}} onMouseEnter={()=>setActiveIdx(idx)}
                  className={`cursor-pointer px-3 py-2 text-sm ${idx===activeIdx?"bg-emerald-50 text-emerald-700":"text-gray-700 hover:bg-gray-50"}`}>
                  {s.text}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">Type to search for your Canadian address automatically</p>
        <Err show={inv(!form.addressStreet.trim())} msg="Required" />
      </div>
      <div>
        <Label>Unit / Apt / Suite <span className="text-gray-400 font-normal">(optional)</span></Label>
        <input className={cls(false)} name="addressUnit" value={form.addressUnit} maxLength={20} placeholder="e.g. Unit 302" onChange={e=>setForm(prev=>({...prev,addressUnit:e.target.value}))} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label req>City</Label>
          <input className={cls(inv(!form.addressCity.trim()))} value={form.addressCity} maxLength={70} onChange={e=>setForm(prev=>({...prev,addressCity:e.target.value}))} />
          <Err show={inv(!form.addressCity.trim())} msg="Required" />
        </div>
        <div>
          <Label req>Province</Label>
          <input className={cls(inv(!form.addressProvince.trim()))} value={form.addressProvince} maxLength={30}
            onChange={e=>setForm(prev=>({...prev,addressProvince:e.target.value}))}
            onBlur={e=>{
              const raw=e.target.value.trim();
              if(!raw) return;
              const upper=raw.toUpperCase();
              if(CA_PROVINCES[upper]) { setForm(prev=>({...prev,addressProvince:CA_PROVINCES[upper]})); return; }
              const norm=Object.values(CA_PROVINCES).find(x=>x.toLowerCase()===raw.toLowerCase());
              if(norm) setForm(prev=>({...prev,addressProvince:norm}));
            }} />
          <Err show={inv(!form.addressProvince.trim())} msg="Required" />
        </div>
        <div>
          <Label req>Postal Code</Label>
          <input className={cls(inv(!form.addressPostalCode.trim()))} value={form.addressPostalCode} maxLength={7}
            onChange={e=>setForm(prev=>({...prev,addressPostalCode:e.target.value.toUpperCase()}))} placeholder="V6G 1A6" />
          <Err show={inv(!form.addressPostalCode.trim())} msg="Required" />
        </div>
      </div>
    </Card>
  );
}

// ── Main Wizard ──────────────────────────────────────────────────────────────
export default function VisaWizard() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [otpVerified, setOtpVerified] = useState(false);
  const [files, setFiles] = useState<Record<string,File|null>>({ passportScan:null, photoScan:null, invitationLetter:null, supportingDoc:null });
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string|null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string,string>>({});
  const fileRefs = useRef<Record<string,HTMLInputElement|null>>({});

  const step = STEPS[stepIdx];
  const today = new Date().toISOString().split("T")[0];

  function set<K extends keyof Form>(k: K, v: Form[K]) { setForm(prev=>({...prev,[k]:v})); }

  function validateStep(): boolean {
    const f = form;
    switch(step.id) {
      case "personal": return !!(f.firstName&&f.familyName&&f.sex&&f.placeOfBirth&&f.dateOfBirth&&f.nationality&&f.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)&&f.phoneNumber.replace(/\D/g,"").length===10);
      case "otp": return otpVerified;
      case "passport": return !!(f.passportNumber&&f.passportPlace&&f.passportIssueDate&&f.passportExpiryDate);
      case "address": return !!(f.addressStreet&&f.addressCity&&f.addressProvince&&f.addressPostalCode);
      case "purpose": return !!(f.visaType&&f.purposeOfVisit);
      case "uploads": return !!files.passportScan&&f.disclaimerAccepted;
      default: return true;
    }
  }

  function next() {
    setTouched(true);
    if (!validateStep()) return;
    setTouched(false);
    setStepIdx(i=>i+1);
    window.scrollTo(0,0);
  }
  function back() { setStepIdx(i=>i-1); window.scrollTo(0,0); }

  async function handleFileSelect(key: string, file: File) {
    const errors = {...fileErrors};
    // Basic checks before even uploading
    const MAX = 10*1024*1024;
    if (file.size > MAX) { errors[key]="File too large (max 10MB)"; setFileErrors(errors); return; }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf","jpg","jpeg"].includes(ext||"")) { errors[key]="Only PDF or JPG allowed"; setFileErrors(errors); return; }
    delete errors[key];
    setFileErrors(errors);
    setFiles(prev=>({...prev,[key]:file}));
  }

  async function handleSubmit() {
    setSubmitting(true); setSubmitError(null);
    try {
      const fd = new FormData();
      const phoneDigits = form.phoneNumber.replace(/\D/g,"").slice(0,10);
      fd.append("fullName", [form.firstName,form.middleName,form.familyName].filter(Boolean).join(" "));
      fd.append("aliasName",""); fd.append("gender", form.sex==="Male"?"Laki-laki":"Perempuan");
      fd.append("dateOfBirth",form.dateOfBirth); fd.append("birthCity",form.placeOfBirth);
      fd.append("birthCountry",""); fd.append("nationality",form.nationality);
      fd.append("religion",""); fd.append("birthCertIssuedIn",""); fd.append("registrationId","");
      fd.append("passportId",form.passportNumber); fd.append("passportIssueDate",form.passportIssueDate);
      fd.append("passportExpiryDate",form.passportExpiryDate);
      fd.append("oldPassportNumber",""); fd.append("oldPassportIssueDate","");
      fd.append("oldPassportExpiryDate",""); fd.append("oldPassportIssuer",form.passportPlace);
      fd.append("ktpNumber",""); fd.append("ktpIssueDate",""); fd.append("birthCertNumber","");
      fd.append("addressCanadaStreet",form.addressStreet+(form.addressUnit?", "+form.addressUnit:""));
      fd.append("addressCanadaCity",form.addressCity); fd.append("addressCanadaProvince",form.addressProvince);
      fd.append("addressCanadaPostalCode",form.addressPostalCode);
      fd.append("addressIndonesiaStreet",form.intendedAddressIndonesia);
      fd.append("addressIndonesiaCity",form.intendedCityIndonesia);
      fd.append("addressIndonesiaProvince",""); fd.append("addressIndonesiaDistrict","");
      fd.append("addressIndonesiaPostalCode","");
      fd.append("phoneNumber",phoneDigits); fd.append("email",form.email);
      fd.append("maritalStatus",form.maritalStatus); fd.append("occupation",form.occupation);
      fd.append("workplace",form.employer); fd.append("workplaceAddress",form.companyAddress);
      fd.append("stayStatus","VR"); fd.append("fatherName",""); fd.append("fatherBirthPlace","");
      fd.append("fatherBirthDate",""); fd.append("fatherNationality",""); fd.append("fatherAddress","");
      fd.append("motherName",""); fd.append("motherBirthPlace",""); fd.append("motherBirthDate","");
      fd.append("motherNationality",""); fd.append("motherAddress","");
      fd.append("spouseName",""); fd.append("spouseBirthPlace",""); fd.append("spouseBirthDate","");
      fd.append("spouseNationality",""); fd.append("spouseAddress","");
      fd.append("emergencyCanadaName",form.sponsorName); fd.append("emergencyCanadaAddress",form.sponsorAddress);
      fd.append("emergencyCanadaPhone",form.sponsorPhone); fd.append("emergencyCanadaRelation","Sponsor");
      fd.append("emergencyIndonesiaName",""); fd.append("emergencyIndonesiaAddress","");
      fd.append("emergencyIndonesiaPhone",""); fd.append("emergencyIndonesiaRelation","");
      fd.append("previousPassportStatus","still_valid"); fd.append("isChildPassportRequest","false");
      fd.append("reason",`${form.visaType} — ${form.purposeOfVisit}${form.purposeOther?": "+form.purposeOther:""}`);
      fd.append("disclaimerAccepted","true"); fd.append("portalType","visa");

      if (files.passportScan) fd.append("passportScan", files.passportScan);
      if (files.invitationLetter) fd.append("formScan", files.invitationLetter);
      if (files.supportingDoc) fd.append("otherIdScan", files.supportingDoc);

      const res = await fetch("/api/submissions", { method:"POST", body:fd });
      if (!res.ok) { const err=await res.json().catch(()=>({})); throw new Error(err.error??"Submission failed"); }
      const sub = await res.json();
      router.push(`/appointment?id=${sub.id}`);
    } catch(e:any) { setSubmitError(e.message??"Submission failed. Please try again."); setSubmitting(false); }
  }

  const f = form;
  const inv = (c:boolean) => touched&&c;

  const phoneDigits = f.phoneNumber.replace(/\D/g,"");

  return (
    <div className="min-h-screen">
      <div className="bg-[#0d2b5e] py-8 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1">KJRI Vancouver</p>
          <h1 className="text-2xl font-bold text-white">Indonesian Visa Application</h1>
          <p className="text-sm text-blue-200/80 mt-1">Complete all sections. Your email will be verified before proceeding.</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="mx-auto max-w-2xl px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s,i)=>(
            <div key={s.id} className="flex items-center shrink-0">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition ${i===stepIdx?"bg-emerald-600 text-white":i<stepIdx?"bg-emerald-100 text-emerald-700":"text-gray-400"}`}>
                {i<stepIdx?"✓":i+1} {s.title}
              </div>
              {i<STEPS.length-1&&<div className={`h-px w-3 mx-0.5 ${i<stepIdx?"bg-emerald-300":"bg-gray-200"}`}/>}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-5">

        {/* ── STEP 1: Personal Info ── */}
        {step.id==="personal"&&(
          <Card title="1. Personal Information" subtitle="Enter your details exactly as they appear in your passport.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label req>First Name</Label>
                <input className={cls(inv(!f.firstName))} value={f.firstName} maxLength={50} onChange={e=>set("firstName",e.target.value)} placeholder="First name" />
                <Err show={inv(!f.firstName)} msg="Required" />
              </div>
              <div>
                <Label>Middle Name</Label>
                <input className={cls(false)} value={f.middleName} maxLength={50} onChange={e=>set("middleName",e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <Label req>Family Name</Label>
                <input className={cls(inv(!f.familyName))} value={f.familyName} maxLength={50} onChange={e=>set("familyName",e.target.value)} placeholder="Last name" />
                <Err show={inv(!f.familyName)} msg="Required" />
              </div>
            </div>
            <div>
              <Label req>Sex</Label>
              <div className="flex gap-6">
                {["Male","Female"].map(s=>(
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="sex" value={s} checked={f.sex===s} onChange={()=>set("sex",s)} className="accent-emerald-600"/>{s}
                  </label>
                ))}
              </div>
              <Err show={inv(!f.sex)} msg="Required" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Place of Birth (city & country)</Label>
                <input className={cls(inv(!f.placeOfBirth))} value={f.placeOfBirth} maxLength={100} onChange={e=>set("placeOfBirth",e.target.value)} placeholder="e.g. Toronto, Canada" />
                <Err show={inv(!f.placeOfBirth)} msg="Required" />
              </div>
              <div>
                <Label req>Date of Birth</Label>
                <input type="date" className={cls(inv(!f.dateOfBirth))} value={f.dateOfBirth} max={today} onChange={e=>set("dateOfBirth",e.target.value)} />
                <Err show={inv(!f.dateOfBirth)} msg="Required" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Nationality</Label>
                <input className={cls(inv(!f.nationality))} value={f.nationality} maxLength={60} onChange={e=>set("nationality",e.target.value)} />
                <Err show={inv(!f.nationality)} msg="Required" />
              </div>
              <div>
                <Label>Marital Status</Label>
                <select className={cls(false)} value={f.maritalStatus} onChange={e=>set("maritalStatus",e.target.value)}>
                  <option value="">-- Select --</option>
                  {MARITAL_STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Phone Number (Canada, 10 digits)</Label>
                <input type="tel" className={cls(inv(phoneDigits.length!==10))}
                  value={f.phoneNumber} placeholder="(604) 123-4567"
                  onChange={e=>{ const d=e.target.value.replace(/\D/g,"").slice(0,10); set("phoneNumber",d); }} />
                <Err show={inv(phoneDigits.length!==10)} msg="Must be exactly 10 digits" />
              </div>
              <div>
                <Label req>Email</Label>
                <input type="email" className={cls(inv(!f.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)))}
                  value={f.email} maxLength={254} onChange={e=>set("email",e.target.value)} placeholder="your@email.com" />
                <Err show={inv(!f.email)} msg="Required" />
                <Err show={inv(!!f.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))} msg="Invalid email format" />
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Occupation / Employment (optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Occupation</Label><input className={cls(false)} value={f.occupation} maxLength={60} onChange={e=>set("occupation",e.target.value)} placeholder="e.g. Engineer" /></div>
                <div><Label>Present Employer</Label><input className={cls(false)} value={f.employer} maxLength={80} onChange={e=>set("employer",e.target.value)} placeholder="Company name" /></div>
                <div><Label>Position / Title</Label><input className={cls(false)} value={f.position} maxLength={60} onChange={e=>set("position",e.target.value)} /></div>
                <div><Label>Work Phone</Label><input className={cls(false)} value={f.workPhone} maxLength={20} onChange={e=>set("workPhone",e.target.value)} /></div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3"><Label>Company Address</Label><input className={cls(false)} value={f.companyAddress} maxLength={150} onChange={e=>set("companyAddress",e.target.value)} placeholder="Street address" /></div>
                <div><Label>City</Label><input className={cls(false)} value={f.companyCity} maxLength={70} onChange={e=>set("companyCity",e.target.value)} /></div>
                <div><Label>Province</Label><input className={cls(false)} value={f.companyProvince} maxLength={30} onChange={e=>set("companyProvince",e.target.value)} /></div>
                <div><Label>Country</Label><input className={cls(false)} value={f.companyCountry} maxLength={60} onChange={e=>set("companyCountry",e.target.value)} /></div>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 2: OTP ── */}
        {step.id==="otp"&&(
          otpVerified
            ? <Card title="✅ Email Verified" subtitle="Your email has been verified. Click Continue to proceed."><p className="text-sm text-emerald-600 font-medium">Email {f.email} verified successfully.</p></Card>
            : <OtpStep phone={phoneDigits} email={f.email} onVerified={()=>setOtpVerified(true)} />
        )}

        {/* ── STEP 3: Passport ── */}
        {step.id==="passport"&&(
          <Card title="2. Passport Information" subtitle="Enter your current passport details.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Passport Number</Label>
                <input className={cls(inv(!f.passportNumber))} value={f.passportNumber} maxLength={20} onChange={e=>set("passportNumber",e.target.value.toUpperCase())} placeholder="e.g. AB1234567" />
                <Err show={inv(!f.passportNumber)} msg="Required" />
              </div>
              <div>
                <Label req>Place of Issuance (city & country)</Label>
                <input className={cls(inv(!f.passportPlace))} value={f.passportPlace} maxLength={80} onChange={e=>set("passportPlace",e.target.value)} placeholder="e.g. Ottawa, Canada" />
                <Err show={inv(!f.passportPlace)} msg="Required" />
              </div>
              <div>
                <Label req>Date of Issuance</Label>
                <input type="date" className={cls(inv(!f.passportIssueDate))} value={f.passportIssueDate} max={today} onChange={e=>set("passportIssueDate",e.target.value)} />
                <Err show={inv(!f.passportIssueDate)} msg="Required" />
              </div>
              <div>
                <Label req>Date of Expiry</Label>
                <input type="date" className={cls(inv(!f.passportExpiryDate))} value={f.passportExpiryDate} min={today} onChange={e=>set("passportExpiryDate",e.target.value)} />
                <Err show={inv(!f.passportExpiryDate)} msg="Required" />
              </div>
            </div>
            <div>
              <Label>Type of Passport</Label>
              <div className="flex flex-wrap gap-4">
                {PASSPORT_TYPES.map(t=>(
                  <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="passportType" value={t} checked={f.passportType===t} onChange={()=>set("passportType",t)} className="accent-emerald-600"/>{t}
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <strong>Note:</strong> Your passport must be valid for at least 6 months beyond your intended stay in Indonesia.
            </div>
          </Card>
        )}

        {/* ── STEP 4: Address ── */}
        {step.id==="address"&&<AddressStep form={form} touched={touched} setForm={setForm}/>}

        {/* ── STEP 5: Purpose ── */}
        {step.id==="purpose"&&(
          <Card title="4. Purpose of Visit" subtitle="Select your visa type and reason for visiting Indonesia.">
            <div>
              <Label req>Type of Visa Requested</Label>
              <div className="grid grid-cols-2 gap-3">
                {VISA_TYPES.map(t=>(
                  <label key={t} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${f.visaType===t?"border-emerald-500 bg-emerald-50":"border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="visaType" value={t} checked={f.visaType===t} onChange={()=>set("visaType",t)} className="accent-emerald-600"/>
                    <span className="text-sm font-medium">{t}</span>
                  </label>
                ))}
              </div>
              <Err show={inv(!f.visaType)} msg="Required" />
            </div>
            <div>
              <Label req>Purpose of Visit to Indonesia</Label>
              <div className="grid grid-cols-2 gap-2">
                {PURPOSES.map(p=>(
                  <label key={p} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition text-sm ${f.purposeOfVisit===p?"border-emerald-500 bg-emerald-50":"border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="purposeOfVisit" value={p} checked={f.purposeOfVisit===p} onChange={()=>set("purposeOfVisit",p)} className="accent-emerald-600"/>{p}
                  </label>
                ))}
              </div>
              <Err show={inv(!f.purposeOfVisit)} msg="Required" />
            </div>
            {f.purposeOfVisit==="Others"&&(
              <div>
                <Label>Please specify</Label>
                <input className={cls(false)} value={f.purposeOther} maxLength={200} onChange={e=>set("purposeOther",e.target.value)} placeholder="Describe your purpose" />
              </div>
            )}
          </Card>
        )}

        {/* ── STEP 6: Indonesia Stay ── */}
        {step.id==="indonesia"&&(
          <Card title="5. Intended Stay in Indonesia" subtitle="Where will you be staying and your travel details.">
            <div><Label>Intended Address in Indonesia</Label><input className={cls(false)} value={f.intendedAddressIndonesia} maxLength={200} onChange={e=>set("intendedAddressIndonesia",e.target.value)} placeholder="Hotel name or address" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>City & Province</Label><input className={cls(false)} value={f.intendedCityIndonesia} maxLength={100} onChange={e=>set("intendedCityIndonesia",e.target.value)} placeholder="e.g. Bali, Bali" /></div>
              <div><Label>Phone Number</Label><input className={cls(false)} value={f.intendedPhone} maxLength={20} onChange={e=>set("intendedPhone",e.target.value)} /></div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Flight / Vessel Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Port of Entry</Label><input className={cls(false)} value={f.portOfEntry} maxLength={80} onChange={e=>set("portOfEntry",e.target.value)} placeholder="e.g. Ngurah Rai, Bali" /></div>
                <div><Label>Date of Entry</Label><input type="date" className={cls(false)} value={f.dateOfEntry} min={today} onChange={e=>set("dateOfEntry",e.target.value)} /></div>
                <div><Label>Flight No.</Label><input className={cls(false)} value={f.flightIn} maxLength={20} onChange={e=>set("flightIn",e.target.value)} placeholder="e.g. GA718" /></div>
                <div><Label>Port of Exit</Label><input className={cls(false)} value={f.portOfExit} maxLength={80} onChange={e=>set("portOfExit",e.target.value)} /></div>
                <div><Label>Date of Exit</Label><input type="date" className={cls(false)} value={f.dateOfExit} min={f.dateOfEntry||today} onChange={e=>set("dateOfExit",e.target.value)} /></div>
                <div><Label>Flight No.</Label><input className={cls(false)} value={f.flightOut} maxLength={20} onChange={e=>set("flightOut",e.target.value)} /></div>
              </div>
            </div>
            <div>
              <Label>Do you have an Invitation / Reference Letter?</Label>
              <YesNo name="hasInvitationLetter" value={f.hasInvitationLetter} onChange={v=>set("hasInvitationLetter",v)}/>
              {f.hasInvitationLetter==="Yes"&&<p className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">Please upload your invitation letter in the Documents step.</p>}
            </div>
          </Card>
        )}

        {/* ── STEP 7: Sponsor ── */}
        {step.id==="sponsor"&&(
          <Card title="6. Contact Person / Sponsor in Indonesia" subtitle="If you have a sponsor or contact person in Indonesia. Leave blank if not applicable.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><input className={cls(false)} value={f.sponsorName} maxLength={80} onChange={e=>set("sponsorName",e.target.value)} /></div>
              <div><Label>Position / Title</Label><input className={cls(false)} value={f.sponsorPosition} maxLength={60} onChange={e=>set("sponsorPosition",e.target.value)} /></div>
              <div><Label>Company / Institution</Label><input className={cls(false)} value={f.sponsorCompany} maxLength={80} onChange={e=>set("sponsorCompany",e.target.value)} /></div>
              <div><Label>Phone</Label><input className={cls(false)} value={f.sponsorPhone} maxLength={20} onChange={e=>set("sponsorPhone",e.target.value)} /></div>
            </div>
            <div><Label>Address</Label><input className={cls(false)} value={f.sponsorAddress} maxLength={200} onChange={e=>set("sponsorAddress",e.target.value)} placeholder="Street, city, province & postal code" /></div>
          </Card>
        )}

        {/* ── STEP 8: Background Questions ── */}
        {step.id==="questions"&&(
          <Card title="7. Background Questions" subtitle="Answer truthfully. A YES does not automatically disqualify your application.">
            {([
              {k:"beenToIndonesiaBefore",l:"Have you ever been to Indonesia before?",dk:"indonesiaVisitDetails",dp:"When and how long did you stay?"},
              {k:"hasOtherCountryVisa",l:"Are you in possession of another country's valid visa?",dk:"otherVisaDetails",dp:"Country of issuance"},
            ] as const).map(({k,l,dk,dp})=>(
              <div key={k} className="space-y-2">
                <Label>{l}</Label>
                <YesNo name={k} value={(f as any)[k]} onChange={v=>set(k as keyof Form,v)}/>
                {(f as any)[k]==="Yes"&&<input className={cls(false)} value={(f as any)[dk]} maxLength={200} onChange={e=>set(dk as keyof Form,e.target.value)} placeholder={dp}/>}
              </div>
            ))}
            {([
              {k:"visaDenied",l:"Has your application for Indonesian Visa ever been denied?"},
              {k:"orderedToLeave",l:"Have you ever been ordered to leave Indonesia?"},
              {k:"everArrested",l:"Have you ever been arrested or convicted of a criminal act?"},
            ] as const).map(({k,l})=>(
              <div key={k} className="space-y-2">
                <Label>{l}</Label>
                <YesNo name={k} value={(f as any)[k]} onChange={v=>set(k as keyof Form,v)}/>
              </div>
            ))}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
              While a YES answer does not automatically signify ineligibility for a visa, you may be required to personally appear before a consular officer.
            </div>
          </Card>
        )}

        {/* ── STEP 9: Uploads ── */}
        {step.id==="uploads"&&(
          <Card title="8. Document Uploads" subtitle="Upload your passport scan and supporting documents as PDF or JPG (max 10MB each).">
            {([
              {key:"passportScan",label:"Passport (identity page)",req:true,hint:"Photo page with your photo and personal details"},
              {key:"photoScan",label:"Passport-size photo (40mm × 60mm)",req:false,hint:"Recent photo, plain white background"},
              {key:"invitationLetter",label:"Invitation / Reference Letter",req:false,hint:"Required if you answered Yes in the Indonesia Stay step"},
              {key:"supportingDoc",label:"Other Supporting Document",req:false,hint:"Flight ticket, hotel booking, bank statement, etc."},
            ] as const).map(({key,label,req,hint})=>(
              <div key={key}>
                <Label req={req}>{label}</Label>
                {hint&&<p className="text-xs text-gray-500 mb-1">{hint}</p>}
                <div onClick={()=>fileRefs.current[key]?.click()}
                  className={`flex items-center justify-between border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition ${files[key]?"border-emerald-400 bg-emerald-50":"border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30"}`}>
                  <span className="text-sm text-gray-600">{files[key]?files[key]!.name:"Click to select file (PDF or JPG)"}</span>
                  <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                  <input ref={el=>{fileRefs.current[key]=el;}} type="file" accept="application/pdf,image/jpeg,image/jpg" className="hidden"
                    onChange={e=>{ const fl=e.target.files?.[0]; if(fl) handleFileSelect(key,fl); }}/>
                </div>
                {fileErrors[key]&&<Err show msg={fileErrors[key]}/>}
                {req&&inv(!files[key])&&<Err show msg="Required — please upload your passport scan"/>}
              </div>
            ))}

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={f.disclaimerAccepted} onChange={e=>set("disclaimerAccepted",e.target.checked)} className="mt-0.5 accent-emerald-600"/>
                <span className="text-xs text-emerald-800 leading-relaxed">
                  I hereby declare that the statements given are true and correct. I understand that any false or misleading statement may result in permanent refusal of a visa. I am aware that even with a valid visa, permission to enter Indonesia remains at the discretion of the Immigration authorities.
                </span>
              </label>
              <Err show={inv(!f.disclaimerAccepted)} msg="You must accept the declaration to proceed"/>
            </div>

            {submitError&&<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {stepIdx>0
            ? <button type="button" onClick={back} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer">← Back</button>
            : <div/>}

          {stepIdx<STEPS.length-1
            ? <button type="button" onClick={next}
                disabled={step.id==="otp"&&!otpVerified}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {step.id==="otp"&&!otpVerified?"Verify your email first":"Continue →"}
              </button>
            : <button type="button" onClick={handleSubmit}
                disabled={submitting||!f.disclaimerAccepted||!files.passportScan}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Submitting…</>
                  : "Submit & Book Appointment →"}
              </button>}
        </div>
      </div>
    </div>
  );
}
