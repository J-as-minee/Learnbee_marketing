import type { Metadata } from "next";
import "../site.css";
import "../help.css";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import HelpChat from "@/components/landing/HelpChat";
import HelpHeroBg from "@/components/landing/HelpHeroBg";

export const metadata: Metadata = {
  title: "Help Centre — Learnbee",
  description: "Answers to common questions about Learnbee, plus an AI assistant ready to help.",
};

const WIKI: {
  id: string;
  title: string;
  icon: string;
  items: { q: string; a: string }[];
}[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "rocket",
    items: [
      {
        q: "Do I need an account to create courses?",
        a: "Yes — you need to sign in to create, edit, publish, or manage courses. Learners taking a published course via a link or access code do not need an account.",
      },
      {
        q: "What are the main areas of the app?",
        a: "Home (start a course, recent work, enter an access code), Courses (your full list), Library (ready-made courses to browse and clone), Course Wizard (guided new-course creation), Editor (build and edit slides), Translate (copy and translate a course), and Player/Preview (play as a learner).",
      },
      {
        q: "Does Learnbee auto-save my work?",
        a: "Yes — the editor saves continuously as you type. There is no manual save button.",
      },
      {
        q: "How do collaborators access a shared course?",
        a: "They receive an email with a join link. When they sign in they are added to the course with the role you chose. Up to 6 collaborators per course.",
      },
    ],
  },
  {
    id: "course-wizard",
    title: "Course Wizard",
    icon: "wand",
    items: [
      {
        q: "How do I create a new course?",
        a: "Click New to open the 6-step Course Wizard — Basics, Content, Media, Structure, Quiz, Review — then click Generate. The AI builds the full outline and drops you into the editor.",
      },
      {
        q: "Can I change the course language after creating it?",
        a: "No — the language is permanent once set. To get the same course in another language, use Translate to create a linked copy.",
      },
      {
        q: "What reference content can I provide?",
        a: "In step 2 (Content) you can paste text, upload reference PDFs, or enable web search so the AI can pull in current information.",
      },
      {
        q: "What does content depth mean?",
        a: "In step 4 (Structure) you choose Overview, Standard, or Deep. This controls how much detail the AI generates per slide.",
      },
      {
        q: "How do I control how many quizzes are added?",
        a: "In step 5 (Quiz) you set the quiz count, difficulty (Basic / Intermediate / Advanced), and whether quizzes appear at the end of each module or only at the end of the course.",
      },
    ],
  },
  {
    id: "slide-formats",
    title: "Slide Formats",
    icon: "layers",
    items: [
      {
        q: "How many slide formats are there?",
        a: "24 formats across 4 categories: Narrative (Title Slide, Agenda, Big Statement), Content (Key Points, Insight Cards, Image + Content, Image Overlay, PDF Viewer, Step by Step, Accordion, Sticky Scroll, Sticky Slide), Comparison (Side by Side, Feature Matrix, Pros & Cons), and Interactive (Scenario Challenge, Quiz/MCQ, True/False, Flip Cards, Image Explore, Image Match, Fill in the Blanks).",
      },
      {
        q: "Which formats are gated?",
        a: "Step by Step, Accordion, Sticky Scroll, Sticky Slide, Scenario Challenge, Quiz/MCQ, True/False, Flip Cards, Image Explore, Image Match, and Fill in the Blanks are gated — learners must complete them before proceeding.",
      },
      {
        q: "Is there a separate video format?",
        a: "No — video is a mode of the Big Statement slide. Open a Big Statement slide, switch it to video mode, then upload a file or paste a YouTube link.",
      },
      {
        q: "Can I embed a PDF inside a course?",
        a: "Yes — add a PDF Viewer slide and choose a PDF from your Course PDFs library or upload one directly.",
      },
    ],
  },
  {
    id: "narration",
    title: "Narration & Voices",
    icon: "mic",
    items: [
      {
        q: "How do I add voice narration to my course?",
        a: "Open the Narration drawer on any slide, generate or edit the script, and choose a voice. Narration is AI-generated in the course language.",
      },
      {
        q: "What voices are available?",
        a: "Female or male per course, set in wizard step 1. You can override the voice per segment in the Narration drawer and preview a voice before choosing.",
      },
      {
        q: "Does narration cost anything for learners?",
        a: "No — narration audio is generated once by the creator and plays free for every learner on every playthrough.",
      },
      {
        q: "What is click mode?",
        a: "Click mode lets learners click each element to hear its narration one segment at a time, instead of narration auto-playing through the whole slide.",
      },
      {
        q: "What is auto-advance?",
        a: "When narration finishes on a slide, auto-advance moves the learner to the next slide automatically after a short, cancellable countdown.",
      },
      {
        q: "Why is there no narration on my video slide?",
        a: "Narration is disabled on video slides by design — the video provides its own audio track.",
      },
    ],
  },
  {
    id: "images-media",
    title: "Images & Media",
    icon: "image",
    items: [
      {
        q: "How do I add an image to a slide?",
        a: "Open the Image Picker on any image slide. You can search Pexels for free stock photos, pick From Course (images already on this course), browse All Images (your full library), Upload your own file, or import From Link.",
      },
      {
        q: "What is Cover vs Contain?",
        a: "Cover fills the image area and may crop the edges. Contain shows the full image with a soft blurred backdrop. Available on Big Statement, Title Slide, Image Overlay, Image + Content, Key Points, Flip Cards, Fill in the Blanks, and Quiz/MCQ.",
      },
      {
        q: "How do I add a video?",
        a: "Use a Big Statement slide in video mode. Uploaded files must be MP4 or WebM, up to 25 MB each, with a maximum of 6 uploaded videos per course. YouTube links are unlimited and do not count toward the cap.",
      },
      {
        q: "Why can't I import an image from a URL?",
        a: "The source site may block external access, the file may be too large, or the URL may not point directly to an image. Download the image and use the Upload tab instead.",
      },
    ],
  },
  {
    id: "publishing",
    title: "Publishing & Sharing",
    icon: "link",
    items: [
      {
        q: "How do I publish a course?",
        a: "Open the Publish dialog from the editor. You will get a 6-character access code, a shareable link, a downloadable QR code, and an embed code for websites.",
      },
      {
        q: "Do learners need an account to take a course?",
        a: "No — learners open a published course via the share link or by entering the access code on the home screen. No sign-in required.",
      },
      {
        q: "Does re-publishing change the link or access code?",
        a: "No — re-publishing keeps the same code and link and updates the content in place.",
      },
      {
        q: "How do I embed a course on a website?",
        a: "Copy the embed code (an iframe) from the Publish dialog and paste it into your site HTML.",
      },
    ],
  },
  {
    id: "scorm",
    title: "SCORM Export",
    icon: "package",
    items: [
      {
        q: "How do I export a course to SCORM?",
        a: "Use the Export SCORM action — no need to publish first. It downloads a .zip file. Upload that to your LMS as a SCORM 1.2 course.",
      },
      {
        q: "How long does SCORM packaging take?",
        a: "About 30 to 40 seconds. A Packaging spinner shows while it builds. Do not click Export again during this time.",
      },
      {
        q: "Is the SCORM package self-contained?",
        a: "Yes — images, audio, and video are all bundled inside the zip. It does not rely on external hosting once downloaded.",
      },
      {
        q: "What does the SCORM package track in my LMS?",
        a: "Completion status, quiz score, session time, and resume location.",
      },
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    icon: "users",
    items: [
      {
        q: "How do I invite someone to collaborate on a course?",
        a: "Invite by email from inside the course. They receive a join link; when they sign in they are added with the role you chose. A course can have up to 6 collaborators.",
      },
      {
        q: "What roles are available?",
        a: "Owner, Admin, Editor, Reviewer, and Viewer. Owners and Admins can invite others. Editors can edit content and settings. Reviewers can comment but not edit. Viewers can only read.",
      },
      {
        q: "How do review comments work?",
        a: "Leave a comment on the whole course or on a specific slide. Anyone on the course can reply. To remove a comment, delete it — deleting the root comment also removes all replies.",
      },
      {
        q: "Can AI apply a reviewer's suggested change?",
        a: "Yes — from any comment thread, an author can ask AI to apply the requested change to that slide, and can revert it if needed.",
      },
    ],
  },
  {
    id: "translate",
    title: "Translate",
    icon: "globe",
    items: [
      {
        q: "How do I translate a course into another language?",
        a: "Open the course, choose Translate, and pick a target language. Learnbee creates a linked copy of the course in the new language, including translated narration.",
      },
      {
        q: "Does translating change the original course?",
        a: "No — translation creates a new linked copy. The original stays exactly as it is.",
      },
      {
        q: "How many languages does Learnbee support?",
        a: "15 languages: English, 9 Indian languages (Hindi, Marathi, Gujarati, Bengali, Punjabi, Tamil, Kannada, Telugu, Malayalam), and 5 via OpenAI (Spanish, French, Portuguese, German, Japanese).",
      },
      {
        q: "Can I change a course language without using Translate?",
        a: "No — the language is set permanently at creation. Use Translate to get a version in a different language.",
      },
    ],
  },
];

