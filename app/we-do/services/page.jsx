"use client";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function AIServicesZigzag() {
  const { t } = useLanguage();

  const SERVICES = [
    {
      id: "web-development",
      title: t("services.web_title"),
      description: t("services.web_desc"),
      features: [
        t("services.web_f1"),
        t("services.web_f2"),
        t("services.web_f3"),
      ],
      img: "web-development",
    },
    {
      id: "sap-solutions",
      title: t("services.sap_title"),
      description: t("services.sap_desc"),
      features: [
        t("services.sap_f1"),
        t("services.sap_f2"),
        t("services.sap_f3"),
      ],
      img: "SAP",
    },
    {
      id: "technology-operations",
      title: t("services.techops_title"),
      description: t("services.techops_desc"),
      features: [
        t("services.techops_f1"),
        t("services.techops_f2"),
        t("services.techops_f3"),
      ],
      img: "technology-operation",
    },
    {
      id: "mobile-development",
      title: t("services.mobile_title"),
      description: t("services.mobile_desc"),
      features: [
        t("services.mobile_f1"),
        t("services.mobile_f2"),
        t("services.mobile_f3"),
      ],
      img: "mobile-application",
    },
    {
      id: "cloud-mobility",
      title: t("services.cloud_title"),
      description: t("services.cloud_desc"),
      features: [
        t("services.cloud_f1"),
        t("services.cloud_f2"),
        t("services.cloud_f3"),
      ],
      img: "cloud-mobility",
    },
    {
      id: "consulting",
      title: t("services.consulting_title"),
      description: t("services.consulting_desc"),
      features: [
        t("services.consulting_f1"),
        t("services.consulting_f2"),
        t("services.consulting_f3"),
      ],
      img: "consulting-outsorcing",
    },
    {
      id: "education-partnership",
      title: t("services.edu_title"),
      description: t("services.edu_desc"),
      features: [
        t("services.edu_f1"),
        t("services.edu_f2"),
        t("services.edu_f3"),
      ],
      img: "japanese-training",
    },
  ];

  const trackRef = useRef(null);
  const svgRef = useRef(null);
  const pathTrackRef = useRef(null);
  const pathFlow2Ref = useRef(null);
  const pathDrawRef = useRef(null);
  const engineRef = useRef(null);

  // Fetch + decode all images before the user scrolls here,
  // so decoding doesn't happen on the main thread mid-scroll.
  // useEffect(() => {
  //   const track = trackRef.current;
  //   if (!track) return;

  //   const imgs = Array.from(track.querySelectorAll("img"));
  //   imgs.forEach((img) => {
  //     img.loading = "eager";
  //     if (img.decode) img.decode().catch(() => { });
  //   });
  // }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const track = trackRef.current;
        const svg = svgRef.current;
        const pathTrack = pathTrackRef.current;
        const pathFlow2 = pathFlow2Ref.current;
        const pathDraw = pathDrawRef.current;
        const engine = engineRef.current;
        if (!track || !svg || !pathTrack || !pathDraw) return;

        const drawn = [pathDraw, pathFlow2].filter(Boolean);
        const proxy = { p: 0 };
        let length = 0;

        const render = (progress) => {
          if (!length) return;
          const dist = Math.max(0, Math.min(length, progress * length));
          const offset = length - dist;
          drawn.forEach((p) => {
            p.style.strokeDashoffset = offset;
          });

          if (engine) {
            const pt = pathDraw.getPointAtLength(dist);
            engine.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
            // Keep engine slightly visible to prevent a first-paint/rasterization hitch when it "appears"
            engine.style.opacity = progress > 0.002 ? "1" : "0.01";
          }
        };

        const buildPath = () => {
          const cards = Array.from(track.querySelectorAll(".ai-service-media"));
          if (!cards.length) return;

          const trackRect = track.getBoundingClientRect();
          svg.setAttribute("width", trackRect.width);
          svg.setAttribute("height", trackRect.height);

          // read all rects first (no layout thrash)
          const rects = cards.map((c) => c.getBoundingClientRect());
          const LINE_INSET = 80;

          const cxOf = (r) => r.left + r.width / 2 - trackRect.left;
          let d = `M ${cxOf(rects[0])} ${rects[0].top - trackRect.top + LINE_INSET
            }`;

          rects.forEach((rect, i) => {
            const cx = cxOf(rect);
            const top = rect.top - trackRect.top;
            const bottom = rect.bottom - trackRect.top;

            if (i > 0) d += ` L ${cx} ${top}`;
            const last = i === rects.length - 1;
            d += ` L ${cx} ${last ? bottom - LINE_INSET : bottom}`;

            if (!last) {
              const next = rects[i + 1];
              const nextCx = cxOf(next);
              const nextTop = next.top - trackRect.top;
              const dy = nextTop - bottom;
              const dx = nextCx - cx;
              const R = Math.min(35, Math.max(0, dy / 2), Math.abs(dx) / 2);

              if (R <= 0) {
                d += ` L ${nextCx} ${nextTop}`;
                return;
              }
              const sx = Math.sign(dx) || 1;
              const midY = bottom + dy / 2;
              d += ` V ${midY - R}`;
              d += ` Q ${cx} ${midY} ${cx + R * sx} ${midY}`;
              d += ` H ${nextCx - R * sx}`;
              d += ` Q ${nextCx} ${midY} ${nextCx} ${midY + R}`;
              d += ` V ${nextTop}`;
            }
          });

          pathTrack.setAttribute("d", d);
          drawn.forEach((p) => p.setAttribute("d", d));

          length = pathDraw.getTotalLength();
          drawn.forEach((p) => {
            p.style.strokeDasharray = `${length}`;
          });

          // Warm up path measurement across multiple points so the browser caches the geometry and doesn't hitch on first scroll
          for (let i = 0; i <= 10; i++) {
            pathDraw.getPointAtLength(length * (i / 10));
          }

          render(proxy.p);
        };

        // build once, BEFORE creating the trigger
        buildPath();

        // created ONCE, never killed/recreated on resize
        gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: () => render(proxy.p),
          scrollTrigger: {
            trigger: track,
            start: "top 45%",
            end: "bottom 75%",
            scrub: 1.2, // smooths because it drives the proxy
            invalidateOnRefresh: true,
          },
        });

        // debounced rebuild: only when track SIZE really changes
        let raf = 0;
        let lastW = track.offsetWidth;
        let lastH = track.offsetHeight;

        const ro = new ResizeObserver(() => {
          const w = track.offsetWidth;
          const h = track.offsetHeight;
          if (w === lastW && h === lastH) return; // ignores the initial fire
          lastW = w;
          lastH = h;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            buildPath();
            ScrollTrigger.refresh();
          });
        });
        ro.observe(track);

        // fonts can change layout once they load; rebuild only if size changed
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            const w = track.offsetWidth;
            const h = track.offsetHeight;
            if (w !== lastW || h !== lastH) {
              lastW = w;
              lastH = h;
              buildPath();
              ScrollTrigger.refresh();
            }
          });
        }

        return () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
        };
      });

      return () => mm.revert();
    },
    { scope: trackRef }
  );

  return (
    <section
      id="ai-services-section"
      data-navbar="light"
      className="relative min-h-screen overflow-visible py-16 sm:py-20 md:py-24 lg:py-28 xl:py-5"
    >
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 m-auto w-[90%] opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <div
        ref={trackRef}
        className="relative z-10 mx-auto w-full max-w-[1800px] 2xl:max-w-[2050px] overflow-visible"
        style={{
          paddingInline: "clamp(1rem, 4vw, 5rem)",
        }}
      >
        <svg
          ref={svgRef}
          className="hidden md:block pointer-events-none absolute left-0 top-0 z-[5] overflow-visible"
          fill="none"
          aria-hidden="true"
        >
          {/* faint rail */}
          <path
            ref={pathTrackRef}
            stroke="#34CBEA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
          />

          {/* fake glow: wide, low-opacity stroke (no blur filter) */}
          <path
            ref={pathFlow2Ref}
            id="timelineFlow2"
            stroke="#34CBEA"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.18"
          />

          {/* main line */}
          <path
            ref={pathDrawRef}
            stroke="#34CBEA"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <g
            ref={engineRef}
            // Start slightly visible so the browser composites this layer and loads the image before scrolling
            style={{ opacity: 0.01 }}
            className="pointer-events-none"
          >
            <circle r="26" fill="#34CBEA" opacity="0.2" />
            <circle
              r="19"
              fill="#0d1527"
              stroke="#34CBEA"
              strokeWidth="2.5"
            />
            <circle r="15" fill="#FFFFFF" />
            <image
              href="/FS-images/Logo-fs.png"
              x="-11"
              y="-11"
              width="22"
              height="22"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </svg>

        <div className="relative">
          <div className="relative z-10 flex flex-col gap-14 sm:gap-16 md:gap-24 lg:gap-28 xl:gap-32">
            {SERVICES.map((service, index) => {
              const imageOnLeft = index % 2 === 0;

              return (
                <article
                  key={service.id}
                  data-image-side={imageOnLeft ? "left" : "right"}
                  className="ai-service-row group relative grid w-full items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 xl:gap-20"
                >
                  <div
                    className={`ai-service-image relative w-full ${imageOnLeft ? "md:order-1" : "md:order-2"
                      }`}
                  >
                    <div className="ai-service-media w-full max-w-[clamp(360px,42vw,680px)] 2xl:max-w-[clamp(500px,45vw,820px)] mx-auto overflow-hidden rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] rounded-tr-none rounded-bl-none border border-slate-100/80 relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[16/10] 2xl:aspect-[16/9.5]">
                      <Image
                        src={`/FS-images/${service.img}.jpg`}
                        alt={service.title}
                        fill
                        priority={index < 2}
                        quality="auto"
                        format="auto"
                        sizes="(max-width: 768px) 95vw, (max-width: 1280px) 45vw, 680px"
                        className="object-cover block"
                      />
                    </div>
                  </div>

                  <div
                    className={`ai-service-content relative w-full ${imageOnLeft ? "md:order-2" : "md:order-1"
                      }`}
                  >
                    <div className="relative overflow-hidden rounded-[28px] p-5 sm:p-8 lg:p-10 xl:p-12 bg-white/95">
                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-[clamp(2rem,2.5vw,3rem)] font-bold leading-tight text-black transition-colors duration-300">
                        {service.title}
                      </h3>

                      <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg lg:text-[clamp(1.125rem,1.25vw,1.45rem)] leading-relaxed text-black/85 font-normal">
                        {service.description}
                      </p>

                      <ul className="mt-4 sm:mt-6 space-y-2.5">
                        {homeFeatures(service.features)}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function homeFeatures(features) {
  return features.map((feature) => (
    <li
      key={feature}
      className="flex items-start gap-3 text-sm sm:text-base lg:text-[clamp(1.05rem,1.15vw,1.3rem)] text-black/90 pl-2 font-normal"
    >
      <span className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-[#34CBEA]" />
      <span className="leading-snug">{feature}</span>
    </li>
  ));
}