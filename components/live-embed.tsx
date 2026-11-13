"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Domain, Embed } from "@/lib/content";
import { dom } from "@/lib/domain";
import { ArrowUpRight } from "./icons";

const DESKTOP_W = 1280;

function host(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`embed-spin inline-block size-5 rounded-full border-2 border-line-strong border-t-transparent ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* A live site in a browser frame                                      */
/* ------------------------------------------------------------------ */

function SiteEmbed({ url, poster, name, domain }: { url: string; poster: string; name: string; domain: Domain }) {
  const d = dom[domain];
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Render the real desktop layout (1280px wide) and scale it down to fit the frame.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = device === "desktop" && box.w ? box.w / DESKTOP_W : 1;

  const reload = () => {
    setReady(false);
    setNonce((n) => n + 1);
  };

  return (
    <figure className="overflow-hidden rounded-[14px] border border-line-strong bg-raised">
      <div className="flex h-10 items-center gap-2 border-b border-line px-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-agent/80" />
          <span className="size-2.5 rounded-full bg-data/80" />
          <span className="size-2.5 rounded-full bg-ship/80" />
        </span>
        <div className="mx-1 flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-full bg-bg px-3 font-mono text-[11.5px] text-muted">
          <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${loaded ? "live-dot relative bg-live" : "bg-line-strong"}`} />
          <span className="truncate">{host(url)}</span>
        </div>
        <div role="group" aria-label="Viewport" className="hidden rounded-full border border-line p-0.5 sm:flex">
          {(["desktop", "mobile"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={device === v}
              onClick={() => setDevice(v)}
              className={`h-5 rounded-full px-2 font-mono text-[10.5px] transition-colors duration-150 ${
                device === v ? `${d.soft} ${d.text}` : "text-faint hover:text-fg"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {loaded && (
          <button
            type="button"
            onClick={reload}
            className="hidden h-6 rounded-full px-2 font-mono text-[10.5px] text-faint transition-colors duration-150 hover:bg-hover hover:text-fg sm:inline-flex sm:items-center"
          >
            reload
          </button>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-6 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-hover hover:text-fg"
          aria-label={`Open ${name} in a new tab`}
        >
          <ArrowUpRight size={14} />
        </a>
      </div>

      <div ref={boxRef} className="relative aspect-[16/11] overflow-hidden bg-bg sm:aspect-[16/10]">
        {!loaded ? (
          <>
            <Image
              src={poster}
              alt={`${name} home page`}
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg/55">
              <button
                type="button"
                onClick={() => setLoaded(true)}
                className={`group inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-medium text-bg shadow-lg transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] motion-reduce:transform-none ${d.bg}`}
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-bg/90" />
                Run the live app here
              </button>
              <span className="rounded-full bg-raised/90 px-2.5 py-0.5 font-mono text-[11px] text-muted">
                the real product, inside this page
              </span>
            </div>
          </>
        ) : (
          <>
            {!ready && (
              <div className="absolute inset-0 grid place-items-center">
                <Spinner />
              </div>
            )}
            {device === "desktop" ? (
              <iframe
                key={`d${nonce}`}
                src={url}
                title={`${name}, live`}
                onLoad={() => setReady(true)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                allow="microphone; camera; clipboard-write"
                className={`absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
                style={{ width: DESKTOP_W, height: box.h / (scale || 1), transform: `scale(${scale})` }}
              />
            ) : (
              <iframe
                key={`m${nonce}`}
                src={url}
                title={`${name}, live (mobile)`}
                onLoad={() => setReady(true)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                allow="microphone; camera; clipboard-write"
                className={`absolute left-1/2 top-0 h-full w-[390px] max-w-full -translate-x-1/2 border-x border-line border-y-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 font-mono text-[11px] text-faint">
        <span>{loaded ? "live · scroll and click inside the frame" : "screenshot · click to run the live app"}</span>
        <span className={d.text}>{host(url)}</span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* A mobile web app in a phone                                         */
/* ------------------------------------------------------------------ */

function PhoneEmbed({
  url,
  poster,
  name,
  domain,
  framable,
}: {
  url: string;
  poster: string;
  name: string;
  domain: Domain;
  framable: boolean;
}) {
  const d = dom[domain];
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col items-center gap-8 rounded-[14px] border border-line bg-raised px-6 py-8 sm:flex-row sm:items-center sm:justify-center sm:gap-12">
      <div className="relative w-[230px] shrink-0 rounded-[42px] bg-[#0b0b0c] p-[9px] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)] ring-1 ring-line-strong">
        <div className="relative aspect-[390/844] overflow-hidden rounded-[34px] bg-bg">
          {framable && loaded ? (
            <iframe src={url} title={`${name}, live`} className="absolute inset-0 size-full border-0" />
          ) : (
            <Image src={poster} alt={`${name} on a phone`} fill sizes="212px" className="object-cover object-top" />
          )}
          <span aria-hidden="true" className="absolute left-1/2 top-2 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-[#0b0b0c]" />
        </div>
      </div>

      <div className="max-w-[300px] text-center sm:text-left">
        <p className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 font-mono text-[11px] ${d.soft} ${d.text}`}>
          <span aria-hidden="true" className="live-dot relative size-1.5 rounded-full bg-live" />
          live on the web
        </p>
        <p className="mt-3 text-[20px] font-medium tracking-[-0.01em] text-fg">{name}</p>
        <p className="mt-1 text-small text-muted">Say it once, keep it forever: talk it out, and it becomes a readable journal entry.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
          {framable ? (
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-bg ${d.bg}`}
            >
              Run it here
            </button>
          ) : null}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-transform duration-150 hover:scale-[1.03] motion-reduce:transform-none ${
              framable ? `border ${d.border} ${d.text}` : `${d.bg} text-bg`
            }`}
          >
            Try {name} live
            <ArrowUpRight size={15} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="mt-3 font-mono text-[11px] text-faint">{host(url)}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A video demo                                                        */
/* ------------------------------------------------------------------ */

export function VideoEmbed({ youtubeId, poster, name, domain }: { youtubeId: string; poster: string; name: string; domain: Domain }) {
  const d = dom[domain];
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="overflow-hidden rounded-[14px] border border-line-strong bg-raised">
      <div className="relative aspect-video bg-bg">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={`${name} demo video`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 block size-full">
            <Image src={poster} alt="" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-bg/20 transition-colors duration-150 group-hover:bg-bg/5" />
            <span
              className={`absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-bg shadow-xl transition-transform duration-150 group-hover:scale-110 motion-reduce:transform-none ${d.bg}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            </span>
            <span className="sr-only">Play the {name} demo video</span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 font-mono text-[11px] text-faint">
        <span>demo video · the real app</span>
        <span className={d.text}>youtube</span>
      </figcaption>
    </figure>
  );
}

export function LiveEmbed({ embed, name, domain }: { embed: Embed; name: string; domain: Domain }) {
  if (embed.kind === "site") return <SiteEmbed url={embed.url} poster={embed.poster} name={name} domain={domain} />;
  if (embed.kind === "phone")
    return <PhoneEmbed url={embed.url} poster={embed.poster} name={name} domain={domain} framable={embed.framable} />;
  return <VideoEmbed youtubeId={embed.youtubeId} poster={embed.poster} name={name} domain={domain} />;
}
