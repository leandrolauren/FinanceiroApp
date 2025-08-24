import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './Login';

const container = document.getElementById('login-root');
if (container) {
  const root = createRoot(container);
  root.render(<Login />);
}