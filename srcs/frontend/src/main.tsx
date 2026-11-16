import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './router';
import '@fontsource-variable/public-sans';

const rootElements = document.getElementById('root');
if (!rootElements) throw new Error('Element root not found');

createRoot(rootElements).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
