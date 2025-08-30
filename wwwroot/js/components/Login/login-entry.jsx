import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './Login';
import { SnackbarProvider } from 'notistack'
import Notifcacao from '../Shared/Notificacao'

const container = document.getElementById('login-root');
if (container) {
  const root = createRoot(container);
  root.render(
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Notifcacao />
    <Login />
  </SnackbarProvider>);
}