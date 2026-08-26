import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = dirname(fileURLToPath(import.meta.url));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const productCaptures = [
  "calendar.png",
  "collaboration.png",
  "handoff.png",
  "messenger-files.png",
  "migration.png",
  "project-tree.png",
  "relation-map.png",
  "schedule-table.png",
  "tasks.png",
].map((name) => `assets/product-v4/${name}`);

const requiredFiles = [
  "index.html",
  "ko.html",
  "guide.html",
  "guide-ko.html",
  "styles.css",
  "site.js",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/og-card.png",
  "assets/motion/live-collaboration.mp4",
  "assets/motion/live-collaboration.webm",
  "assets/motion/live-collaboration-poster.jpg",
  "fonts/pretendard/pretendard.css",
  "fonts/pretendard/LICENSE.txt",
  ...productCaptures,
];

requiredFiles.forEach((relativePath) => check(existsSync(join(siteDir, relativePath)), `missing required file: ${relativePath}`));

const pageConfig = [
  { file: "index.html", lang: "en", canonical: "https://jaeyoonsung.github.io/commonnote/" },
  { file: "ko.html", lang: "ko", canonical: "https://jaeyoonsung.github.io/commonnote/ko.html" },
  { file: "guide.html", lang: "en", canonical: "https://jaeyoonsung.github.io/commonnote/guide.html" },
  { file: "guide-ko.html", lang: "ko", canonical: "https://jaeyoonsung.github.io/commonnote/guide-ko.html" },
];
const pages = pageConfig.map((config) => ({ ...config, html: readFileSync(join(siteDir, config.file), "utf8") }));
const [landing, landingKo, guide, guideKo] = pages.map(({ html }) => html);
const css = readFileSync(join(siteDir, "styles.css"), "utf8");
const js = readFileSync(join(siteDir, "site.js"), "utf8");

