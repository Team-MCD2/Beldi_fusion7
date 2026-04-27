const fs = require('fs');
const path = require('path');

const files = ['index.html', 'carte.html', 'histoire.html', 'galerie.html', 'contact.html', 'partials/header.html'];
const dir = 'C:/Users/PC/Desktop/projet_actu/Beldi_fusion7/beldi_site';

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace logo ONLY in the brand block
    content = content.replace(/(<a[^>]*class="brand"[^>]*>[\s\S]*?)assets\/logo-beldi\.png([\s\S]*?<\/a>)/gi, '$1assets/logo-removebg.png$2');
    
    // Pattern 1: With one inner span
    const pattern1 = /[ \t]*<span class="brand-text"[^>]*>\s*<span class="brand-sub">[^<]*<\/span>\s*<\/span>[ \t]*\n?/g;
    content = content.replace(pattern1, '');

    // Pattern 2: With two inner spans
    const pattern2 = /[ \t]*<span class="brand-text"[^>]*>\s*<span class="brand-name">[^<]*<\/span>\s*<span class="brand-sub">[^<]*<\/span>\s*<\/span>[ \t]*\n?/g;
    content = content.replace(pattern2, '');

    fs.writeFileSync(p, content);
    console.log('Updated ' + f);
  }
});
