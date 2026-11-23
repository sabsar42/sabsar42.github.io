import { identity } from "@/lib/content";
import { PhotoDoor } from "./photo-door";

export function Hero() {
  return (
    <header id="top" suppressHydrationWarning className="relative flex justify-center pb-16 pt-20 md:pb-24 md:pt-28">
      <div aria-hidden="true" className="hero-horizon" />
      <h1 className="sr-only">
        {identity.name}, {identity.shortTitle}. {identity.statement}
      </h1>
      <PhotoDoor />
    </header>
  );
}
