import { NextResponse } from "next/server";
 
// DELETE endpoint has been removed — submission deletion is handled
// exclusively by the admin portal (/api/admin/submissions/[id]).
// This route is intentionally left without any handlers.
 
export async function DELETE() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
 