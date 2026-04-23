#!/usr/bin/env node
/*
 * site_cloner.js
 * ---------------
 * Analyse un site web et tente de le reproduire localement :
 * - Telecharge le HTML de chaque page (en suivant les liens internes).
 * - Recupere les ressources (CSS, JS, images, fonts, videos).
 * - Reecrit les URLs pour que la copie fonctionne hors ligne.
 * - Produit un petit rapport d'analyse (structure, technos detectees,
 *   palette de couleurs approximative, polices, meta).
 *
 * Usage :
 *   node site_cloner.js https://exemple.com --out ./clone_exemple --max-pages 30
 *
 * Dependances :
 *   npm install axios cheerio
 *
 * Note legale : n'utilise ce script que sur des sites que tu as le droit
 * d'analyser/copier (tes propres sites, sites clients avec accord, etc.).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const axios = require('axios');
const cheerio = require('cheerio');

// ---------- Utils ----------

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; SiteClonerBot/1.0; +https://example.local)',
};

const ASSET_ATTRS = {
  img: ['src', 'data-src', 'srcset'],
  script: ['src'],
  link: ['href'],
  source: ['src', 'srcset'],
  video: ['src', 'poster'],
  audio: ['src'],
  iframe: ['src'],
  use: ['href', 'xlink:href'],
};

function stripFragment(u) {
  try {
    const parsed = new URL(u);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return u.split('#')[0];
  }
}

function sameSite(url, rootHost) {
  try {
    const host = new URL(url).host;
    return host === '' || host === rootHost;
  } catch {
    return false;
  }
}

function sanitizePath(urlStr) {
  const p = new URL(urlStr);
  let pathname = p.pathname || '';
  if (!pathname || pathname.endsWith('/')) {
    pathname = pathname + 'index.html';
  }
  const query = p.search.startsWith('?') ? p.search.slice(1) : p.search;
  if (query) {
    const q = query.replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 60);
    const idx = pathname.lastIndexOf('.');
    const slashIdx = pathname.lastIndexOf('/');
    if (idx > slashIdx) {
      pathname = `${pathname.slice(0, idx)}__${q}${pathname.slice(idx)}`;
    } else {
      pathname = `${pathname}__${q}`;
    }
  }
  const parts = [];
  for (const seg of pathname.split('/')) {
    const clean = seg.replace(/[^A-Za-z0-9._-]+/g, '_');
    if (clean) parts.push(clean);
  }
  return parts.join('/') || 'index.html';
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function relLink(fromFile, toFile) {
  const rel = path.relative(path.dirname(fromFile), toFile);
  return rel.split(path.sep).join('/');
}

function resolveUrl(base, target) {
  try {
    return new URL(target, base).toString();
  } catch {
    return target;
  }
}

// ---------- Cloner ----------

class SiteCloner {
  constructor(startUrl, outDir, { maxPages = 50, delay = 0.2, timeout = 20 } = {}) {
    this.startUrl = stripFragment(startUrl);
    this.rootHost = new URL(this.startUrl).host;
    this.outDir = path.resolve(outDir);
    this.maxPages = maxPages;
    this.delay = delay;
    this.timeout = timeout * 1000;

    this.client = axios.create({
      headers: HEADERS,
      timeout: this.timeout,
      maxRedirects: 10,
      responseType: 'arraybuffer',
      validateStatus: (s) => s >= 200 && s < 400,
    });

    // url -> chemin local absolu
    this.urlToLocal = new Map();
    this.visitedPages = new Set();
    this.queue = [this.startUrl];
    this.queued = new Set([this.startUrl]);

    this.analysis = {
      start_url: this.startUrl,
      pages: [],
      assets: { css: 0, js: 0, img: 0, font: 0, other: 0 },
      technos: new Set(),
      fonts: new Map(),
      colors: new Map(),
      meta: {},
    };
  }

  // ----- Téléchargement -----

  async _download(url) {
    try {
      const r = await this.client.get(url);
      return {
        data: Buffer.from(r.data),
        ctype: (r.headers['content-type'] || '').toString(),
      };
    } catch (e) {
      process.stderr.write(`  [!] erreur ${url}: ${e.message}\n`);
      return null;
    }
  }

  _localPathFor(url, isPage = false) {
    if (this.urlToLocal.has(url)) return this.urlToLocal.get(url);
    let sub = sanitizePath(url);
    if (isPage && !sub.endsWith('.html')) sub += '.html';
    if (!isPage) {
      sub = `assets/${sub}`;
    } else {
      sub = `pages/${sub}`;
    }
    if (url === this.startUrl) sub = 'index.html';
    const local = path.join(this.outDir, sub);
    this.urlToLocal.set(url, local);
    return local;
  }

  // ----- Traitement HTML -----

  async _processPage(url) {
    if (this.visitedPages.has(url) || this.visitedPages.size >= this.maxPages) return;
    console.log(`[page] ${url}`);
    this.visitedPages.add(url);
    const res = await this._download(url);
    if (!res) return;
    const html = res.data.toString('utf-8');
    let $;
    try {
      $ = cheerio.load(html, { decodeEntities: false });
    } catch (e) {
      process.stderr.write(`  [!] parse: ${e.message}\n`);
      return;
    }

    const pageLocal = this._localPathFor(url, true);
    ensureParent(pageLocal);

    this._analyzePage(url, $);

    // Ressources
    for (const [tag, attrs] of Object.entries(ASSET_ATTRS)) {
      const els = $(tag).toArray();
      for (const el of els) {
        for (const attr of attrs) {
          const val = $(el).attr(attr);
          if (val == null) continue;
          if (attr === 'srcset') {
            const newParts = [];
            for (const part of val.split(',')) {
              const bits = part.trim().split(/\s+/);
              if (!bits.length || !bits[0]) continue;
              const assetUrl = resolveUrl(url, bits[0]);
              const local = await this._fetchAsset(assetUrl);
              if (local) bits[0] = relLink(pageLocal, local);
              newParts.push(bits.join(' '));
            }
            $(el).attr(attr, newParts.join(', '));
          } else {
            const raw = val.trim();
            if (
              !raw ||
              raw.startsWith('data:') ||
              raw.startsWith('javascript:') ||
              raw.startsWith('mailto:') ||
              raw.startsWith('tel:') ||
              raw.startsWith('#')
            )
              continue;
            const assetUrl = resolveUrl(url, raw);
            const local = await this._fetchAsset(assetUrl);
            if (local) $(el).attr(attr, relLink(pageLocal, local));
          }
        }
      }
    }

    // Liens internes -> enfile + reecrit
    const anchors = $('a[href]').toArray();
    for (const a of anchors) {
      const href = ($(a).attr('href') || '').trim();
      if (
        !href ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      )
        continue;
      const target = stripFragment(resolveUrl(url, href));
      if (sameSite(target, this.rootHost)) {
        if (!this.visitedPages.has(target) && !this.queued.has(target)) {
          this.queue.push(target);
          this.queued.add(target);
        }
        const targetLocal = this._localPathFor(target, true);
        $(a).attr('href', relLink(pageLocal, targetLocal));
      }
    }

    // CSS inline <style>
    const styles = $('style').toArray();
    for (const s of styles) {
      const txt = $(s).html();
      if (txt) {
        const rewritten = await this._rewriteCss(txt, url, pageLocal);
        $(s).text(rewritten);
      }
    }

    fs.writeFileSync(pageLocal, $.html(), 'utf-8');
  }

  // ----- Ressources -----

  async _fetchAsset(url) {
    url = stripFragment(url);
    if (!(url.startsWith('http://') || url.startsWith('https://'))) return null;
    if (this.urlToLocal.has(url) && fs.existsSync(this.urlToLocal.get(url))) {
      return this.urlToLocal.get(url);
    }

    const local = this._localPathFor(url, false);
    ensureParent(local);
    const res = await this._download(url);
    if (!res) return null;
    let { data, ctype } = res;

    const kind = SiteCloner._classify(url, ctype);
    this.analysis.assets[kind] = (this.analysis.assets[kind] || 0) + 1;

    if (kind === 'css') {
      try {
        let text = data.toString('utf-8');
        text = await this._rewriteCss(text, url, local);
        data = Buffer.from(text, 'utf-8');
      } catch {
        /* ignore */
      }
    }

    fs.writeFileSync(local, data);
    if (this.delay) await new Promise((r) => setTimeout(r, this.delay * 1000));
    return local;
  }

  static _classify(url, ctype) {
    const u = url.toLowerCase();
    if (ctype.includes('css') || u.endsWith('.css')) return 'css';
    if (ctype.includes('javascript') || u.endsWith('.js') || u.endsWith('.mjs')) return 'js';
    const imgExt = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif'];
    if (imgExt.some((e) => u.endsWith(e))) return 'img';
    const fontExt = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    if (fontExt.some((e) => u.endsWith(e))) return 'font';
    if (ctype.startsWith('image/')) return 'img';
    if (ctype.startsWith('font/')) return 'font';
    return 'other';
  }

  // ----- CSS -----

  async _rewriteCss(text, baseUrl, cssLocal) {
    const URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
    const IMPORT_RE = /@import\s+(?:url\()?\s*(['"])([^'"]+)\1\s*\)?\s*;?/g;

    // Remplacements async : on collecte les promesses puis on substitue.
    const replaceAsync = async (str, regex, asyncFn) => {
      const matches = [];
      let m;
      while ((m = regex.exec(str)) !== null) {
        matches.push({ match: m[0], groups: m.slice(1), index: m.index });
      }
      if (!matches.length) return str;
      const replacements = await Promise.all(
        matches.map((mm) => asyncFn(mm.match, mm.groups))
      );
      let out = '';
      let last = 0;
      matches.forEach((mm, i) => {
        out += str.slice(last, mm.index) + replacements[i];
        last = mm.index + mm.match.length;
      });
      out += str.slice(last);
      return out;
    };

    text = await replaceAsync(text, IMPORT_RE, async (whole, [quote, target]) => {
      const absUrl = resolveUrl(baseUrl, target);
      const local = await this._fetchAsset(absUrl);
      if (local) return `@import ${quote}${relLink(cssLocal, local)}${quote};`;
      return whole;
    });

    text = await replaceAsync(text, URL_RE, async (whole, [quote, target]) => {
      if (target.startsWith('data:') || target.startsWith('#')) return whole;
      const absUrl = resolveUrl(baseUrl, target);
      const local = await this._fetchAsset(absUrl);
      if (local) return `url(${quote}${relLink(cssLocal, local)}${quote})`;
      return whole;
    });

    // Analyse : couleurs, fonts
    const colorRe = /#([0-9a-fA-F]{3,8})\b/g;
    let cm;
    while ((cm = colorRe.exec(text)) !== null) {
      const key = '#' + cm[1].toLowerCase();
      this.analysis.colors.set(key, (this.analysis.colors.get(key) || 0) + 1);
    }
    const fontRe = /font-family\s*:\s*([^;}{]+)/gi;
    let fm;
    while ((fm = fontRe.exec(text)) !== null) {
      for (const tok of fm[1].split(',')) {
        const name = tok.trim().replace(/^['"]|['"]$/g, '');
        if (name) this.analysis.fonts.set(name, (this.analysis.fonts.get(name) || 0) + 1);
      }
    }
    return text;
  }

  // ----- Analyse -----

  _analyzePage(url, $) {
    const title = ($('title').first().text() || '').trim();
    const meta = {};
    $('meta').each((_, m) => {
      const name = $(m).attr('name') || $(m).attr('property');
      const content = $(m).attr('content');
      if (name && content) meta[name] = content;
    });
    this.analysis.pages.push({
      url,
      title,
      h1: $('h1')
        .map((_, h) => $(h).text().trim())
        .get(),
      meta,
      nb_links: $('a').length,
      nb_images: $('img').length,
    });

    const htmlStr = $.html().toLowerCase();
    const hints = {
      WordPress: 'wp-content',
      Shopify: 'cdn.shopify.com',
      Wix: 'wix.com',
      Squarespace: 'squarespace',
      'Next.js': '/_next/',
      Nuxt: '/_nuxt/',
      React: 'react',
      Vue: 'vue',
      Bootstrap: 'bootstrap',
      TailwindCSS: 'tailwind',
      jQuery: 'jquery',
      'Google Analytics': 'google-analytics',
      GTM: 'googletagmanager',
    };
    for (const [name, needle] of Object.entries(hints)) {
      if (htmlStr.includes(needle)) this.analysis.technos.add(name);
    }
  }

  // ----- Run -----

  async run() {
    fs.mkdirSync(this.outDir, { recursive: true });
    while (this.queue.length && this.visitedPages.size < this.maxPages) {
      const url = this.queue.shift();
      if (!sameSite(url, this.rootHost)) continue;
      await this._processPage(url);
      if (this.delay) await new Promise((r) => setTimeout(r, this.delay * 1000));
    }

    const mapTopN = (map, n) =>
      [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

    const report = {
      ...this.analysis,
      technos: [...this.analysis.technos].sort(),
      fonts: mapTopN(this.analysis.fonts, 15),
      colors: mapTopN(this.analysis.colors, 20),
      nb_pages: this.visitedPages.size,
      nb_assets: Object.values(this.analysis.assets).reduce((a, b) => a + b, 0),
    };

    const reportPath = path.join(this.outDir, 'analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    const summary = [
      `# Analyse de ${this.startUrl}`,
      '',
      `- Pages telechargees : ${report.nb_pages}`,
      `- Ressources : ${report.nb_assets} ` +
        `(css=${this.analysis.assets.css || 0}, ` +
        `js=${this.analysis.assets.js || 0}, ` +
        `img=${this.analysis.assets.img || 0}, ` +
        `font=${this.analysis.assets.font || 0})`,
      `- Technos detectees : ${report.technos.join(', ') || 'aucune'}`,
      '',
      '## Polices principales',
      ...report.fonts.map(([name, n]) => `- ${name} (${n})`),
      '',
      '## Couleurs les plus frequentes',
      ...report.colors.map(([c, n]) => `- ${c} (${n})`),
      '',
      '## Pages',
      ...report.pages.map((p) => `- [${p.title || p.url}](${p.url})`),
    ];
    fs.writeFileSync(path.join(this.outDir, 'REPORT.md'), summary.join('\n'), 'utf-8');

    console.log(`\nOK. Clone dans : ${this.outDir}`);
    console.log(`Rapport : ${reportPath}`);
  }
}

// ---------- CLI ----------

function parseArgs(argv) {
  const args = { url: null, out: './clone', maxPages: 30, delay: 0.2 };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--out') args.out = rest[++i];
    else if (a === '--max-pages') args.maxPages = parseInt(rest[++i], 10);
    else if (a === '--delay') args.delay = parseFloat(rest[++i]);
    else if (a === '-h' || a === '--help') {
      console.log(
        'Usage: node site_cloner.js <url> [--out DIR] [--max-pages N] [--delay S]'
      );
      process.exit(0);
    } else if (!args.url) args.url = a;
  }
  if (!args.url) {
    console.error('Erreur : URL de depart manquante.');
    console.error('Usage: node site_cloner.js <url> [--out DIR] [--max-pages N] [--delay S]');
    process.exit(1);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const cloner = new SiteCloner(args.url, args.out, {
    maxPages: args.maxPages,
    delay: args.delay,
  });
  await cloner.run();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { SiteCloner };
