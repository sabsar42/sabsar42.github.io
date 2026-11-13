import { Suspense } from "react";
import { AgentGraph } from "@/components/agent-graph";
import { AnimationGate } from "@/components/animation-gate";
import { CaseStudies } from "@/components/case-studies";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { FounderBrief } from "@/components/founder-brief";
import { Elsewhere } from "@/components/elsewhere";
import { GithubActivity } from "@/components/github-activity";
import { News } from "@/components/news";
import { Spotlight } from "@/components/spotlight";
import { Hero } from "@/components/hero";
import { Intro } from "@/components/intro";
import { Impact } from "@/components/impact";
import { Recognition } from "@/components/recognition";
import { Research } from "@/components/research";
import { RevealObserver } from "@/components/reveal-observer";
import { SelectedWork } from "@/components/selected-work";
import { ShipLog } from "@/components/ship-log";
import { Stack } from "@/components/stack";
import { IslandNav } from "@/components/island-nav";

/*
 * Each below-the-fold block sits in its own Suspense boundary. The HTML is fully static either way,
 * but React can then hydrate the blocks as separate, interruptible units instead of one long task.
 */
export default function Home() {
  return (
    <>
      <IslandNav />
      <Hero />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={null}>
          <Intro />
        </Suspense>
        <Suspense fallback={null}>
          <FounderBrief />
        </Suspense>
        <Suspense fallback={null}>
          <Impact />
        </Suspense>
        <Suspense fallback={null}>
          <CaseStudies />
        </Suspense>
        <Suspense fallback={null}>
          <News />
        </Suspense>
        <ShipLog />
        <Suspense fallback={null}>
          <AgentGraph />
        </Suspense>
        <Suspense fallback={null}>
          <SelectedWork />
        </Suspense>
        <Suspense fallback={null}>
          <GithubActivity />
        </Suspense>
        <Suspense fallback={null}>
          <Research />
        </Suspense>
        <Stack />
        <Recognition />
        <Suspense fallback={null}>
          <Elsewhere />
        </Suspense>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <RevealObserver />
      <Spotlight />
      <AnimationGate />
    </>
  );
}
