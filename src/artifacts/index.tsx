import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DarkModeProvider } from './context/DarkModeContext'; // ⬅️ Импорт провайдера

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <DarkModeProvider> {/* ⬅️ Оборачиваем App */}
        <App />
      </DarkModeProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}
