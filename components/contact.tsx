import { identity } from "@/lib/content";
import { CopyEmail } from "./copy-email";
import { ArrowUpRight, FileIcon } from "./icons";
import { Section } from "./section";
import { OpenChannel } from "./open-channel";
import { Terminal } from "./terminal";

const links = [
  { label: "GitHub", href: identity.links.github, color: "hover:text-fg hover:border-fg/40" },
  { label: "Google Scholar", href: identity.links.scholar, color: "hover:text-vision hover:border-vision/50" },
  { label: "LinkedIn", href: identity.links.linkedin, color: "hover:text-vision hover:border-vision/50" },
  { label: "Kaggle", href: identity.links.kaggle, color: "hover:text-data hover:border-data/50" },
  { label: "Academic site", href: identity.links.academic, color: "hover:text-research hover:border-research/50" },
];

export function Contact() {
  return (
    <Section id="contact" index="13" label="Contact" wide>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <div className="reveal">
          <p className="flex items-center gap-2 text-lead text-ship">
            <span aria-hidden="true" className="live-dot relative size-1.5 shrink-0 rounded-full bg-ship" />
            {identity.availability}.
          </p>
          <p className="mt-1 text-lead text-muted">The fastest way to reach me:</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
            <p className="min-w-0 break-all font-mono text-title tracking-[-0.03em]">
              <span className="select-none text-ship" aria-hidden="true">
                {"> "}
              </span>
              <a href={`mailto:${identity.email}`} className="link-underline text-fg">
                {identity.email}
              </a>
            </p>
            <CopyEmail email={identity.email} />
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-small text-muted transition-colors duration-150 ${l.color}`}
                >
                  {l.label}
                  <ArrowUpRight size={14} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
            {identity.cvPath && (
              <li>
                <a
                  href={identity.cvPath}
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ship/50 bg-ship/10 px-4 text-small text-ship transition-colors duration-150 hover:bg-ship/20"
                >
                  <FileIcon size={14} />
                  Download CV
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="reveal space-y-4" style={{ "--i": 1 } as React.CSSProperties}>
          {/* On large screens the Open Channel sits beside the intro instead. */}
          <OpenChannel idPrefix="contact" className="lg:hidden" />
          <Terminal />
        </div>
      </div>
    </Section>
  );
}
