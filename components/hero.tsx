import { identity } from "@/lib/content";
import { PhotoDoor } from "./photo-door";

export function Hero() {
  return (
    <header id="top" suppressHydrationWarning className="relative h-svh min-h-[440px] overflow-hidden">
      <div aria-hidden="true" className="hero-horizon" />
      <h1 className="sr-only">
        {identity.name}, {identity.shortTitle}. {identity.statement}
      </h1>
      <PhotoDoor />
    </header>
  );
}
