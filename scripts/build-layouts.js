const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../frontend');
const PARTIALS_DIR = path.join(FRONTEND_DIR, 'partials');

const headerPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'header.html'), 'utf8');
const footerPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8');

const pages = [
  { file: 'index.html', navKey: 'home' },
  { file: 'visualize.html', navKey: 'visualize' },
  { file: 'optimize.html', navKey: 'optimize' },
  { file: 'socialize.html', navKey: 'socialize' }
];

pages.forEach(({ file, navKey }) => {
  const filePath = path.join(FRONTEND_DIR, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Customize active link state in header partial for this page
  let customizedHeader = headerPartial.replace(
    `data-nav="${navKey}"`,
    `data-nav="${navKey}" class="nav-logo-btn active" style="border-color: var(--burnt-copper); background: rgba(183, 65, 14, 0.2);"`
  );

  // Replace commented markers
  content = content.replace(
    /<!-- HEADER_START -->[\s\S]*?<!-- HEADER_END -->/,
    `<!-- HEADER_START -->\n${customizedHeader}\n<!-- HEADER_END -->`
  );

  content = content.replace(
    /<!-- FOOTER_START -->[\s\S]*?<!-- FOOTER_END -->/,
    `<!-- FOOTER_START -->\n${footerPartial}\n<!-- FOOTER_END -->`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[Layout Assembly] Updated ${file}`);
});