const fs = require('fs');
const path = require('path');

const files = ['index.html', 'carte.html', 'histoire.html', 'galerie.html', 'contact.html', 'partials/footer.html'];
const dir = 'C:/Users/PC/Desktop/projet_actu/Beldi_fusion7/beldi_site';

const ribbonHTML = `
  <div class="ribbon-container">
    <div class="ribbon-content">
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
    </div>
  </div>`;

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Inject ribbon if not present
    if (!content.includes('ribbon-container')) {
      content = content.replace(/<footer class="site-footer">/g, `<footer class="site-footer">${ribbonHTML}`);
    }
    
    // Update logo in foot-brand
    content = content.replace(/(<div class="foot-brand">[\s\S]*?)<img[^>]*>/, `$1<img src="assets/logo-removebg.png" alt="Beldi Fusion" />\n      <p class="brand-word">Beldi Fusion</p>`);
    
    fs.writeFileSync(p, content);
    console.log('Updated footer in ' + f);
  }
});