const ICON_MAP: Record<string, string> = {
  rocket:  "M13 2L4.5 13.5H11l-1 8.5L19.5 10H13V2z",
  wand:    "M15 4V2m0 14v-2M8 9H2m14 0h-2m-1.5-4.5L11 6m3 7-1.5-1.5M5 3l1.5 1.5M19 3l-1.5 1.5M5 21l1.5-1.5",
  layers:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  mic:     "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8",
  image:   "M21 15l-5-5L5 21M21 15v6H3V3h18v12zM8.5 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  link:    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  package: "M16.5 9.4L7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  globe:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
};

export default function HelpPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="help-hero">
        <HelpHeroBg />
        <div className="help-inner">
          <span className="section-label on-dark">Help Centre</span>
          <h1>
            Got a question?{" "}
            <span className="accent">We&apos;ve got answers.</span>
          </h1>
          <p className="help-body">
            Ask the AI assistant below or browse the help topics.
          </p>
          <div className="help-hero-chat">
            <HelpChat />
          </div>
        </div>
      </section>

      {/* Wiki */}
      <section className="help-wiki-section">
        <div className="container">
          <div className="help-wiki-header">
            <span className="section-label">HELP TOPICS</span>
            <h2 className="help-wiki-headline">Browse by topic</h2>
          </div>

          <div className="help-wiki-grid">
            {WIKI.map((cat) => (
              <div key={cat.id} className="help-wiki-card">
                <div className="help-wiki-card-head">
                  <span className="help-wiki-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICON_MAP[cat.icon]} />
                    </svg>
                  </span>
                  <h3 className="help-wiki-title">{cat.title}</h3>
                </div>
                <div className="help-wiki-items">
                  {cat.items.map((item, i) => (
                    <details key={i} className="help-wiki-detail">
                      <summary className="help-wiki-q">{item.q}</summary>
                      <p className="help-wiki-a">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still stuck */}
      <section className="help-contact-band">
        <div className="container help-contact-inner">
          <div>
            <h3 className="help-contact-title">Still need help?</h3>
            <p className="help-contact-sub">
              Our team usually replies within a few hours. Email us at{" "}
              <a href="mailto:admin@learnbee.ai">admin@learnbee.ai</a>.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
