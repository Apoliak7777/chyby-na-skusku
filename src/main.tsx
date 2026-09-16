import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import { App } from './App';
import './styles.css';

const koren = document.getElementById('root');
if (!koren) {
  throw new Error('Chýba prvok #root.');
}

createRoot(koren).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
