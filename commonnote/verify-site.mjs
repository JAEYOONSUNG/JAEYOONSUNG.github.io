import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = dirname(fileURLToPath(import.meta.url));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const productCaptures = [
  "collaboration.png",
  "tasks.png",
  "project-tree.png",
  "relation-map.png",
  "messenger-files.png",
  "migration.png",
  "schedule-table.png",
  "calendar.png",
  "handoff.png",
  "calculator.png",
  "editor-icons.png",
].map((name) => `assets/product-v3/${name}`);

const requiredFiles = [
  "index.html",
  "guide.html",
  "styles.css",
  "site.js",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/og-card.png",
  "fonts/pretendard/pretendard.css",
  "fonts/pretendard/LICENSE.txt",
  ...productCaptures,
];

requiredFiles.forEach((relativePath) => check(existsSync(join(siteDir, relativePath)), `missing required file: ${relativePath}`));

const pages = ["index.html", "guide.html"].map((file) => ({ file, html: readFileSync(join(siteDir, file), "utf8") }));
const landing = pages[0].html;
const guide = pages[1].html;
const css = readFileSync(join(siteDir, "styles.css"), "utf8");
const js = readFileSync(join(siteDir, "site.js"), "utf8");

for (const { file, html } of pages) {
  check(/<html[^>]+lang="ko"/.test(html), `${file}: document language must be Korean`);
  check((html.match(/<h1(?:\s|>)/g) || []).length === 1, `${file}: page must contain exactly one h1`);
  check(/<main[^>]+id="[^"]+"/.test(html), `${file}: page must have a named main landmark`);
  check(/class="skip-link"/.test(html), `${file}: page must include a keyboard skip link`);
  check(/rel="canonical"/.test(html), `${file}: page must define a canonical URL`);
  check(!/\bonclick\s*=/.test(html), `${file}: inline click handlers are not allowed`);
  check(!/<style\b|style="/.test(html), `${file}: inline styles are not allowed`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  check(new Set(ids).size === ids.length, `${file}: all HTML ids must be unique`);

  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    check(/\balt="[^"]*"/.test(match[1]), `${file}: image is missing alt text: ${match[0].slice(0, 90)}`);
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
    .filter((value) => value !== "../")
    .map((value) => value.split(/[?#]/)[0]);
  for (const reference of localReferences) {
    const resolved = normalize(join(siteDir, reference));
    check(resolved.startsWith(siteDir), `${file}: local reference escapes the site directory: ${reference}`);
    check(existsSync(resolved), `${file}: local reference does not exist: ${reference}`);
  }
}

check(/property="og:image"/.test(landing), "landing must define an Open Graph image");
check(/\.\/guide\.html/.test(landing), "landing must link the detailed guide");
check(/data-gallery/.test(landing), "landing must include the real-product workflow gallery");
check((landing.match(/assets\/product-v3\//g) || []).length >= 10, "landing must use at least ten real product captures");
check(!/hero-lab-v2|data-journey|journey-stage|product-window|map-card/.test(landing), "stale v2 illustrative product dependencies must be removed");
check(!/qa_surface|성재윤|nkim/.test(landing + guide), "published text must not contain QA or personal identities");
check(/data-guide-search/.test(guide) && /data-guide-section/.test(guide), "guide must include searchable task-oriented sections");
check((guide.match(/data-guide-section/g) || []).length >= 12, "guide must include at least twelve detailed sections");
check(/@media \(prefers-reduced-motion: reduce\)/.test(css), "CSS must support reduced motion");
check(/:focus-visible/.test(css), "CSS must provide visible keyboard focus");
check(!/text-shadow|mix-blend-mode/.test(css), "novelty glow or blend effects are not allowed");

for (const relativePath of productCaptures) {
  if (!existsSync(join(siteDir, relativePath))) continue;
  const buffer = readFileSync(join(siteDir, relativePath));
  check(buffer.subarray(1, 4).toString() === "PNG", `${relativePath}: capture must be PNG`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  check(width >= 2400 && height >= 1400, `${relativePath}: capture is too small (${width}×${height})`);
  check(statSync(join(siteDir, relativePath)).size < 1_000_000, `${relativePath}: capture must stay below 1 MB`);
}

const manifest = JSON.parse(readFileSync(join(siteDir, "manifest.webmanifest"), "utf8"));
check(manifest.name === "CommonNote", "manifest name must be CommonNote");
check(manifest.start_url === "./", "manifest start_url must be subpath-safe");
check(Array.isArray(manifest.icons) && manifest.icons.length > 0, "manifest must define an icon");
check(Buffer.byteLength(js) < 15_000, "site JavaScript should remain small and dependency-free");

if (failures.length) {
  console.error("CommonNote launch site verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("CommonNote launch site verification passed");
