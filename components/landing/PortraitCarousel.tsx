"use client";

import SocialCards, { type CardItem } from "@/components/ui/card-fan-carousel";

/* Portrait (phone-layout) slides from "Birds: Masters of Survival". */
const CARDS: CardItem[] = [
  { imgUrl: "/carousel/1_intro.webp", alt: "Title slide" },
  { imgUrl: "/carousel/2_agenda.webp", alt: "Agenda slide" },
  { imgUrl: "/carousel/3_image_explore.webp", alt: "Image Explore slide" },
  { imgUrl: "/carousel/4_flip_card.webp", alt: "Flip Cards slide" },
  { imgUrl: "/carousel/5_content-image.webp", alt: "Image + Content slide" },
  { imgUrl: "/carousel/6_feature-matrix.webp", alt: "Feature Matrix slide" },
  { imgUrl: "/carousel/7_mcq.webp", alt: "Quiz / MCQ slide" },
  { imgUrl: "/carousel/8_true_false.webp", alt: "True / False slide" },
  { imgUrl: "/carousel/9_image_overlay.webp", alt: "Image Overlay slide" },
  { imgUrl: "/carousel/10_sticky_scroll.webp", alt: "Sticky Scroll slide" },
  { imgUrl: "/carousel/11_insight_slide.webp", alt: "Insight Cards slide" },
  { imgUrl: "/carousel/12_accordion_slide.webp", alt: "Accordion slide" },
  { imgUrl: "/carousel/13_content-image.webp", alt: "Image + Content slide" },
  { imgUrl: "/carousel/14_fill_the_blanks.webp", alt: "Fill in the Blanks slide" },
  { imgUrl: "/carousel/15_key_features.webp", alt: "Key Points slide" },
  { imgUrl: "/carousel/16_sticky_slide.webp", alt: "Sticky Slide" },
  { imgUrl: "/carousel/17_image_match.webp", alt: "Image Match slide" },
  { imgUrl: "/carousel/18_compare_side_by_side.webp", alt: "Side by Side slide" },
  { imgUrl: "/carousel/19_scenario.webp", alt: "Scenario Challenge slide" },
  { imgUrl: "/carousel/20_pros_cons.webp", alt: "Pros & Cons slide" },
  { imgUrl: "/carousel/21_big_statement.webp", alt: "Big Statement slide" },
];

export default function PortraitCarousel() {
  return (
    <section className="portrait-carousel">
      <div className="container">
        <span className="section-label reveal">Explore Learnbee</span>
        <h2 className="reveal reveal-d1">Every Slide You Need to Build Engaging Learning</h2>
        <p className="section-sub reveal reveal-d2">
          From immersive visuals to interactive moments, create courses that feel
          made for the way people learn today.
        </p>
      </div>
      <SocialCards cards={CARDS} />
    </section>
  );
}
