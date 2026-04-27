const fs = require('fs');
const path = require('path');

const files = ['index.html', 'carte.html', 'histoire.html', 'galerie.html', 'contact.html', 'site.webmanifest'];
const dir = 'C:/Users/PC/Desktop/projet_actu/Beldi_fusion7/beldi_site';

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace SVG favicon with PNG logo
    content = content.replace(/assets\/favicon\.svg/g, 'assets/logo-removebg.png');
    // Replace the type if it was image/svg+xml
    content = content.replace(/type="image\/svg\+xml"/g, 'type="image/png"');
    
    fs.writeFileSync(p, content);
    console.log('Updated favicon in ' + f);
  }
});
