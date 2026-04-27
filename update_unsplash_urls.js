const fs = require('fs');
const path = require('path');

const files = ['index.html', 'carte.html', 'histoire.html', 'galerie.html'];
const dir = 'C:/Users/PC/Desktop/projet_actu/Beldi_fusion7/beldi_site';

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace broken Unsplash URLs with our new generated assets
    
    // 1. Medina sunset
    content = content.replace(/https:\/\/images\.unsplash\.com\/photo-1553603228-0f92a53ea4a2\?[^"'\s]+/g, 'assets/medina_sunset.png');
    
    // 2. Mint tea
    content = content.replace(/https:\/\/images\.unsplash\.com\/photo-1556679343-c1c1c9308a08\?[^"'\s]+/g, 'assets/mint_tea.png');
    
    // 3. Spices souk
    content = content.replace(/https:\/\/images\.unsplash\.com\/photo-1532336414038-cf19250c5757\?[^"'\s]+/g, 'assets/spices_souk.png');
    
    fs.writeFileSync(p, content);
    console.log('Updated images in ' + f);
  }
});
