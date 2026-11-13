import { BRAND_ICONS, type BrandSlug } from "@/lib/brand-icons";

/** Hex colors too dark to read on the black theme fall back to the text color. */
function readable(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 70;
}

export function BrandIcon({
  slug,
  size = 16,
  tint = true,
  className = "",
}: {
  slug: BrandSlug;
  size?: number;
  /** Use the brand's own color (when it reads on dark); otherwise currentColor. */
  tint?: boolean;
  className?: string;
}) {
  const icon = BRAND_ICONS[slug];
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={tint && readable(icon.hex) ? { color: icon.hex } : undefined}
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

/** Stack/skill names that have a real brand icon. Everything else gets a small brand diamond. */
export const SKILL_ICON: Record<string, BrandSlug> = {
  LangGraph: "langgraph",
  LangChain: "langchain",
  MCP: "modelcontextprotocol",
  "Claude Code": "claude",
  PyTorch: "pytorch",
  TensorFlow: "tensorflow",
  "HuggingFace Transformers": "huggingface",
  "HF Transformers": "huggingface",
  "scikit-learn": "scikitlearn",
  OpenCV: "opencv",
  Python: "python",
  TypeScript: "typescript",
  FastAPI: "fastapi",
  "Node.js": "nodedotjs",
  "Next.js": "nextdotjs",
  Supabase: "supabase",
  Docker: "docker",
  Vercel: "vercel",
  "Vercel Cron": "vercel",
  Flutter: "flutter",
  Gemini: "googlegemini",
  Resend: "resend",
  "Tailwind CSS": "tailwindcss",
  React: "react",
};

export function SkillMark({ name, size = 14, className = "" }: { name: string; size?: number; className?: string }) {
  const slug = SKILL_ICON[name];
  if (slug) return <BrandIcon slug={slug} size={size} className={className} />;
  return (
    <span aria-hidden="true" className={`inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <span className="size-[42%] rotate-45 rounded-[1.5px] bg-grad" />
    </span>
  );
}
