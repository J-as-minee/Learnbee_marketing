import BgMorph from "@/components/landing/BgMorph";
import SiteNav from "@/components/landing/SiteNav";
import Hero from "@/components/landing/Hero";
import HomeQuickCreate from "@/components/landing/HomeQuickCreate";
import DemoSection from "@/components/landing/DemoSection";
import WhyNotChatGPT from "@/components/landing/WhyNotChatGPT";
import ValueSection from "@/components/landing/ValueSection";
import PortraitCarousel from "@/components/landing/PortraitCarousel";
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
        <HomeQuickCreate />
        <PortraitCarousel />
        <DemoSection />
        <WhyNotChatGPT />
        <ValueSection />
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
