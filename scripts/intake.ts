/**
 * Podium intake — turn a student's exported zip into:
 *   1. A site agent card under hackathon/agents/<slug>/  (compact dossier)
 *   2. A runtime role overlay under roles/<slug>/         (drop-in)
 *   3. An entry in hackathon/agents.json                   (lobby manifest)
 *
 * Usage:
 *   npx tsx scripts/intake.ts -- <zip-or-directory> [--site-only] [--force] [--dry-run]
 *
 * Reads PODIUM_ROOT from env (defaults to repo root) so tests can target a temp dir.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import yauzl from "yauzl";
import { validateManifest, SCHEMA_VERSION } from "../hackathon/lib/agent-schema.js";
import { interpolate } from "../hackathon/lib/interpolate.js";

const SELF = fileURLToPath(import.meta.url);
const INSTALL_ROOT = path.resolve(path.dirname(SELF), "..");
const DEFAULT_ROOT = INSTALL_ROOT;

interface Args {
  inputs: string[];
  siteOnly: boolean;
  force: boolean;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { inputs: [], siteOnly: false, force: false, dryRun: false, help: false };
  for (const v of argv) {
    if (v === "--") continue;
    if (v === "--site-only") a.siteOnly = true;
    else if (v === "--force") a.force = true;
    else if (v === "--dry-run") a.dryRun = true;
    else if (v === "-h" || v === "--help") a.help = true;
    else if (v.startsWith("--")) throw new Error(`Unknown flag: ${v}`);
    else a.inputs.push(v);
  }
  return a;
}

function printHelp() {
  console.log("usage: tsx scripts/intake.ts -- <zip-or-directory> [--site-only] [--force] [--dry-run]");
  console.log("");
  console.log("Options:");
  console.log("  --site-only    Skip copying role/ to roles/<slug>/");
  console.log("  --force        Overwrite existing slug entries on the site and runtime");
  console.log("  --dry-run      Validate and report; write nothing");
}

function root() { return process.env.PODIUM_ROOT || DEFAULT_ROOT; }

interface ZipEntry { path: string; bytes: Buffer; }

async function readZip(zipPath: string): Promise<ZipEntry[]> {
  return new Promise((resolve, reject) => {
    const entries: ZipEntry[] = [];
    yauzl.open(zipPath, { lazyEntries: true }, (err, zip) => {
      if (err) return reject(err);
      zip.readEntry();
      zip.on("entry", (entry: yauzl.Entry) => {
        if (/\/$/.test(entry.fileName)) { zip.readEntry(); return; }
        zip.openReadStream(entry, (e2, stream) => {
          if (e2) return reject(e2);
          const chunks: Buffer[] = [];
          stream.on("data", (c) => chunks.push(c));
          stream.on("end", () => {
            entries.push({ path: entry.fileName, bytes: Buffer.concat(chunks) });
            zip.readEntry();
          });
        });
      });
      zip.on("end", () => resolve(entries));
      zip.on("error", reject);
    });
  });
}

async function intakeOne(zipPath: string, args: Args) {
  if (!fs.existsSync(zipPath)) throw new Error(`zip not found: ${zipPath}`);

  const entries = await readZip(zipPath);
  const mEntry = entries.find((e) => /[/^]manifest\.json$/.test(e.path));
  if (!mEntry) throw new Error(`zip does not contain manifest.json`);
  const manifest = JSON.parse(mEntry.bytes.toString("utf-8"));
  const v = validateManifest(manifest);
  if (!v.ok) {
    const msgs = v.errors.map((e) => `${e.field}: ${e.message}`).join("\n  ");
    throw new Error(`manifest invalid:\n  ${msgs}`);
  }

  const slug: string = manifest.slug;
  const repoRoot = root();
  const siteAgentDir = path.join(repoRoot, "hackathon/agents", slug);
  const roleDir = path.join(repoRoot, "roles", slug);

  console.log(`Reading ${path.basename(zipPath)} → slug=${slug}, schema_version=${manifest.schema_version}`);
  if (args.dryRun) {
    console.log(`(dry-run) Would import ${slug} (${manifest.name}, ${manifest.title}).`);
    return;
  }

  if (fs.existsSync(siteAgentDir) && !args.force) {
    throw new Error(`hackathon/agents/${slug} exists; rerun with --force to overwrite`);
  }
  if (!args.siteOnly && fs.existsSync(roleDir) && !args.force) {
    throw new Error(`roles/${slug} exists; rerun with --force to overwrite`);
  }

  // Copy site assets
  fs.rmSync(siteAgentDir, { recursive: true, force: true });
  fs.mkdirSync(siteAgentDir, { recursive: true });

  const profile = entries.find((e) => e.path === `${slug}/pitch/profile.js`);
  const avatar = entries.find((e) => e.path.startsWith(`${slug}/pitch/avatar.`));
  if (!profile) throw new Error(`zip missing pitch/profile.js`);
  if (!avatar) throw new Error(`zip missing pitch/avatar.<ext>`);
  fs.writeFileSync(path.join(siteAgentDir, "profile.js"), profile.bytes);
  const avatarExt = path.extname(avatar.path); // includes the dot
  fs.writeFileSync(path.join(siteAgentDir, `avatar${avatarExt}`), avatar.bytes);

  // Generate compact index.html using the pitch-index template
  // Templates always come from the install location (INSTALL_ROOT), not from PODIUM_ROOT.
  const tplPath = path.join(INSTALL_ROOT, "hackathon/lib/templates/pitch-index.html.tmpl");
  const tpl = fs.readFileSync(tplPath, "utf-8");
  const html = interpolate(tpl, {
    title: manifest.title,
    body_class: "pitch-page",
    styles_href: "../../styles.css",
    render_src: "../../render.js",
    back_href: "../../index.html",
    footer_hint: "hover any tile · click for detail",
  });
  fs.writeFileSync(path.join(siteAgentDir, "index.html"), html);

  // Copy role overlay
  if (!args.siteOnly) {
    fs.rmSync(roleDir, { recursive: true, force: true });
    const rolePrefix = `${slug}/role/`;
    for (const e of entries) {
      if (!e.path.startsWith(rolePrefix)) continue;
      const dest = path.join(roleDir, e.path.slice(rolePrefix.length));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, e.bytes);
    }
  }

  // Upsert agents.json
  const agentsPath = path.join(repoRoot, "hackathon/agents.json");
  const agents = fs.existsSync(agentsPath)
    ? JSON.parse(fs.readFileSync(agentsPath, "utf-8"))
    : { schema_version: "1", agents: [] };

  const idx = agents.agents.findIndex((a: any) => a.slug === slug);
  const entry = {
    slug,
    name: manifest.name,
    title: manifest.title,
    subtitle: manifest.subtitle,
    avatar_path: `agents/${slug}/avatar${avatarExt}`,
    kind: "student",
  };
  if (idx >= 0) agents.agents[idx] = entry;
  else agents.agents.push(entry);

  agents.agents.sort((a: any, b: any) => {
    const order = { boilerplate: 0, example: 1, student: 2 } as Record<string, number>;
    const k = (order[a.kind] ?? 9) - (order[b.kind] ?? 9);
    return k !== 0 ? k : a.name.localeCompare(b.name);
  });

  fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2) + "\n");

  console.log(`Imported ${slug}${args.siteOnly ? " (site only)" : " (site + role)"}.`);
}

async function main() {
  let args: Args;
  try { args = parseArgs(process.argv.slice(2)); }
  catch (e) { console.error((e as Error).message); printHelp(); process.exit(2); }

  if (args.help || args.inputs.length === 0) { printHelp(); process.exit(args.help ? 0 : 2); }

  for (const input of args.inputs) {
    const stat = fs.existsSync(input) ? fs.statSync(input) : null;
    if (!stat) { console.error(`not found: ${input}`); process.exit(2); }
    const zips = stat.isDirectory()
      ? fs.readdirSync(input).filter((f) => f.endsWith(".zip")).map((f) => path.join(input, f))
      : [input];
    for (const z of zips) await intakeOne(z, args);
  }
}

main().catch((err) => { console.error(err instanceof Error ? err.message : String(err)); process.exit(1); });
