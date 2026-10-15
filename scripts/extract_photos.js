const fs = require('fs');

const text = fs.readFileSync('C:/Users/AlejandroSerranoCalv/.gemini/antigravity/brain/a3180bf1-fc8a-4003-b875-a2f28401f92d/.system_generated/steps/216/content.md', 'utf8');

const regex = /<img[^>]+src=["'](https:\/\/d1dpu3msttfsqg\.cloudfront\.net\/[^"'_]+)[^"']*["'][^>]*alt=["']([^"']+)["']/g;
let match;
const results = [];
while ((match = regex.exec(text)) !== null) {
  if (!match[2].includes('Vero logo') && !match[2].includes('Background image')) {
    results.push({
      url: match[1],
      alt: match[2].trim()
    });
  }
}

console.log(JSON.stringify(results, null, 2));

