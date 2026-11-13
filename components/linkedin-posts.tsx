"use client";

import { useState } from "react";
import { identity } from "@/lib/content";
import { BrandIcon } from "./brand-icon";
import { ArrowUpRight } from "./icons";

/** Turns any LinkedIn post URL (share link or embed src) into its official embed URL. */
export function linkedinEmbedUrl(url: string): string | null {
  const urn = url.match(/urn:li:(activity|share|ugcPost):(\d+)/);
  if (urn) return `https://www.linkedin.com/embed/feed/update/urn:li:${urn[1]}:${urn[2]}`;
  const act = url.match(/activity[-:](\d{10,})/);
  if (act) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${act[1]}`;
  return null;
}

function Post({ src, n }: { src: string; n: number }) {
  const [on, setOn] = useState(false);
  return (
    <li className="w-[min(86vw,420px)] shrink-0 snap-start overflow-hidden rounded-[14px] border border-line bg-white">
      {on ? (
        <iframe src={src} title={`LinkedIn post ${n}`} loading="lazy" className="h-[560px] w-full border-0" />
      ) : (
        <button
          type="button"
          onClick={() => setOn(true)}
          className="group grid h-[560px] w-full place-items-center bg-raised text-center"
        >
          <span>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#0A66C2] text-white transition-transform duration-150 group-hover:scale-110">
              <BrandIcon slug="linkedin" size={20} tint={false} />
            </span>
            <span className="mt-3 block text-[14px] font-medium text-fg">Load post {n}</span>
            <span className="mt-1 block font-mono text-[11px] text-faint">from linkedin.com</span>
          </span>
        </button>
      )}
    </li>
  );
}

export function LinkedinPosts({ posts }: { posts: string[] }) {
  const srcs = posts.map(linkedinEmbedUrl).filter((s): s is string => !!s);
  if (!srcs.length) {
    return (
      <a
        href={identity.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="spotlight group flex items-center justify-between gap-4 rounded-[14px] border border-line bg-raised p-5 transition-colors duration-150 hover:border-[#0A66C2]/60"
      >
        <span className="flex items-center gap-4">
          <span className="grid size-11 place-items-center rounded-[10px] bg-[#0A66C2] text-white">
            <BrandIcon slug="linkedin" size={20} tint={false} />
          </span>
          <span>
            <span className="block text-[16px] font-medium text-fg">Posts on LinkedIn</span>
            <span className="block text-[13px] text-muted">Follow his updates and posts.</span>
          </span>
        </span>
        <ArrowUpRight size={16} className="shrink-0 text-faint transition-colors duration-150 group-hover:text-fg" />
      </a>
    );
  }
  return (
    <ul className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
      {srcs.map((src, i) => (
        <Post key={src} src={src} n={i + 1} />
      ))}
    </ul>
  );
}