for (const { file, lang, canonical, html } of pages) {
  check(new RegExp(`<html[^>]+lang="${lang}"`).test(html), `${file}: document language must be ${lang}`);
  check((html.match(/<h1(?:\s|>)/g) || []).length === 1, `${file}: page must contain exactly one h1`);
  check(/<main[^>]+id="[^"]+"/.test(html), `${file}: page must have a named main landmark`);
  check(/class="skip-link"/.test(html), `${file}: page must include a keyboard skip link`);
  check(html.includes(`<link rel="canonical" href="${canonical}"`), `${file}: canonical URL is incorrect`);
  check(/rel="alternate" hreflang="en"/.test(html) && /rel="alternate" hreflang="ko"/.test(html), `${file}: bilingual hreflang links are required`);
  check(!/\bonclick\s*=/.test(html), `${file}: inline click handlers are not allowed`);
  check(!/<style\b|style="/.test(html), `${file}: inline styles are not allowed`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  check(new Set(ids).size === ids.length, `${file}: all HTML ids must be unique`);

  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    check(/\balt="[^"]*"/.test(match[1]), `${file}: image is missing alt text: ${match[0].slice(0, 90)}`);
    check(/\bwidth="\d+"/.test(match[1]) && /\bheight="\d+"/.test(match[1]), `${file}: image must reserve width and height: ${match[0].slice(0, 90)}`);
  }
  for (const match of html.matchAll(/<button\b([^>]*)>/g)) {
    check(/\btype="button"/.test(match[1]), `${file}: button is missing type=button: ${match[0].slice(0, 90)}`);
  }
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
    check(match[1].startsWith("./"), `${file}: runtime script must be local: ${match[1]}`);
  }
  for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
    check(ids.includes(match[1]), `${file}: hash link has no destination: #${match[1]}`);
  }

  const localReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|tel:|#)/.test(value))
    .map((value) => value.split(/[?#]/)[0]);
  for (const reference of localReferences) {
    const resolved = normalize(join(siteDir, reference));
    check(resolved.startsWith(siteDir), `${file}: local reference escapes the site directory: ${reference}`);
    check(existsSync(resolved), `${file}: local reference does not exist: ${reference}`);
  }
}

check(/property="og:image"/.test(landing) && /property="og:image"/.test(landingKo), "both landing pages must define an Open Graph image");
check(/\.\/guide\.html/.test(landing) && /\.\/guide-ko\.html/.test(landingKo), "each landing page must link its local-language guide");
check(/data-gallery/.test(landing) && /data-gallery/.test(landingKo), "both landing pages must include the real-product gallery");
check(/data-gallery-scrubber/.test(landing) && /data-gallery-scrubber/.test(landingKo), "both landing pages must include the draggable workflow scrubber");
check(/class="gallery-viewport"/.test(landing) && /class="gallery-viewport"/.test(landingKo), "both landing pages must include the sticky product cinema viewport");
check(/<video[^>]+autoplay[^>]+muted[^>]+loop[^>]+playsinline/.test(landing), "English landing must include the live collaboration loop");
check(/<video[^>]+autoplay[^>]+muted[^>]+loop[^>]+playsinline/.test(landingKo), "Korean landing must include the live collaboration loop");
check(/data-motion-toggle/.test(landing) && /data-motion-toggle/.test(landingKo), "both landing pages must provide a motion pause/play control");
const motionSymbolVariants = [
  "personal",
  "study",
  "creative",
  "teams",
  "operations",
  "research",
  "notes",
  "collaboration",
  "execution",
  "planning",
  "records",
  "tools",
];
for (const [label, html] of [["English", landing], ["Korean", landingKo]]) {
  check((html.match(/data-motion-symbol=/g) || []).length === 12, `${label} landing must include exactly twelve motion symbols`);
  for (const variant of motionSymbolVariants) {
    check(html.includes(`data-motion-symbol="${variant}"`), `${label} landing is missing the ${variant} motion symbol`);
  }
  check((html.match(/<svg viewBox="0 0 48 48" focusable="false">/g) || []).length === 12, `${label} motion symbols must use non-focusable inline SVG`);
}
check(!/audience-emoji|feature-emoji|🗒️|🎓|✨|🧭|⚙️|🔬|✍️|👥|🚀|🗓️|🔐|🧮|⚡|🌐/.test(landing + landingKo + css), "native emoji artwork must be fully replaced");
check((landing.match(/data-fine-motion/g) || []).length === 3 && (landingKo.match(/data-fine-motion/g) || []).length === 3, "both landing pages need three fine motion trust symbols");
check(/\.motion-symbol\.is-in-view/.test(css) && /animation-play-state:\s*var\(--motion-state\)/.test(css), "motion symbols must expose a CSS paused/running contract");
check(/const motionSymbols/.test(js) && /visibleSymbols/.test(js) && /document\.hidden/.test(js), "motion symbols must be visibility-gated in JavaScript");
check((landing.match(/assets\/product-v4\//g) || []).length >= 9, "English landing must use at least nine real product captures");
check((landingKo.match(/assets\/product-v4\//g) || []).length >= 9, "Korean landing must use at least nine real product captures");
check((guide.match(/data-guide-section/g) || []).length === 12, "English guide must include exactly twelve detailed sections");
check((guideKo.match(/data-guide-section/g) || []).length === 12, "Korean guide must include exactly twelve detailed sections");
check(/data-guide-search/.test(guide) && /data-guide-search/.test(guideKo), "both guides must include task-oriented search");
check(/@media \(prefers-reduced-motion: reduce\)/.test(css), "CSS must support reduced motion");
check(/:focus-visible/.test(css), "CSS must provide visible keyboard focus");
check(!/text-shadow|mix-blend-mode/.test(css), "novelty text glow or blend effects are not allowed");
check(!/perspective\(1600px\)|rotateX\(|0\s+0\s+0\s+10px/.test(css), "rounded product surfaces must not use protruding perspective or outline-ring layers");
check(/--product-radius:\s*28px/.test(css) && /--mac-window-radius:\s*18px/.test(css), "hero Mac surfaces must share explicit radius tokens");
check(/--gallery-radius:\s*38px/.test(css) && /calc\(var\(--gallery-radius\) - 1px\)/.test(css), "workflow window surfaces must share an explicit radius hierarchy");
check(!/product-v[123]|hero-lab|journey-stage|pseudo-app/.test(landing + landingKo + css + js), "stale landing dependencies must be removed");

const textualSite = [landing, landingKo, guide, guideKo, css, js, readFileSync(join(siteDir, "manifest.webmanifest"), "utf8")].join("\n");
check(!/collagenase|assay\s*#|research workspace|연구 기록부터|효소 안정성|활성 조건 재현|scale-up|qa_surface|성재윤|nkim/i.test(textualSite), "published site contains stale research-only or personal demo wording");

for (const relativePath of productCaptures) {
  if (!existsSync(join(siteDir, relativePath))) continue;
  const buffer = readFileSync(join(siteDir, relativePath));
  check(buffer.subarray(1, 4).toString() === "PNG", `${relativePath}: capture must be PNG`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  check(width === 2880 && height === 1800, `${relativePath}: capture must be 2880×1800, found ${width}×${height}`);
  check(statSync(join(siteDir, relativePath)).size < 1_000_000, `${relativePath}: capture must stay below 1 MB`);
}

const og = readFileSync(join(siteDir, "assets/og-card.png"));
check(og.readUInt32BE(16) === 1200 && og.readUInt32BE(20) === 630, "Open Graph card must be 1200×630");
check(statSync(join(siteDir, "assets/og-card.png")).size < 1_000_000, "Open Graph card must stay below 1 MB");

const manifest = JSON.parse(readFileSync(join(siteDir, "manifest.webmanifest"), "utf8"));
check(manifest.name === "CommonNote", "manifest name must be CommonNote");
check(manifest.lang === "en", "manifest default language must be English");
check(manifest.start_url === "./", "manifest start_url must be subpath-safe");
check(Array.isArray(manifest.icons) && manifest.icons.length > 0, "manifest must define an icon");
check(Buffer.byteLength(js) < 16_000, "site JavaScript should remain small and dependency-free");

if (failures.length) {
  console.error("CommonNote launch site verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("CommonNote launch site verification passed");
