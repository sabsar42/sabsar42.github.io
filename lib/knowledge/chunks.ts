import {
  awards,
  education,
  formatRange,
  identity,
  leadership,
  news,
  projects,
  publications,
  roles,
  sectionLabels,
  stack,
  type Domain,
  type SectionId,
} from "../content";

/**
 * The agent's knowledge base: content.ts flattened into small, self-contained chunks.
 * Each chunk links back to a DOM id on the page so the trace can point at it.
 */
export type Chunk = {
  id: string;
  section: SectionId;
  /** DOM id to scroll to. */
  target: string;
  /** Short label for the source chip, e.g. "Experience · Fadlun". */
  label: string;
  text: string;
  /** Color used for this source in the agent UI. */
  domain: Domain;
};

/** Chip-sized title: text before a colon, cut at a word boundary. */
function short(title: string, max = 34): string {
  const head = title.split(":")[0].trim();
  if (head.length <= max) return head;
  const cut = head.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function build(): Omit<Chunk, "domain">[] {
  const chunks: Omit<Chunk, "domain">[] = [];

  chunks.push({
    id: "identity",
    section: "about",
    target: "about",
    label: sectionLabels.about,
    text: [
      `${identity.name}. Title: ${identity.title}.`,
      `Based in ${identity.location} (${identity.timezone.label}).`,
      `Summary: ${identity.summary}`,
      `Mission statement: ${identity.statement}`,
      `Availability: ${identity.availability}.`,
      `Currently (now): ${identity.now}`,
      `Research interests: ${identity.interests.join(", ")}.`,
      `Contact email: ${identity.email}.`,
    ].join("\n"),
  });

  chunks.push({
    id: "contact",
    section: "contact",
    target: "contact",
    label: sectionLabels.contact,
    text: [
      `How to contact ${identity.name}: email ${identity.email} (best way to reach him).`,
      `GitHub: ${identity.links.github}`,
      `Google Scholar: ${identity.links.scholar}`,
      `LinkedIn: ${identity.links.linkedin}`,
      `Kaggle: ${identity.links.kaggle}`,
      `Academic site: ${identity.links.academic}`,
      `Availability: ${identity.availability}.`,
    ].join("\n"),
  });

  for (const r of roles) {
    chunks.push({
      id: `role-${r.id}`,
      section: "experience",
      target: `exp-${r.id}`,
      label: `${sectionLabels.experience} · ${r.org.replace(/ Ltd\..*$/, "").replace(/\s*\(.*\)$/, "")}`,
      text: [
        `${r.kind === "research" ? "Research experience" : "Work experience"}: ${r.title} at ${r.org}, ${r.location}, ${formatRange(r.start, r.end)}.`,
        ...r.details.map((d) => `- ${d}`),
      ].join("\n"),
    });
  }

  chunks.push({
    id: "education",
    section: "experience",
    target: "exp-education",
    label: "Education",
    text: `Education: ${education.degree}, ${education.school}, ${education.location}, ${formatRange(education.start, education.end)}. CGPA ${education.cgpa}. Thesis: ${education.thesis}`,
  });

  for (const p of projects) {
    chunks.push({
      id: `project-${p.id}`,
      section: "work",
      target: `work-${p.id}`,
      label: `${sectionLabels.work} · ${p.name}`,
      text: [
        `Project: ${p.name}. ${p.outcome}`,
        ...p.details.map((d) => `- ${d}`),
        `Stack: ${p.stack.join(", ")}.`,
        ...p.links.map((l) => `${l.label}: ${l.href}`),
      ].join("\n"),
    });
  }

  for (const pub of publications) {
    chunks.push({
      id: `pub-${pub.id}`,
      section: "research",
      // Only featured papers have their own card on the page; the rest link to the section.
      target: pub.featured ? `pub-${pub.id}` : "research",
      label: `${sectionLabels.research} · ${short(pub.title)}`,
      text: [
        `Research publication (${pub.status}): "${pub.title}".`,
        `Venue: ${pub.venue}${pub.year ? `, ${pub.year}` : ""}.`,
        pub.authors ? `Authors: ${pub.authors}.` : "",
        pub.role ? `Shakib's role: ${pub.role}.` : "",
        `Areas: ${pub.areas.join(", ")}.`,
        ...pub.links.map((l) => `${l.label}: ${l.href}`),
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  const counts = {
    published: publications.filter((p) => p.status === "published").length,
    accepted: publications.filter((p) => p.status === "accepted").length,
    review: publications.filter((p) => p.status === "under review").length,
  };
  chunks.push({
    id: "pub-overview",
    section: "research",
    target: "research",
    label: sectionLabels.research,
    text: `Research publications overview: ${publications.length} papers in total (${counts.published} published, ${counts.accepted} accepted, ${counts.review} under review), across medical imaging, computer vision, agentic AI and LLMs, and datasets. Google Scholar: ${identity.links.scholar}`,
  });

  for (const g of stack) {
    chunks.push({
      id: `stack-${g.name}`,
      section: "stack",
      target: "stack",
      label: `${sectionLabels.stack} · ${g.name}`,
      text: `Technical skills and stack, ${g.name}: ${g.items.map((i) => i.name).join(", ")}.`,
    });
  }

  chunks.push({
    id: "awards",
    section: "recognition",
    target: "recognition",
    label: `${sectionLabels.recognition} · Awards`,
    text: ["Awards, honors and competition results (the complete list):", ...awards.map((a) => `- ${a.year}: ${a.text}`)].join("\n"),
  });

  chunks.push({
    id: "leadership",
    section: "recognition",
    target: "recognition",
    label: `${sectionLabels.recognition} · Leadership`,
    text: ["Leadership, teaching and mentoring:", ...leadership.map((l) => `- ${l.text}${l.year !== "—" ? ` (${l.year})` : ""}`)].join("\n"),
  });

  for (const n of news) {
    chunks.push({
      id: `news-${n.id}`,
      section: "news",
      target: `news-${n.id}`,
      label: `${sectionLabels.news} · ${n.title.length > 34 ? `${n.title.slice(0, 33)}…` : n.title}`,
      text: `News (${n.date}${n.place ? `, ${n.place}` : ""}): ${n.title}. ${n.text}`,
    });
  }

  return chunks;
}

const roleKind = new Map(roles.map((r) => [`role-${r.id}`, r.kind]));
const projectDomain = new Map(projects.map((p) => [`project-${p.id}`, p.domain]));

function domainOf(c: Omit<Chunk, "domain">): Domain {
  if (c.id === "identity") return "agent";
  if (c.id === "contact") return "ship";
  if (c.id === "education" || c.section === "recognition") return "data";
  if (c.section === "research") return "research";
  if (c.section === "news") return "agent";
  if (c.section === "stack") return "vision";
  if (roleKind.has(c.id)) return roleKind.get(c.id) === "research" ? "research" : "ship";
  return projectDomain.get(c.id) ?? "agent";
}

export const chunks: Chunk[] = build().map((c) => ({ ...c, domain: domainOf(c) }));
export const chunkById = new Map(chunks.map((c) => [c.id, c]));
