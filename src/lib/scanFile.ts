import NodeClam from "clamscan";
import fs from "fs/promises";
import path from "path";
import os from "os";

let clamInstance: any = null;

async function getClam() {
  if (!clamInstance) {
    const clam = new NodeClam();
    clamInstance = await clam.init({
      clamscan: { active: false },
      clamdscan: {
        active: true,
        path: "/usr/bin/clamdscan",
        socket: "/run/clamav/clamd.ctl",
      },
      preference: "clamdscan",
    });
  }
  return clamInstance;
}

export async function scanBuffer(buffer: Buffer, filename: string): Promise<void> {
  // Magic bytes check
  if (filename.match(/\.pdf$/i)) {
    if (buffer.slice(0, 4).toString() !== "%PDF") {
      throw new Error("File PDF tidak valid");
    }
  } else if (filename.match(/\.(jpg|jpeg)$/i)) {
    if (!(buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF)) {
      throw new Error("File JPG tidak valid");
    }
  }

  // Write to temp file for clamscan CLI
  const tmpPath = path.join(os.tmpdir(), `scan_${Date.now()}_${filename}`);
  await fs.writeFile(tmpPath, buffer);

  try {
    const clam = await getClam();
    const { isInfected, viruses } = await clam.scanFile(tmpPath);
    if (isInfected) {
      throw new Error(`File terdeteksi berbahaya: ${viruses?.join(", ")}`);
    }
  } finally {
    await fs.unlink(tmpPath).catch(() => {}); // always clean up
  }
}