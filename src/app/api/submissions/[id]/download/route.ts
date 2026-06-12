// import { NextRequest } from "next/server";
// import { getSubmission } from "@/lib/db";
// import path from "path";
// import fs from "fs/promises";
// import JSZip from "jszip";

// export const runtime = "nodejs"; // make sure we run on Node, not edge

// // Helper: slugify full name for folder name inside zip
// function slugifyName(name: string) {
//   return (
//     name
//       .trim()
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "") || "submission"
//   );
// }

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   const sub = await getSubmission(id);
//   if (!sub) {
//     return new Response("Submission not found", { status: 404 });
//   }

//  const fileFields = [
//   // base
//   "passportScanName",
//   "oldPassportScan",
//   "birthCertScan",
//   "ktpScan",
//   "addressProofScan",
//   "permitScan",
//   "otherIdScan",
//   "formScan",
//   "statementScan",

//   // existing conditional
//   "policeReportLetter",
//   "damageChronologyLetter",
//   "completionLetter",
//   "loa",
//   "jobOffer",
//   "workContract",

//   // child passport uploads
//   "fatherPassport",
//   "fatherPermit",
//   "motherPassport",
//   "motherPermit",
//   "parentsMarriageDoc",
//   "otherForeignPassport",
// ] as const;


//   type FieldName = (typeof fileFields)[number];

//   const entries: { rel: string; fullPath: string }[] = [];

//   for (const field of fileFields) {
//     const value = sub[field as FieldName];
//     if (!value) continue;

//     const rel = value.replace(/^\/?uploads\//, "");
//     const fullPath = path.join(process.cwd(), "data", "uploads", rel);
//     entries.push({ rel, fullPath });
//   }

//   if (entries.length === 0) {
//     return new Response("No files for this submission", { status: 404 });
//   }

//   const zip = new JSZip();
//   const folderSlug = slugifyName(sub.fullName || "submission");

//   for (const { rel, fullPath } of entries) {
//     try {
//       const data = await fs.readFile(fullPath);
//       const filename = path.basename(rel);
//       zip.file(`${folderSlug}/${filename}`, data);
//     } catch {
//     }
//   }

//   if (Object.keys(zip.files).length === 0) {
//     return new Response("Files not found on disk", { status: 404 });
//   }

//   const uint8 = await zip.generateAsync({ type: "uint8array" });

//   return new Response(uint8 as any, {
//     status: 200,
//     headers: {
//       "Content-Type": "application/zip",
//       "Content-Disposition": `attachment; filename="${encodeURIComponent(
//         folderSlug
//       )}.zip"`,
//     },
//   });
// }
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}

