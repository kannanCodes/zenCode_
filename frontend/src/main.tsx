import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import { Toaster } from 'react-hot-toast';
import App from './App';

import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#111',
          color: '#fff',
          border: '1px solid #333',
        },
        success: {
          iconTheme: {
            primary: '#2D5FFF',
            secondary: '#fff',
          },
        },
      }}
    />
    </BrowserRouter>
  </Provider>
);