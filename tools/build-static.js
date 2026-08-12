#!/usr/bin/env node
/**
 * build-static.js — generates the "birth kit" pages every blog on this template needs:
 *   about.html, contact.html, privacy.html (in the site skin) + 404.html + robots.txt.
 *
 * Style, header and footer are extracted from index.html, so these pages can never
 * drift from the canonical template. Copy content comes from data/site.json +
 * the PAGES object below. Re-run it any time index.html's chrome changes.
 *
 * Usage: node tools/build-static.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site.json'), 'utf8')).site;
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const grab = (re, label) => {
  const m = idx.match(re);
  if (!m) { console.error('FATAL: cannot extract ' + label + ' from index.html'); process.exit(1); }
  return m[0];
};
const style = grab(/<style>[\s\S]*?<\/style>/, 'style');
const a11y = grab(/<style id="a11y">[\s\S]*?<\/style>/, 'a11y');
const header = grab(/<header class="site">[\s\S]*?<\/header>/, 'header');
const footer = grab(/<footer class="site">[\s\S]*?<\/footer>/, 'footer');

const FAVICONS = `<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="alternate icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

const PROSE_CSS = `<style>
.phero{background:radial-gradient(120% 90% at 80% -10%,var(--dark-2),var(--dark) 60%);color:var(--on-dark);padding:56px 0 46px}
.phero .eyebrow{color:var(--brass-lite)}
.phero h1{font-family:var(--serif);font-weight:600;font-size:clamp(2rem,1.3rem+2.6vw,3.2rem);margin:.5rem 0 0}
.phero p{color:var(--on-dark-mute);max-width:56ch;margin-top:.9rem}
.prose{max-width:68ch;padding:44px 0 20px}
.prose h2{font-family:var(--serif);font-weight:600;font-size:1.6rem;margin:2.2rem 0 .7rem}
.prose h3{font-family:var(--serif);font-weight:600;font-size:1.22rem;margin:1.6rem 0 .5rem}
.prose p{color:var(--ink-soft)}
.prose ul{color:var(--ink-soft);padding-left:1.15rem}
.prose li{margin:.4rem 0}
.prose a{color:var(--aqua-deep);font-weight:600;text-decoration:none;border-bottom:1px solid var(--line)}
.prose a:hover{border-bottom-color:var(--aqua-deep)}
.prose .lead{font-size:1.12rem;color:var(--ink)}
.prose blockquote{margin:1.4rem 0;padding:2px 0 2px 16px;border-left:2px solid var(--brass);font-family:var(--serif);font-size:1.06rem;color:var(--ink)}
.meta-updated{font-size:.86rem;color:var(--muted);margin-top:2.4rem;padding-top:1.2rem;border-top:1px solid var(--line)}
</style>`;

const D = SITE.domain, N = SITE.name, A = SITE.author, U = SITE.base_url;
/* Per-niche chrome. Keep in sync with index.html's --dark / --dark-2 / accent tokens. */
const THEME = { dark: '#101820', dark2: '#1D2A35', on: '#EAF0F5', mute: '#9CACB9', accent: '#7FC3DD', metal: '#C9D5DF', accentInk: '#0B1720' };

