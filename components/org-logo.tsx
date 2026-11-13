import Image from "next/image";

export type OrgMark = { src?: string; alt: string; monogram?: string };

/** An institution's official logo on a light tile (logos are made for white backgrounds). */
export function OrgLogo({ mark, size = 36, className = "" }: { mark: OrgMark; size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[9px] bg-white ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size }}
      title={mark.alt}
    >
      {mark.src ? (
        <Image src={mark.src} alt={mark.alt} width={size * 2} height={size * 2} className="size-[78%] object-contain" />
      ) : (
        <span className="font-mono text-[11px] font-semibold tracking-tight text-neutral-800" aria-label={mark.alt}>
          {mark.monogram}
        </span>
      )}
    </span>
  );
}

export function OrgLogos({ marks, size = 36 }: { marks: OrgMark[]; size?: number }) {
  return (
    <span className="flex shrink-0 -space-x-2">
      {marks.map((m) => (
        <OrgLogo key={m.alt} mark={m} size={size} className="ring-2 ring-bg" />
      ))}
    </span>
  );
}
