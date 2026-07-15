import { ImageResponse } from "next/og";
import {
  defaultOgSubtitle,
  displayTitleForOg,
  OG_IMAGE_SIZE,
  siteOriginForOg,
  type OgBrand,
} from "./og-image";

type OgImageOptions = {
  brand?: OgBrand;
  title?: string;
  subtitle?: string;
};

const BRAND_THEME: Record<
  OgBrand,
  {
    background: string;
    titleColor: string;
    subtitleColor: string;
    accent: string;
    logo: string;
    logoWidth: number;
    logoHeight: number;
  }
> = {
  bsharp: {
    background: "#0A0A12",
    titleColor: "#FFFFFF",
    subtitleColor: "rgba(255,255,255,0.62)",
    accent: "#5046E5",
    logo: "/assets/home/brand/bsharp-logo.png",
    logoWidth: 220,
    logoHeight: 56,
  },
  converse: {
    background: "#FFFFFF",
    titleColor: "#0A0A12",
    subtitleColor: "#64748B",
    accent: "#5046E5",
    logo: "/images/cta-assets/cta-brain-logo_blue.png",
    logoWidth: 88,
    logoHeight: 88,
  },
  vantage: {
    background: "#0A0A12",
    titleColor: "#FFFFFF",
    subtitleColor: "rgba(255,255,255,0.62)",
    accent: "#8350E8",
    logo: "/assets/home/brand/vantage_icon_blue_3-7-26.png",
    logoWidth: 96,
    logoHeight: 96,
  },
  learnbee: {
    background: "#FFFFFF",
    titleColor: "#0A0A12",
    subtitleColor: "#64748B",
    accent: "#6F4EF6",
    logo: "/images/brand/learnbee-logo.png",
    logoWidth: 200,
    logoHeight: 56,
  },
};

export function createOgImageResponse({
  brand = "learnbee",
  title = "Learnbee",
  subtitle,
}: OgImageOptions = {}) {
  const theme = BRAND_THEME[brand] ?? BRAND_THEME.learnbee;
  const origin = siteOriginForOg();
  const logoSrc = `${origin}${theme.logo}`;
  const line1 = displayTitleForOg(title, 80);
  const line2 = subtitle?.trim() || defaultOgSubtitle(brand);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
          backgroundColor: theme.background,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={theme.logoWidth}
            height={theme.logoHeight}
            style={{
              objectFit: "contain",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              width: 72,
              height: 6,
              borderRadius: 999,
              backgroundColor: theme.accent,
            }}
          />
          <div
            style={{
              fontSize: line1.length > 48 ? 52 : 60,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: theme.titleColor,
            }}
          >
            {line1}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: theme.subtitleColor,
            }}
          >
            {line2}
          </div>
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}

export type CaseStudyOgStat = {
  value: string;
  label: string;
};

export type CaseStudyOgContent = {
  eyebrow?: string;
  title: string;
  tagline: string;
  stats: CaseStudyOgStat[];
  footer?: string;
};

export function createCaseStudyOgImageResponse(content: CaseStudyOgContent) {
  const theme = BRAND_THEME.vantage;
  const origin = siteOriginForOg();
  const logoSrc = `${origin}${theme.logo}`;
  const title = displayTitleForOg(content.title, 72);
  const eyebrow = content.eyebrow?.trim() || "Case study";
  const footer = content.footer?.trim() || "Retail operations intelligence";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 68px",
          background: "linear-gradient(145deg, #0A0A12 0%, #12121F 48%, #0A0A12 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(131,80,232,0.22) 0%, transparent 70%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, zIndex: 1 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#A5B4FC",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: title.length > 52 ? 46 : 54,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: theme.titleColor,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 1.35,
              color: theme.subtitleColor,
              maxWidth: 900,
            }}
          >
            {content.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 48,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
            zIndex: 1,
          }}
        >
          {content.stats.map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: theme.titleColor,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: theme.subtitleColor,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src={logoSrc}
              alt=""
              width={56}
              height={56}
              style={{ objectFit: "contain" }}
            />
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: theme.titleColor,
              }}
            >
              Bsharp Vantage
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {footer}
          </div>
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
