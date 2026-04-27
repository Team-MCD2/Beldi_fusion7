const fs = require('fs');
const path = require('path');

const files = ['index.html', 'carte.html', 'histoire.html', 'galerie.html', 'contact.html', 'partials/footer.html'];
const dir = 'C:/Users/PC/Desktop/projet_actu/Beldi_fusion7/beldi_site';

const newFooterHTML = `
<footer class="site-footer">
  <div class="ribbon-container">
    <div class="ribbon-content">
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
      <span>Expérience Sensorielle • Beldi Fusion • Tradition & Modernité • Gastronomie Marocaine •</span>
    </div>
  </div>

  <!-- haut -->
  <div class="container new-footer-grid">
    <div class="foot-col brand-col">
      <a href="index.html" class="foot-brand-link">
        <img src="assets/logo-removebg.png" alt="Beldi Fusion" width="64" height="64" class="foot-logo" />
        <span class="brand-word">Beldi Fusion</span>
      </a>
      <p class="foot-tag">
        Spécialiste de la cuisine marocaine fusion à Toulouse. Préparé à la main, servi avec le sourire.
      </p>
      <div class="socials-icons">
        <a href="https://www.facebook.com/beldifusion/" aria-label="Facebook" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V15h-2V12h2V9.8c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.3V12h2.3l-.4 3h-1.9v6.9A10 10 0 0 0 22 12z"/></svg>
        </a>
        <a href="https://www.instagram.com/beldifusion/" aria-label="Instagram" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
        <a href="https://www.ubereats.com/fr/store/beldi-fusion/zv_XVakERyOHkfo-otfydA" aria-label="Uber Eats" target="_blank" rel="noopener" style="font-family:var(--font-display); font-size:11px; font-weight:bold;">
          UE
        </a>
      </div>
    </div>

    <div class="foot-col nav-col">
      <p class="foot-title">Navigation</p>
      <ul class="foot-nav">
        <li><a href="index.html">Accueil</a></li>
        <li><a href="carte.html">La carte</a></li>
        <li><a href="histoire.html">Notre histoire</a></li>
        <li><a href="galerie.html">Galerie</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </div>

    <div class="foot-col contact-col">
      <p class="foot-title">Le resto</p>
      <address>
        43 avenue de Muret<br />
        31300 Toulouse<br />
        <a href="tel:0532029413">05 32 02 94 13</a><br />
        <a href="mailto:contact@beldifusion.fr">contact@beldifusion.fr</a>
      </address>
    </div>

    <div class="foot-col hours-col">
      <p class="foot-title">Horaires</p>
      <ul class="foot-hours-list">
        <li><span>Lun - Jeu</span><span>9h - 23h59</span></li>
        <li><span>Vendredi</span><span>9h - 2h</span></li>
        <li><span>Samedi</span><span>9h - 3h</span></li>
        <li><span>Dimanche</span><span>9h - 23h59</span></li>
      </ul>
    </div>
  </div>

  <!-- bas -->
  <div class="footer-bottom">
    <div class="container flex-between">
      <p>&copy; <span data-year></span> BELDI FUSION TOULOUSE — Tous droits réservés.</p>
      <p class="legal-links">
        <a href="#">Mentions légales</a>
        <a href="#">Confidentialité</a>
        <a href="#">Cookies</a>
      </p>
    </div>
  </div>

  <!-- Signature agence -->
  <div class="footer-agency">
    <div class="container flex-center">
      <span>Développé par</span>
      <a href="https://microdidact.com/" target="_blank" rel="noopener" class="agency-link" aria-label="Microdidact - Agence Web">
        Microdidact
        <svg class="agency-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 17L17 7M8 7h9v9"/>
        </svg>
      </a>
    </div>
  </div>
</footer>`;

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace the entire footer
    content = content.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, newFooterHTML.trim());
    
    fs.writeFileSync(p, content);
    console.log('Replaced footer in ' + f);
  }
});
