import { identity } from "@/lib/content";
import { PhotoDoor } from "./photo-door";

export function Hero() {
  return (
    <header id="top" suppressHydrationWarning className="relative flex justify-center pb-6 pt-14 md:pb-8 md:pt-20">
      <div aria-hidden="true" className="hero-horizon" />
      <h1 className="sr-only">
        {identity.name}, {identity.shortTitle}. {identity.statement}
      </h1>
      <PhotoDoor />
    </header>
  );
}
