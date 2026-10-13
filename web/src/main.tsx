import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import App from '@/app/App';
import { isEnvBrowser } from '@/utils/misc';
import ErrorBoundary from '@/providers/errorBoundary';

if (isEnvBrowser()) {
  const root = document.getElementById('root');

  // https://i.imgur.com/iPTAdYV.png - Night time img
  root!.style.backgroundImage = 'url("https://cdn.discordapp.com/attachments/1314312680600764487/1558906707709657210/image.png?ex=6acfc782&is=6ace7602&hm=1a7a280026fde4347830d3dadbc5c05b7213a232f7406c275e34c4e30cdcd9aa&")';
  root!.style.backgroundSize = 'cover';
  root!.style.backgroundRepeat = 'no-repeat';
  root!.style.backgroundPosition = 'center';
}

const root = document.getElementById('root');

createRoot(root!).render(
  <StrictMode>
    <ErrorBoundary> {/* Catches JS errors without hiding UI and keeps the app running */}
      <App />
    </ErrorBoundary>
  </StrictMode>
);