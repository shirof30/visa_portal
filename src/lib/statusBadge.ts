import type { ApplicationStatus } from "@/lib/db";

export function formatStatusLabel(status: ApplicationStatus): string {
  return status; // sudah bahasa Indonesia
}

export function statusBadgeClass(status: ApplicationStatus): string {
  switch (status) {
    case "Permohonan diterima":
      return "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700";
    case "Permohonan disetujui":
      return "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700";
    case "Permohonan ditunda":
      return "inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800";
    case "Permohonan ditolak":
      return "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700";
    case "Permohonan sedang proses cetak":
      return "inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700";
    case "Paspor selesai diproses":
      return "inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700";
    default:
      return "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700";
  }
}