const PAGES = {
  about: {
    title: `About ${N} — who writes this, and how`,
    desc: `Who publishes ${N}, how we choose what to recommend, why we publish no star ratings, and how we make money.`,
    eyebrow: 'About',
    h1: 'Honest comparisons, and nothing we can&rsquo;t back up',
    lede: `${N} exists because buying a dishwasher for a kitchen with no hookup is unnecessarily hard: dozens of near-identical listings from brands you&rsquo;ve never heard of, flattering capacity claims, and no easy way to tell whether the machine will even fit under your cabinets. We do the comparing.`,
    body: `
<h2 id="who">Who writes this</h2>
<p class="lead">${N} is written and edited by ${A} and published by Neclid LTD, a small company based in Ashdod, Israel, writing for a US audience.</p>
<p>There is no anonymous content team here and no rotating cast of invented experts with stock-photo headshots. One editor makes the calls, and the reasoning behind each call is written out on the page so you can disagree with it. If a recommendation on this site is wrong, there is exactly one person to hold responsible for it.</p>

<h2 id="method">How we choose what to recommend</h2>
<p>Our starting point is a database of every portable dishwasher we can source through Amazon&rsquo;s official product API — 25 machines for this category at the time of writing. From there the work is comparison, not curation-by-vibes:</p>
<ul>
  <li>We sort machines by what they physically <em>are</em> — a countertop unit fed from its own water tank, a countertop unit that clips to the faucet, or an 18-inch freestanding machine on castors — because that decides whether one can work in your kitchen at all.</li>
  <li>We read the specifications that decide the outcome: stated place settings, maximum plate diameter, external height against standard cabinet clearance, water source, drying method, decibel rating and certification.</li>
  <li>We treat manufacturer marketing sceptically. In this category capacity is quoted in whichever unit flatters the machine — &ldquo;30+ dishes&rdquo; rather than place settings — and decibel figures are unaudited manufacturer claims.</li>
  <li>We pick one clear winner per buying situation rather than ranking machines that aren&rsquo;t competing for the same buyer.</li>
</ul>

<h2 id="no-ratings">Why we publish no star ratings</h2>
<p>Most roundups you&rsquo;ll read decorate every product with a rating and a review count. We don&rsquo;t, and the reason is uncomfortable but simple: Amazon&rsquo;s product API no longer returns rating or review-count data for these machines. We could copy numbers from a page we visited once, or quietly invent plausible ones. Both would make this site look more authoritative than it has earned.</p>
<blockquote>If we can&rsquo;t verify it, we don&rsquo;t print it &mdash; even when leaving it out makes the page look plainer than the competition.</blockquote>
<p>So you will not find star ratings, review counts, or paraphrased owner-review sentiment on this site. You will find specifications, prices, machine classes and clearly-labelled judgement. When we can source verifiable review data again, we&rsquo;ll add it and say so.</p>

<h2 id="testing">What we don&rsquo;t do</h2>
<p>We do not physically test these machines and we do not run a testing lab. We have no scores out of ten, no photographs of a machine we don&rsquo;t own, and no claim to have lived with anything for six weeks. Plenty of sites imply otherwise; we would rather be a research-based comparison site that says so plainly than a fake laboratory.</p>
<p>What that means in practice: use us to narrow eight machines down to the right one for your kitchen and budget, and to understand the trade-offs you&rsquo;re accepting. For the feel of a specific machine in daily use, read owner reviews on the retailer&rsquo;s own page &mdash; we link straight to them.</p>

<h2 id="money">How we make money</h2>
<p>${N} is reader-supported. When you buy through a link on this site we may earn a commission from Amazon, at no additional cost to you. As an Amazon Associate, we earn from qualifying purchases.</p>
<p>That relationship pays for the site, and it also creates an obvious temptation, so here is our rule: commission rates never influence a pick or its position. Amazon pays a percentage of the sale, which would push any dishonest publisher toward the most expensive machine on the page. Our cheapest recommendation costs $169.99, our most expensive $689.27, and both are there because they win a specific buying situation.</p>

<h2 id="corrections">Corrections</h2>
<p>Prices move constantly, machines get discontinued and specifications get revised. If something on this site is out of date or simply wrong, <a href="/contact">tell us</a> &mdash; corrections are made quickly and without fuss, and we&rsquo;d rather hear it from you than leave a reader misinformed.</p>
<p>Start with <a href="/">the eight dishwashers we recommend</a>, or browse <a href="/guides">every guide</a>.</p>`,
    schema: () => JSON.stringify({
      '@context': 'https://schema.org', '@type': 'AboutPage',
      url: `${U}/about`, name: `About ${N}`,
      publisher: { '@type': 'Organization', name: 'Neclid LTD', url: U, address: { '@type': 'PostalAddress', addressLocality: 'Ashdod', addressCountry: 'IL' } },
      about: { '@type': 'Person', name: A, jobTitle: 'Editor', worksFor: { '@type': 'Organization', name: 'Neclid LTD' } }
    })
  },

  contact: {
    title: `Contact ${N}`,
    desc: `How to reach ${N} — corrections, price errors, questions about a machine, and what we can and can't help with.`,
    eyebrow: 'Contact',
    h1: 'Get in touch',
    lede: 'Corrections and price errors are the most useful mail we get. Send them.',
    body: `
<h2 id="email">Email</h2>
<p class="lead"><a href="mailto:hello@${D}">hello@${D}</a></p>
<p>One editor reads this address, so replies are personal rather than instant. Please put the machine name or page in the subject line.</p>

<h2 id="useful">What&rsquo;s genuinely useful to send</h2>
<ul>
  <li><strong>Corrections.</strong> A wrong dimension, a machine that&rsquo;s been discontinued, a price that&rsquo;s badly out of date, a broken link. These get fixed fastest.</li>
  <li><strong>Gaps.</strong> A question you couldn&rsquo;t get answered anywhere &mdash; those become guides.</li>
  <li><strong>Disagreement.</strong> If you think a pick is wrong and you can say why, we want to read it. Our reasoning is published precisely so it can be argued with.</li>
</ul>

<h2 id="cant">What we can&rsquo;t do</h2>
<ul>
  <li><strong>Repairs, installation and warranty claims.</strong> We don&rsquo;t sell machines, we are not plumbers, and we have no access to any order. Contact the manufacturer or the retailer you bought from.</li>
  <li><strong>Tell you a machine is in stock or on sale.</strong> Prices and availability change hourly; the live retailer page is the only reliable answer.</li>
  <li><strong>Paid placement.</strong> We don&rsquo;t sell positions, sponsored posts, link insertions or &ldquo;guest articles&rdquo;. Please don&rsquo;t ask &mdash; these mails go unanswered.</li>
</ul>

<h2 id="who">Who you&rsquo;re writing to</h2>
<p>${N} is written by ${A} and published by Neclid LTD, Ashdod, Israel. More about the method and the no-ratings policy is on the <a href="/about">about page</a>.</p>`,
    schema: () => JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ContactPage', url: `${U}/contact`, name: `Contact ${N}`,
      mainEntity: { '@type': 'Organization', name: N, email: `hello@${D}`, url: U }
    })
  },

  privacy: {
    title: `Privacy Policy — ${N}`,
    desc: `What ${N} collects (very little), the cookies affiliate links set, and how to opt out.`,
    eyebrow: 'Legal',
    h1: 'Privacy policy',
    lede: 'The short version: we have no accounts, no newsletter and no interest in your personal data.',
    body: `
<h2 id="short">The short version</h2>
<p class="lead">${N} has no login, no shopping cart, no newsletter and no comment section. We do not ask you for your name, your email address or your payment details, and we do not sell data about you, because we don&rsquo;t hold any.</p>

<h2 id="analytics">Analytics</h2>
<p>We use privacy-respecting aggregate analytics to understand which pages are read and which are ignored. This records things like the page visited, the referring site, a coarse country-level location, and the type of device and browser. It is used in aggregate to decide what to write next. Where Google Analytics 4 is enabled, IP addresses are anonymised by Google before storage; you can block it with any standard tracker-blocking extension, and doing so does not change how this site works.</p>

<h2 id="affiliate">Affiliate links and Amazon cookies</h2>
<p>Product links on this site are Amazon affiliate links. When you click one, Amazon sets its own cookies to attribute a possible purchase to us, and that data is handled by Amazon under its own privacy notice, not ours. We never see your order, your address or your payment information &mdash; only aggregate reports of how many items were bought through our links.</p>
<p>As an Amazon Associate, we earn from qualifying purchases. This costs you nothing extra and does not affect our recommendations.</p>

<h2 id="hosting">Hosting and server logs</h2>
<p>This site is static and served by Cloudflare Pages. Like any web host, Cloudflare processes standard request data (IP address, user agent, timestamp) to deliver pages and to block abuse. We do not combine those logs with anything else, and we do not use them to profile visitors.</p>

<h2 id="cookies">Cookies we set</h2>
<p>None of our own beyond what the analytics script described above requires. There are no advertising cookies, no retargeting pixels and no social-media trackers on this site.</p>

<h2 id="children">Children</h2>
<p>This site is aimed at adults buying kitchen appliances and is not directed at children under 13. We do not knowingly collect information from them.</p>

<h2 id="rights">Your choices</h2>
<p>You can block analytics with a browser extension or your browser&rsquo;s tracker-blocking setting; you can clear affiliate cookies through your browser at any time; and if you believe we hold data about you and want it removed, write to <a href="mailto:hello@${D}">hello@${D}</a> and we will deal with it.</p>

<h2 id="who">Who we are</h2>
<p>${N} is published by Neclid LTD, Ashdod, Israel. Questions about this policy: <a href="mailto:hello@${D}">hello@${D}</a>. See also <a href="/about">about</a> and <a href="/contact">contact</a>.</p>`,
    schema: () => JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebPage', url: `${U}/privacy`, name: `Privacy Policy — ${N}`,
      publisher: { '@type': 'Organization', name: 'Neclid LTD' }
    })
  }
};

