import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/ibm-plex-sans/wght.css';
import '@fontsource/ibm-plex-mono/500.css';
import { App } from './App';
import { zapniPohyb } from './pohyb';
import './styles.css';
import './demo/demo.css';

const koren = document.getElementById('root');
if (!koren) {
  throw new Error('Chýba prvok #root.');
}

// Trieda „pohyb“ ešte pred prvým vykreslením, aby obsah pred odhalením neprebliknul (src/pohyb.ts).
zapniPohyb(document.documentElement, window);

createRoot(koren).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
