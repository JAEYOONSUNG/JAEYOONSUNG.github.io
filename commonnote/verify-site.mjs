import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = dirname(fileURLToPath(import.meta.url));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredFiles = [
  "index.html",
  "styles.css",
  "site.js",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/hero-lab-v2.png",
  "assets/og-card.png",
  "fonts/pretendard/pretendard.css",
  "fonts/pretendard/LICENSE.txt",
];

requiredFiles.forEach((relativePath) => {
  check(existsSync(join(siteDir, relativePath)), `missing required file: ${relativePath}`);
});

const html = readFileSync(join(siteDir, "index.html"), "utf8");
const css = readFileSync(join(siteDir, "styles.css"), "utf8");
const js = readFileSync(join(siteDir, "site.js"), "utf8");

check(/<html[^>]+lang="ko"/.test(html), "document language must be Korean");
check((html.match(/<h1(?:\s|>)/g) || []).length === 1, "page must contain exactly one h1");
check(/<main[^>]+id="main"/.test(html), "page must have a named main landmark");
check(/class="skip-link"/.test(html), "page must include a keyboard skip link");
check(/rel="canonical"/.test(html), "page must define a canonical URL");
check(/property="og:image"/.test(html), "page must define an Open Graph image");
check(/@media \(prefers-reduced-motion: reduce\)/.test(css), "CSS must support reduced motion");
check(/:focus-visible/.test(css), "CSS must provide visible keyboard focus");
check(/prefers-reduced-motion: reduce/.test(js), "JavaScript must respect reduced motion");
check(!/\bonclick\s*=/.test(html), "inline click handlers are not allowed");
check(!/0 lost context|완벽한|무조건/.test(html), "avoid unverifiable product claims");
check(
  !/launch-hero|motion-lab|proof-strip|flow-instrument|rooms-grid|cta-orbit|evidence-thread/.test(html),
  "stale v1 decorative components must be removed",
);
check(!/qa_surface|성재윤|nkim/.test(html), "published demo data must not contain QA or personal account names");
check(/data-journey/.test(html), "page must include the evidence-to-action journey demo");
check(/hero-lab-v2\.png/.test(html), "page must include the CommonNote laboratory hero asset");

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
check(new Set(ids).size === ids.length, "all HTML ids must be unique");

for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
  check(/\balt="[^"]*"/.test(match[1]), `image is missing alt text: ${match[0].slice(0, 90)}`);
}

for (const match of html.matchAll(/<button\b([^>]*)>/g)) {
  check(/\btype="button"/.test(match[1]), `button is missing type=button: ${match[0].slice(0, 90)}`);
}

for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
  check(match[1].startsWith("./"), `runtime script must be local: ${match[1]}`);
}

for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
  check(ids.includes(match[1]), `hash link has no destination: #${match[1]}`);
}

const localReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((value) => !/^(?:https?:|mailto:|tel:|#)/.test(value))
  .filter((value) => value !== "../")
  .map((value) => value.split(/[?#]/)[0]);

for (const reference of localReferences) {
  const resolved = normalize(join(siteDir, reference));
  check(resolved.startsWith(siteDir), `local reference escapes the site directory: ${reference}`);
  check(existsSync(resolved), `local reference does not exist: ${reference}`);
}

const manifest = JSON.parse(readFileSync(join(siteDir, "manifest.webmanifest"), "utf8"));
check(manifest.name === "CommonNote", "manifest name must be CommonNote");
check(manifest.start_url === "./", "manifest start_url must be subpath-safe");
check(Array.isArray(manifest.icons) && manifest.icons.length > 0, "manifest must define an icon");

const largeAssets = requiredFiles
  .filter((file) => existsSync(join(siteDir, file)) && statSync(join(siteDir, file)).isFile())
  .filter((file) => statSync(join(siteDir, file)).size > 2_000_000);
check(largeAssets.length === 0, `required assets should stay below 2 MB: ${largeAssets.join(", ")}`);

if (failures.length) {
  console.error("CommonNote launch site verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("CommonNote launch site verification passed");
