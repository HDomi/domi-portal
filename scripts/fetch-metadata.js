import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../config/projects.json');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'projects-metadata.json');

async function fetchMetadata(url) {
  console.log(`[Fetch] Scraping metadata from: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DomiPortalBot/1.0; +https://hdomi.github.io)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const root = parse(html);

    // Extract Title
    const ogTitle = root.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const twitterTitle = root.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const pageTitle = root.querySelector('title')?.text;
    const title = ogTitle || twitterTitle || pageTitle || url;

    // Extract Description
    const ogDescription = root.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const twitterDescription = root.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    const metaDescription = root.querySelector('meta[name="description"]')?.getAttribute('content');
    const description = ogDescription || twitterDescription || metaDescription || 'No description available.';

    // Extract Thumbnail / Image
    let ogImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content');
    const twitterImage = root.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    let image = ogImage || twitterImage || '';

    // Resolve relative image URL
    if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
      // Handle protocol-relative URLs
      if (image.startsWith('//')) {
        image = `https:${image}`;
      } else {
        try {
          image = new URL(image, url).href;
        } catch (e) {
          console.warn(`[Warning] Could not resolve image path: ${image} for site ${url}`);
        }
      }
    }

    // Extract keywords / tags
    const metaKeywords = root.querySelector('meta[name="keywords"]')?.getAttribute('content');
    const tags = metaKeywords ? metaKeywords.split(',').map(tag => tag.trim()) : [];

    // Extract domain name as site name if og:site_name is not available
    const ogSiteName = root.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    const siteName = ogSiteName || new URL(url).hostname;

    return {
      url,
      title: title.trim(),
      description: description.trim(),
      image,
      siteName,
      tags,
      scrapedAt: new Date().toISOString(),
      success: true
    };
  } catch (error) {
    console.error(`[Error] Failed to fetch ${url}:`, error.message);
    // Return fallback data so the build does not break
    const urlObj = new URL(url);
    const fallbackTitle = urlObj.pathname.replace(/^\/|\/$/g, '').split('/').pop() || urlObj.hostname;
    return {
      url,
      title: fallbackTitle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: '프로젝트 사이트에 접속할 수 없어 메타데이터를 불러오지 못했습니다.',
      image: '',
      siteName: urlObj.hostname,
      tags: ['Portfolio'],
      scrapedAt: new Date().toISOString(),
      success: false,
      error: error.message
    };
  }
}

async function run() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`[Error] Config file not found at ${CONFIG_PATH}`);
    process.exit(1);
  }

  const urls = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  console.log(`[Start] Found ${urls.length} URLs to process.`);

  const results = [];
  for (const url of urls) {
    const metadata = await fetchMetadata(url);
    results.push(metadata);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`[Success] Metadata saved to ${OUTPUT_PATH}`);
}

run();
