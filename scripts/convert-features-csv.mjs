/**
 * One-time script to convert features CSV to Astro content collection markdown files.
 * Run with: node scripts/convert-features-csv.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CSV_PATH = join(process.cwd(), 'reference', 'Features.csv');
const OUTPUT_DIR = join(process.cwd(), 'src', 'content', 'features');

// Simple CSV parser that handles quoted fields
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      row.push(current); current = '';
    } else if (ch === '\n' && !inQuotes) {
      row.push(current); current = '';
      if (row.length > 1) rows.push(row);
      row = [];
    } else if (ch === '\r' && !inQuotes) {
      // skip
    } else {
      current += ch;
    }
  }
  if (current || row.length) { row.push(current); if (row.length > 1) rows.push(row); }
  return rows;
}

function htmlToMarkdown(html) {
  if (!html) return '';
  let md = html;
  md = md.replace(/\s*data-preset-tag="[^"]*"/g, '');
  md = md.replace(/<h2[^>]*><strong>(.*?)<\/strong><\/h2>/g, '\n\n## $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*><strong>(.*?)<\/strong><\/h3>/g, '\n\n### $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/g, '\n\n#### $1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/g, '![]($1)');
  md = md.replace(/<ul[^>]*>/g, '\n');
  md = md.replace(/<\/ul>/g, '\n');
  md = md.replace(/<ol[^>]*>/g, '\n');
  md = md.replace(/<\/ol>/g, '\n');
  md = md.replace(/<li[^>]*><p>(.*?)<\/p><\/li>/gs, '- $1\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gs, '- $1\n');
  md = md.replace(/<blockquote[^>]*><p>(.*?)<\/p><\/blockquote>/gs, '\n> $1\n');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gs, '\n> $1\n');
  md = md.replace(/<br\s*\/?>/g, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gs, '$1\n\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function yamlStr(s) {
  if (!s) return '""';
  return JSON.stringify(s);
}

function parseBullets(html) {
  if (!html) return [];
  const items = [];
  const matches = html.match(/<li[^>]*>(?:<p>)?(.*?)(?:<\/p>)?<\/li>/gs) || [];
  for (const m of matches) {
    const text = m.replace(/<[^>]+>/g, '').trim();
    if (text) items.push(text);
  }
  return items;
}

const csvText = readFileSync(CSV_PATH, 'utf-8');
const rows = parseCSV(csvText);
const headers = rows[0];
console.log(`Found ${rows.length - 1} features`);

let created = 0;
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const post = {};
  headers.forEach((h, idx) => { post[h] = row[idx] || ''; });

  const slug = post['Slug'];
  const isDraft = post[':draft'] === 'true';
  const hasPage = post['Feature Page'] === 'true';
  const name = post['Feature Name'];
  const briefDesc = htmlToMarkdown(post['Feature Description (brief)']);
  const h1 = post['H1 (Hero Heading)'];
  const heroSub = post['Hero Subheading'];
  const longBody = post['Long Body'];
  const seoTitle = post['SEO Title'];
  const seoDesc = post['SEO Description'];
  const tags = post['Tags'] ? post['Tags'].split(',').map(t => t.trim()).filter(Boolean) : [];
  const order = parseInt(post['Order']) || 0;
  const bullets = parseBullets(post['Bullets']);
  const faq = [];
  for (let q = 1; q <= 3; q++) {
    const question = post[`FAQ Q${q}`];
    const answer = post[`FAQ A${q}`];
    if (question && answer) faq.push({ question, answer });
  }

  if (!slug || !name) { continue; }

  const markdown = htmlToMarkdown(longBody);

  const frontmatter = [
    '---',
    `slug: ${yamlStr(slug)}`,
    `name: ${yamlStr(name)}`,
    `description: ${yamlStr(briefDesc)}`,
    h1 ? `headline: ${yamlStr(h1)}` : null,
    heroSub ? `subheadline: ${yamlStr(heroSub)}` : null,
    seoTitle ? `seoTitle: ${yamlStr(seoTitle)}` : null,
    seoDesc ? `seoDescription: ${yamlStr(seoDesc)}` : null,
    `hasPage: ${hasPage}`,
    `draft: ${isDraft}`,
    `order: ${order}`,
    tags.length ? `tags: [${tags.map(t => yamlStr(t)).join(', ')}]` : 'tags: []',
    bullets.length ? `bullets:\n${bullets.map(b => `  - ${yamlStr(b)}`).join('\n')}` : null,
    faq.length ? `faq:\n${faq.map(f => `  - question: ${yamlStr(f.question)}\n    answer: ${yamlStr(f.answer)}`).join('\n')}` : null,
    '---',
  ].filter(Boolean).join('\n');

  const fileContent = frontmatter + '\n\n' + markdown + '\n';
  writeFileSync(join(OUTPUT_DIR, `${slug}.md`), fileContent, 'utf-8');
  created++;
}

console.log(`Done: ${created} features created`);
