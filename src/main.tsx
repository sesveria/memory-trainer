import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Side-effect imports to auto-register all training modes
import './engine/digitSpan';
import './engine/corsiBlock';

import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
