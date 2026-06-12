import { Suspense } from "react";
import AppointmentPageClient from "./AppointmentPageClient";

export default function AppointmentPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-10">Loading…</div>}>
      <AppointmentPageClient />
    </Suspense>
  );
}
