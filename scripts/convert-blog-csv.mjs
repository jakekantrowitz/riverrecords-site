/**
 * One-time script to convert blog CSV export to Astro content collection markdown files.
 * Run with: node scripts/convert-blog-csv.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CSV_PATH = join(process.cwd(), 'reference', 'Blog Inner.csv');
const OUTPUT_DIR = join(process.cwd(), 'src', 'content', 'blog');

// Simple CSV parser that handles quoted fields with commas and newlines
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if (ch === '\n' && !inQuotes) {
      row.push(current);
      current = '';
      if (row.length > 1) rows.push(row);
      row = [];
    } else if (ch === '\r' && !inQuotes) {
      // skip
    } else {
      current += ch;
    }
  }
  if (current || row.length) {
    row.push(current);
    if (row.length > 1) rows.push(row);
  }
  return rows;
}

// Convert HTML to markdown (basic conversion)
function htmlToMarkdown(html) {
  if (!html) return '';

  let md = html;

  // Remove Framer data attributes
  md = md.replace(/\s*data-preset-tag="[^"]*"/g, '');

  // Headers — ensure newlines before and after
  md = md.replace(/<h2[^>]*><strong>(.*?)<\/strong><\/h2>/g, '\n\n## $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*><strong>(.*?)<\/strong><\/h3>/g, '\n\n### $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/g, '\n\n#### $1\n\n');

  // Bold and italic
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/g, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/g, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/g, '![]($1)');

  // Lists — each item on its own line
  md = md.replace(/<ul[^>]*>/g, '\n');
  md = md.replace(/<\/ul>/g, '\n');
  md = md.replace(/<ol[^>]*>/g, '\n');
  md = md.replace(/<\/ol>/g, '\n');
  md = md.replace(/<li[^>]*><p>(.*?)<\/p><\/li>/gs, '- $1\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gs, '- $1\n');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*><p>(.*?)<\/p><\/blockquote>/gs, '\n> $1\n');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gs, '\n> $1\n');

  // Tables - convert to markdown tables
  md = md.replace(/<figure><table>(.*?)<\/table><\/figure>/gs, (match, tableContent) => {
    const rows = [];
    const trMatches = tableContent.match(/<tr>(.*?)<\/tr>/gs) || [];
    for (const tr of trMatches) {
      const cells = [];
      const tdMatches = tr.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs) || [];
      for (const td of tdMatches) {
        const text = td.replace(/<[^>]+>/g, '').trim();
        cells.push(text);
      }
      rows.push(cells);
    }
    if (rows.length === 0) return '';
    let table = '| ' + rows[0].join(' | ') + ' |\n';
    table += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
    for (let i = 1; i < rows.length; i++) {
      table += '| ' + rows[i].join(' | ') + ' |\n';
    }
    return table;
  });

  // Paragraphs and breaks
  md = md.replace(/<br\s*\/?>/g, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gs, '$1\n\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Clean up
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

// Escape YAML strings
function yamlStr(s) {
  if (!s) return '""';
  if (s.includes(':') || s.includes('#') || s.includes("'") || s.includes('"') || s.includes('\n')) {
    return JSON.stringify(s);
  }
  return JSON.stringify(s);
}

// Main
const csvText = readFileSync(CSV_PATH, 'utf-8');
const rows = parseCSV(csvText);
const headers = rows[0];

console.log(`Found ${rows.length - 1} posts`);
console.log(`Headers: ${headers.join(', ')}`);

let created = 0;
let skipped = 0;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const post = {};
  headers.forEach((h, idx) => {
    post[h] = row[idx] || '';
  });

  const slug = post['Slug'];
  const isDraft = post[':draft'] === 'true';
  const title = post['Title'];
  const description = post['Short Describe'];
  const seoTitle = post['SEO Title'];
  const seoDescription = post['SEO Description'];
  const author = post['Author Name'] || 'River Records';
  const publishDate = post['Publish Date'] ? post['Publish Date'].split('T')[0] : '2024-01-01';
  const image = post['Image'] || '';
  const imageAlt = post['Image:alt'] || '';
  const content = post['Content'] || '';
  const featured = post['Featured'] === 'true';
  const tags = post['Tags'] ? post['Tags'].split(',').map(t => t.trim()).filter(Boolean) : [];
  const readTime = post['Read Time'] || '';

  if (!slug || !title) {
    console.log(`  Skipping row ${i}: no slug or title`);
    skipped++;
    continue;
  }

  const markdown = htmlToMarkdown(content);

  const frontmatter = [
    '---',
    `title: ${yamlStr(title)}`,
    `description: ${yamlStr(description)}`,
    seoTitle ? `seoTitle: ${yamlStr(seoTitle)}` : null,
    seoDescription ? `seoDescription: ${yamlStr(seoDescription)}` : null,
    `author: ${yamlStr(author)}`,
    `publishDate: ${yamlStr(publishDate)}`,
    image ? `image: ${yamlStr(image)}` : null,
    imageAlt ? `imageAlt: ${yamlStr(imageAlt)}` : null,
    `featured: ${featured}`,
    tags.length ? `tags: [${tags.map(t => yamlStr(t)).join(', ')}]` : 'tags: []',
    readTime ? `readTime: ${yamlStr(readTime)}` : null,
    isDraft ? 'draft: true' : 'draft: false',
    '---',
  ].filter(Boolean).join('\n');

  const fileContent = frontmatter + '\n\n' + markdown + '\n';
  const filePath = join(OUTPUT_DIR, `${slug}.md`);

  writeFileSync(filePath, fileContent, 'utf-8');
  created++;
}

console.log(`\nDone: ${created} posts created, ${skipped} skipped`);
