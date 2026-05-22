import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './engine/digitSpan';
import './engine/corsiBlock';
import './engine/patternMatrix';
import './engine/nBack';

import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
