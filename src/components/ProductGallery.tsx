"use client";

import { useState } from "react";

type Props = {
  name: string;
  images: string[];
};

export default function ProductGallery({ name, images }: Props) {
  const gallery = images.length > 0 ? images : [""];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#eff8ff] to-[#e0f2fe] text-6xl dark:from-[#0c1c2e] dark:to-[#0a1522]">
        {gallery[active] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gallery[active]}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          "📦"
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active
                  ? "border-[#2563eb] dark:border-[#38bdf8]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
