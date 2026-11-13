import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { identity } from "./content";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${identity.name}, ${identity.shortTitle}`;

/** Minimal OG card: small circular photo, name, title. */
export async function renderOg() {
  const photo = await readFile(join(process.cwd(), "public", "me.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#ededed",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={112} height={112} alt="" style={{ borderRadius: 9999, objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{identity.name}</div>
          <div style={{ fontSize: 30, color: "#a1a1a1", marginTop: 18 }}>{identity.title}</div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 22, color: "#8a8a8a", marginTop: 40 }}>
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: "#3fd37a", marginRight: 14 }} />
            Ask my agent about my work
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
