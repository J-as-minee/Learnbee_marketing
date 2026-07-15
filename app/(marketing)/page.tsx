import BgMorph from "@/components/landing/BgMorph";
import SiteNav from "@/components/landing/SiteNav";
import Hero from "@/components/landing/Hero";
import DemoSection from "@/components/landing/DemoSection";
import ValueSection from "@/components/landing/ValueSection";
import ProcessSection from "@/components/landing/ProcessSection";
import CoursePreview from "@/components/landing/CoursePreview";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CourseLibrary from "@/components/landing/CourseLibrary";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import SiteFooter from "@/components/landing/SiteFooter";
import RevealObserver from "@/components/landing/RevealObserver";

export default function Home() {
  return (
    <>
      <BgMorph />
      <SiteNav />
      <main>
        <Hero />
        <DemoSection />
        <ValueSection />
        <ProcessSection />
        <CoursePreview />
        <FeaturesSection />
        <CourseLibrary />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  );
}