const UPDATED = 'August 13, 2026';

for (const [slug, p] of Object.entries(PAGES)) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="${U}/${slug}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${N}">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta name="theme-color" content="${THEME.dark}">
${FAVICONS}
${style}
${PROSE_CSS}
${a11y}
</head>
<body>
${header}
<div class="phero"><div class="wrap"><span class="eyebrow">${p.eyebrow}</span><h1 class="serif">${p.h1}</h1><p>${p.lede}</p></div></div>
<div class="wrap"><div class="prose">
${p.body.trim()}
<p class="meta-updated">Last updated ${UPDATED} · ${N} · Published by Neclid LTD, Ashdod, Israel.</p>
</div></div>
${footer}
<script type="application/ld+json">
${p.schema()}
</script>
<script src="/site.js" defer></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, slug + '.html'), html);
  console.log('wrote ' + slug + '.html');
}

/* ---------------- 404 (standalone, noindex) ---------------- */
const notFound = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — ${N}</title>
<meta name="robots" content="noindex, follow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate icon" href="/favicon.ico">
<meta name="theme-color" content="${THEME.dark}">
<style>
  :root{--dark:${THEME.dark};--dark2:${THEME.dark2};--on:${THEME.on};--mute:${THEME.mute};--copper:${THEME.accent};--brass:${THEME.metal};
    --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
  *{box-sizing:border-box}
  body{margin:0;min-height:100dvh;display:grid;place-items:center;text-align:center;padding:40px 24px;
    background:radial-gradient(120% 90% at 80% -10%,var(--dark2),var(--dark) 60%);color:var(--on);font-family:var(--sans)}
  .n{font-family:var(--serif);font-size:clamp(3rem,2rem+6vw,5.5rem);color:var(--brass);line-height:1;margin:0}
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(1.5rem,1.1rem+1.6vw,2.2rem);margin:.4rem 0 .6rem}
  p{color:var(--mute);max-width:44ch;margin:0 auto 1.6rem;line-height:1.6}
  a.cta{display:inline-flex;align-items:center;gap:8px;background:var(--copper);color:${THEME.accentInk};font-weight:700;
    padding:13px 24px;border-radius:12px;text-decoration:none}
  a.cta:hover{background:var(--brass)}
  .links{margin-top:22px;font-size:.9rem}
  .links a{color:var(--brass);text-decoration:none;margin:0 10px}
  .links a:hover{text-decoration:underline}
</style>
</head>
<body>
<main>
  <p class="n">404</p>
  <h1>That page is in the wash</h1>
  <p>The link you followed doesn&rsquo;t exist &mdash; or it moved. The guide to the eight dishwashers we recommend is still where you left it.</p>
  <a class="cta" href="/">Back to the portable dishwasher guide →</a>
  <div class="links"><a href="/guides">All guides</a><a href="/about">About</a><a href="/contact">Contact</a></div>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, '404.html'), notFound);
console.log('wrote 404.html');

/* ---------------- robots.txt ---------------- */
const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /

Sitemap: ${U}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
console.log('wrote robots.txt');
