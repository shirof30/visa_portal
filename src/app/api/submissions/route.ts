//src\app\api\submissions\route.ts
import { NextRequest, NextResponse } from "next/server";
import { scanBuffer } from "@/lib/scanFile";
import { UPLOADS_DIR } from "@/lib/constants";
import {
  createSubmission,
  listSubmissions,
  bookSlot,
  getSubmission,
  generateApplicationRef,
} from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { sendVisaConfirmationEmail } from "@/lib/sendVisaConfirmationEmail";

function safeSlug(input: string) {
  return (
    (input || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file"
  );
}

const FIELD_LABEL: Record<string, string> = {
  passportScan: "paspor",
  oldPassportScan: "paspor-lama-halaman-4-5",
  birthCertScan: "akta-kelahiran",
  ktpScan: "ktp",
  permitScan: "izin-tinggal",
  otherIdScan: "id-sim",
  addressProofScan: "bukti-alamat",

  policeReportLetter: "surat-laporan-polisi",
  damageChronologyLetter: "surat-kronologi-kerusakan",

  completionLetter: "completion-letter",
  loa: "loa",
  jobOffer: "job-offer",
  workContract: "kontrak-kerja",

  fatherPassport: "paspor-ayah",
  fatherPermit: "izin-tinggal-ayah",
  motherPassport: "paspor-ibu",
  motherPermit: "izin-tinggal-ibu",
  parentsMarriageDoc: "dokumen-pernikahan-orangtua",
  otherForeignPassport: "paspor-asing-lainnya",

  formScan: "formulir",
  statementScan: "surat-pernyataan",
};
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
async function saveUpload(
  formData: FormData,
  field: string,
  folder: string,
  applicantNameSlug?: string,
) {
  const file = formData.get(field) as File | null;
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Jenis file invalid: ${file.type}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar ${field}: max 10MB.`);
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await scanBuffer(buffer, file.name); // ← add this line

  const originalExt = path.extname(file.name);
  const ext =
    originalExt ||
    (file.type === "application/pdf" ? ".pdf" : "") ||
    ".pdf";

  const label = safeSlug(FIELD_LABEL[field] ?? field);
  const person = safeSlug(applicantNameSlug ?? folder);
  const suffix = crypto.randomBytes(3).toString("hex");


  const fileName = `${person}_${label}_${suffix}${ext}`;

  const uploadDir = path.join(UPLOADS_DIR, folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);


  return `${folder}/${fileName}`;

}

function slugifyName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown"
  );
}

// GET: list submissions (for admin & appointment page)
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function getSlotCapacity(slotIso: string): number {
  const dateStr = slotIso.split("T")[0];
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return (dow === 0 || dow === 6) ? 5 : 3;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      id?: string;
      slotIso?: string;
    };

    if (!body.id || !body.slotIso) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { id, slotIso } = body;

    const existing = await getSubmission(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const capacity = getSlotCapacity(slotIso);
    const updated = await bookSlot(id, slotIso, capacity);
    if (!updated) {
      return NextResponse.json(
        { error: `Slot penuh (maksimal ${capacity} orang per jam yang sama).` },
        { status: 400 }
      );
    }
    if (existing.email) {
      sendVisaConfirmationEmail({
        toEmail: existing.email,
        fullName: existing.fullName,
        applicationRef: existing.applicationRef,
        reason: existing.reason,
      }).catch((err) => console.error("Confirmation email failed:", err));
    }
    return NextResponse.json(updated);
  }

  const formData = await req.formData();

  // base
  const fullName = String(formData.get("fullName") || "").slice(0, 100);
  const appRef = generateApplicationRef();
  const uploadFolder = `${slugifyName(fullName).slice(0, 40)}_${appRef}`;


  const gender = String(formData.get("gender") || "");
  const religion = String(formData.get("religion") || "");

  const birthCity = String(formData.get("birthCity") || "");
  const birthCountry = String(formData.get("birthCountry") || "");
  const aliasName = String(formData.get("aliasName") || "");
  const birthCertIssuedIn = String(formData.get("birthCertIssuedIn") || "");



  const dateOfBirth = String(formData.get("dateOfBirth") || "");

  // ===== PASSPORT CURRENT =====
  const passportId = String(formData.get("passportId") || "");
  const passportIssueDate = String(formData.get("passportIssueDate") || "");
  const passportExpiryDate = String(formData.get("passportExpiryDate") || "");

  // ===== PASSPORT OLD =====
  const registrationId = String(formData.get("registrationId") || "");
  const oldPassportNumber = String(formData.get("oldPassportNumber") || "");
  const oldPassportIssueDate = String(formData.get("oldPassportIssueDate") || "");
  const oldPassportExpiryDate = String(formData.get("oldPassportExpiryDate") || "");
  const oldPassportIssuer = String(formData.get("oldPassportIssuer") || "");
  const previousPassportStatusRaw = String(formData.get("previousPassportStatus") || "none");
  const previousPassportStatus =
    previousPassportStatusRaw === "still_valid" || previousPassportStatusRaw === "expired"
      ? previousPassportStatusRaw
      : "none";



  // ===== CIVIL DOCS =====
  const ktpNumber = String(formData.get("ktpNumber") || "");
  const birthCertNumber = String(formData.get("birthCertNumber") || "");
  const ktpIssueDate = String(formData.get("ktpIssueDate") || "");

  // ===== ADDRESSES =====
  const addressCanadaStreet = String(formData.get("addressCanadaStreet") || "");
  const addressCanadaCity = String(formData.get("addressCanadaCity") || "");
  const addressCanadaProvince = String(formData.get("addressCanadaProvince") || "");
  const addressCanadaPostalCode = String(formData.get("addressCanadaPostalCode") || "");

  const addressIndonesiaStreet = String(formData.get("addressIndonesiaStreet") || "");
  const addressIndonesiaCity = String(formData.get("addressIndonesiaCity") || "");
  const addressIndonesiaProvince = String(formData.get("addressIndonesiaProvince") || "");
  const addressIndonesiaDistrict = String(formData.get("addressIndonesiaDistrict") || "");
  const addressIndonesiaPostalCode = String(formData.get("addressIndonesiaPostalCode") || "");


  // ===== CONTACT =====
  const phoneNumber = String(formData.get("phoneNumber") || "");
  const email = String(formData.get("email") || "");

  // ===== STATUS =====
  const maritalStatus = String(formData.get("maritalStatus") || "");
  const occupation = String(formData.get("occupation") || "");
  const workplace = String(formData.get("workplace") || "");
  const workplaceAddress = String(formData.get("workplaceAddress") || "");

  const stayStatus = String(formData.get("stayStatus") || "");
  const nationality = String(formData.get("nationality") || "");

  // ===== PARENTS =====
  const fatherName = String(formData.get("fatherName") || "");
  const fatherBirthPlace = String(formData.get("fatherBirthPlace") || "");
  const fatherBirthDate = String(formData.get("fatherBirthDate") || "");
  const fatherNationality = String(formData.get("fatherNationality") || "");

  const motherName = String(formData.get("motherName") || "");
  const motherBirthPlace = String(formData.get("motherBirthPlace") || "");
  const motherBirthDate = String(formData.get("motherBirthDate") || "");
  const motherNationality = String(formData.get("motherNationality") || "");

  const fatherAddress = String(formData.get("fatherAddress") || "");
  const motherAddress = String(formData.get("motherAddress") || "");
  const spouseAddress = String(formData.get("spouseAddress") || "");

  // ===== SPOUSE =====
  const spouseName = String(formData.get("spouseName") || "");
  const spouseBirthPlace = String(formData.get("spouseBirthPlace") || "");
  const spouseBirthDate = String(formData.get("spouseBirthDate") || "");
  const spouseNationality = String(formData.get("spouseNationality") || "");

  // ===== EMERGENCY =====
  const emergencyCanadaName = String(formData.get("emergencyCanadaName") || "");
  const emergencyCanadaAddress = String(formData.get("emergencyCanadaAddress") || "");
  const emergencyCanadaPhone = String(formData.get("emergencyCanadaPhone") || "");
  const emergencyCanadaRelation = String(formData.get("emergencyCanadaRelation") || "");

  const emergencyIndonesiaName = String(formData.get("emergencyIndonesiaName") || "");
  const emergencyIndonesiaAddress = String(formData.get("emergencyIndonesiaAddress") || "");
  const emergencyIndonesiaPhone = String(formData.get("emergencyIndonesiaPhone") || "");
  const emergencyIndonesiaRelation = String(formData.get("emergencyIndonesiaRelation") || "");


  // ===== SERVICE =====
  const reason = String(formData.get("reason") || "");
  const isChildPassportRequest =
    String(formData.get("isChildPassportRequest") || "").toLowerCase() === "true";


  const disclaimerAcceptedRaw = String(formData.get("disclaimerAccepted") || "").toLowerCase();
  const disclaimerAccepted = disclaimerAcceptedRaw === "true";
  if (!disclaimerAccepted) {
    return NextResponse.json(
      { error: "Disclaimer must be accepted" },
      { status: 400 }
    );
  }

  // ===== FILE UPLOADS =====
  let passportScanName, oldPassportScan, birthCertScan, ktpScan, permitScan,
    otherIdScan, addressProofScan, policeReportLetter, damageChronologyLetter,
    completionLetter, loa, jobOffer, workContract, fatherPassport, fatherPermit,
    motherPassport, motherPermit, parentsMarriageDoc, otherForeignPassport,
    formScan, statementScan;

  try {
    passportScanName = await saveUpload(formData, "passportScan", uploadFolder);
    oldPassportScan = await saveUpload(formData, "oldPassportScan", uploadFolder);
    birthCertScan = await saveUpload(formData, "birthCertScan", uploadFolder);
    ktpScan = await saveUpload(formData, "ktpScan", uploadFolder);
    permitScan = await saveUpload(formData, "permitScan", uploadFolder);
    otherIdScan = await saveUpload(formData, "otherIdScan", uploadFolder);
    addressProofScan = await saveUpload(formData, "addressProofScan", uploadFolder);
    policeReportLetter = await saveUpload(formData, "policeReportLetter", uploadFolder);
    damageChronologyLetter = await saveUpload(formData, "damageChronologyLetter", uploadFolder);
    completionLetter = await saveUpload(formData, "completionLetter", uploadFolder);
    loa = await saveUpload(formData, "loa", uploadFolder);
    jobOffer = await saveUpload(formData, "jobOffer", uploadFolder);
    workContract = await saveUpload(formData, "workContract", uploadFolder);
    fatherPassport = await saveUpload(formData, "fatherPassport", uploadFolder);
    fatherPermit = await saveUpload(formData, "fatherPermit", uploadFolder);
    motherPassport = await saveUpload(formData, "motherPassport", uploadFolder);
    motherPermit = await saveUpload(formData, "motherPermit", uploadFolder);
    parentsMarriageDoc = await saveUpload(formData, "parentsMarriageDoc", uploadFolder);
    otherForeignPassport = await saveUpload(formData, "otherForeignPassport", uploadFolder);
    formScan = await saveUpload(formData, "formScan", uploadFolder);
    statementScan = await saveUpload(formData, "statementScan", uploadFolder);
  } catch (err: any) {
    console.error("Upload error:", err);
    const isValidationError =
      err.message?.startsWith("Invalid file type") ||
      err.message?.startsWith("File too large") ||
      err.message?.startsWith("Jenis file tidak sesuai extensi");
    const userMessage = isValidationError
      ? err.message
      : "Gagal mengunggah file. Pastikan semua file valid dan coba lagi.";
    return NextResponse.json({ error: userMessage }, { status: 400 });
  }

  const sub = await createSubmission({
    fullName,
    gender,
    birthCity,
    birthCountry,
    religion,
    dateOfBirth,
    aliasName,
    birthCertIssuedIn,
    addressIndonesiaPostalCode,
    workplaceAddress,
    fatherAddress,
    motherAddress,
    spouseAddress,



    isChildPassportRequest,
    passportId,
    passportIssueDate,
    passportExpiryDate,

    registrationId,
    oldPassportNumber,
    oldPassportIssueDate,
    ktpIssueDate,
    oldPassportExpiryDate,
    oldPassportIssuer,

    ktpNumber,
    birthCertNumber,

    addressCanadaStreet,
    addressCanadaCity,
    addressCanadaProvince,
    addressCanadaPostalCode,

    addressIndonesiaStreet,
    addressIndonesiaCity,
    addressIndonesiaProvince,
    addressIndonesiaDistrict,

    phoneNumber,
    email,

    maritalStatus,
    occupation,
    workplace,
    stayStatus,
    nationality,

    fatherName,
    fatherBirthPlace,
    fatherBirthDate,
    fatherNationality,
    motherName,
    motherBirthPlace,
    motherBirthDate,
    motherNationality,

    spouseName,
    spouseBirthPlace,
    spouseBirthDate,
    spouseNationality,

    emergencyCanadaName,
    emergencyCanadaAddress,
    emergencyCanadaPhone,
    emergencyCanadaRelation,

    emergencyIndonesiaName,
    emergencyIndonesiaAddress,
    emergencyIndonesiaPhone,
    emergencyIndonesiaRelation,
    previousPassportStatus,


    reason,
    disclaimerAccepted,
    portalType: "visa" as const,

    passportScanName,
    oldPassportScan,
    birthCertScan,
    ktpScan,
    permitScan,
    otherIdScan,
    formScan,
    statementScan,
    addressProofScan,



    policeReportLetter,
    damageChronologyLetter,
    completionLetter,
    loa,
    jobOffer,
    workContract,

    fatherPassport,
    fatherPermit,
    motherPassport,
    motherPermit,
    parentsMarriageDoc,
    otherForeignPassport,
  }, appRef);


  // Send confirmation email immediately (no appointment slot for visa)
  if (sub.email) {
    sendVisaConfirmationEmail({
      toEmail: sub.email,
      fullName: sub.fullName,
      applicationRef: sub.applicationRef,
      reason: sub.reason,
    }).catch((err) => console.error("Visa confirmation email failed:", err));
  }

  return NextResponse.json(sub, { status: 201 });

}
