/**
 * Expand TipTap CTA placeholders into semantic HTML for blog rendering.
 * Variants are visually distinct: banner (tall full-width), card (narrow boxed), compact (short strip).
 */

import { visit } from "unist-util-visit";
import {
  decodeCtaProps,
  CTA_BG_COLORS,
  isSafeBackgroundImageUrl,
  parseBgImagePosition,
} from "@/lib/cta-props";
import { normalizePreviewBlogImageUrl } from "@/lib/blog-asset-url";

function bgColorClass(id) {
  const row = CTA_BG_COLORS.find((c) => c.id === id);
  return row ? row.className : "bg-violet-600";
}

function textToneForBg(bgColorId, bgMode) {
  if (bgMode === "image") return "text-white";
  if (bgColorId === "light") return "text-slate-900";
  return "text-white";
}

function escapeUrlForCss(url) {
  return String(url).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function t(text) {
  return { type: "text", value: text };
}

/** Aside shell: width, height, radius, shadow — makes variants obviously different. */
function variantAsideShell(variant, hasImage) {
  if (variant === "banner") {
    const h = hasImage
      ? "min-h-[min(360px,70vw)] sm:min-h-[380px]"
      : "min-h-[260px] sm:min-h-[300px]";
    return `w-full max-w-none rounded-2xl ${h} flex flex-col justify-center`;
  }
  if (variant === "card") {
    const h = hasImage ? "min-h-[280px] sm:min-h-[300px]" : "min-h-[260px] sm:min-h-[280px]";
    return `max-w-md w-full mx-auto rounded-3xl shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/10 ${h} flex flex-col justify-center`;
  }
  /* compact */
  const h = hasImage ? "min-h-[100px] sm:min-h-[112px]" : "min-h-[72px] sm:min-h-[80px]";
  return `w-full max-w-none rounded-xl ${h} flex flex-col justify-center`;
}

function variantRadiusForOverlay(variant) {
  if (variant === "card") return "rounded-3xl";
  if (variant === "compact") return "rounded-xl";
  return "rounded-2xl";
}

function variantInnerWrapper(variant) {
  if (variant === "banner") {
    return "px-6 py-12 sm:px-12 sm:py-16 text-center w-full max-w-4xl mx-auto";
  }
  if (variant === "card") {
    return "px-8 py-10 sm:px-10 sm:py-12 text-center w-full";
  }
  return "px-4 py-3 sm:px-6 sm:py-4 w-full";
}

function titleClasses(variant, tone) {
  if (variant === "banner") {
    return `font-bold tracking-tight ${tone} text-2xl sm:text-3xl lg:text-4xl leading-tight`;
  }
  if (variant === "card") {
    return `font-bold tracking-tight ${tone} text-xl sm:text-2xl leading-snug`;
  }
  return `font-bold ${tone} text-sm sm:text-base leading-snug`;
}

function subcopyClasses(variant, tone) {
  if (variant === "banner") {
    return `${tone} mt-3 text-base sm:text-lg opacity-90 max-w-2xl mx-auto mb-8 sm:mb-10`;
  }
  if (variant === "card") {
    return `${tone} mt-2 text-sm sm:text-base opacity-90 mb-6 sm:mb-8 max-w-sm mx-auto`;
  }
  return `${tone} mt-1 text-xs sm:text-sm opacity-90 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none`;
}

function btnClasses(variant) {
  const base =
    "inline-flex items-center justify-center rounded-lg bg-white font-semibold text-violet-700 shadow-md transition hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";
  if (variant === "banner") {
    return `${base} px-8 py-3.5 text-base sm:text-lg mt-2`;
  }
  if (variant === "card") {
    return `${base} px-6 py-3 text-sm sm:text-base mt-2`;
  }
  return `${base} px-4 py-2 text-xs sm:text-sm shrink-0`;
}

/**
 * @param {ReturnType<import('@/lib/cta-props').decodeCtaProps>} props
 */
function buildCtaHast(props) {
  const {
    title,
    subcopy,
    buttonLabel,
    buttonUrl,
    variant,
    bgMode,
    bgColor,
    bgImageUrl,
    overlay,
  } = props;

  const tone =
    bgMode === "image"
      ? "text-white"
      : bgMode === "none"
        ? "text-slate-900"
        : textToneForBg(bgColor, bgMode);

  const overlayPct = Math.min(80, Math.max(0, parseInt(String(overlay), 10) || 0));
  const hasImage = bgMode === "image" && isSafeBackgroundImageUrl(bgImageUrl);
  const radiusClass = variantRadiusForOverlay(variant);
  const shell = variantAsideShell(variant, hasImage);
  const innerPad = variantInnerWrapper(variant);

  const btnBase = btnClasses(variant);

  let buttonNode = null;
  if (buttonLabel && buttonUrl) {
    buttonNode = {
      type: "element",
      tagName: "a",
      properties: {
        href: buttonUrl,
        class: btnBase,
      },
      children: [t(buttonLabel)],
    };
  } else if (buttonLabel) {
    buttonNode = {
      type: "element",
      tagName: "span",
      properties: {
        class: `${btnBase} cursor-not-allowed opacity-60`,
      },
      children: [t(buttonLabel)],
    };
  }

  const titleNode = title
    ? {
        type: "element",
        tagName: "h3",
        properties: {
          class: titleClasses(variant, tone),
        },
        children: [t(title)],
      }
    : null;

  const subNode = subcopy
    ? {
        type: "element",
        tagName: "p",
        properties: {
          class: subcopyClasses(variant, tone),
        },
        children: [t(subcopy)],
      }
    : null;

  let bodyChildren;
  if (variant === "compact") {
    const left = {
      type: "element",
      tagName: "div",
      properties: { class: "min-w-0 flex-1 text-left" },
      children: [titleNode, subNode].filter(Boolean),
    };
    const right = buttonNode
      ? {
          type: "element",
          tagName: "div",
          properties: { class: "flex shrink-0 items-center self-center sm:self-auto" },
          children: [buttonNode],
        }
      : null;
    bodyChildren = [
      {
        type: "element",
        tagName: "div",
        properties: {
          class:
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        },
        children: [left, right].filter(Boolean),
      },
    ];
  } else {
    bodyChildren = [titleNode, subNode, buttonNode].filter(Boolean);
  }

  const inner = {
    type: "element",
    tagName: "div",
    properties: {
      class: `relative z-10 ${innerPad}`,
    },
    children: bodyChildren,
  };

  const aside = {
    type: "element",
    tagName: "aside",
    properties: {
      class: `bsharp-cta not-prose my-8 overflow-hidden ${shell}`,
      "aria-label": "Call to action",
    },
    children: [],
  };

  if (hasImage) {
    const { x: posX, y: posY } = parseBgImagePosition(props);
    const resolvedBgUrl = normalizePreviewBlogImageUrl(bgImageUrl);
    aside.properties.class += " relative bg-slate-800 text-white";
    aside.properties.style = `background-image: url("${escapeUrlForCss(resolvedBgUrl)}"); background-size: cover; background-position: ${posX}% ${posY}%;`;
    aside.children = [
      {
        type: "element",
        tagName: "div",
        properties: {
          "aria-hidden": "true",
          class: `pointer-events-none absolute inset-0 ${radiusClass} bg-black`,
          style: `opacity: ${overlayPct / 100}`,
        },
        children: [],
      },
      inner,
    ];
  } else if (bgMode === "color") {
    aside.properties.class += ` relative ${bgColorClass(bgColor)}`;
    aside.children = [inner];
  } else {
    aside.properties.class +=
      " relative border-2 border-slate-200 bg-white shadow-sm";
    aside.children = [inner];
  }

  return aside;
}

export default function rehypeBsharpCta() {
  return (tree) => {
    visit(tree, "element", (node) => {
      const props = node.properties || {};
      const flag = props.dataBsharpCta ?? props["data-bsharp-cta"];
      if (!flag) return;

      const encoded = props.dataProps ?? props["data-props"];
      const raw =
        typeof encoded === "string"
          ? encoded
          : Array.isArray(encoded)
            ? encoded.join("")
            : "";
      const decoded = decodeCtaProps(raw);
      const aside = buildCtaHast(decoded);

      node.type = aside.type;
      node.tagName = aside.tagName;
      node.properties = aside.properties;
      node.children = aside.children;
    });
  };
}
