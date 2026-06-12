"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementBanner() {
  const [text, setText] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/announcement", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const t = d.text?.trim() ?? "";
        if (t) setText(t);
      })
      .catch(() => {});
  }, []);

  if (!text) return null;

  return (
    <div className="mt-5">
      <AnimatePresence mode="wait" initial={false}>
        {!collapsed ? (
          /* ── Full banner ── */
          <motion.div
            key="full"
            initial={{ opacity: 0, height: 0, scale: 0.97 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="relative rounded-2xl overflow-hidden">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />

              <div className="bg-red-50 border border-red-200 rounded-2xl pl-5 pr-4 py-4">
                <div className="flex items-start gap-3">
                  {/* Ping icon */}
                  <div className="relative shrink-0 mt-0.5">
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">
                      Pengumuman
                    </p>
                    <p className="text-sm text-red-900 leading-relaxed whitespace-pre-line">
                      {text}
                    </p>
                  </div>

                  {/* Collapse button */}
                  <button
                    onClick={() => setCollapsed(true)}
                    className="shrink-0 text-red-300 hover:text-red-600 transition-colors text-xl leading-none cursor-pointer mt-0.5"
                    aria-label="Tutup pengumuman"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Collapsed pill ── */
          <motion.button
            key="pill"
            onClick={() => setCollapsed(false)}
            initial={{ opacity: 0, scale: 0.85, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -4 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3.5 py-1.5 hover:bg-red-100 transition-colors cursor-pointer group"
            aria-label="Buka pengumuman"
          >
            {/* Mini ping dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">
              Pengumuman
            </span>
            {/* Expand chevron */}
            <svg
              className="w-3 h-3 text-red-400 group-hover:text-red-600 transition-colors"
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
