import path from "path";

export const UPLOADS_DIR: string =
  process.env.UPLOADS_DIR ?? path.join(process.cwd(), "data", "uploads");