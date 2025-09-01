import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import Notifcacao from '../Shared/Notificacao';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { ptBR } from 'date-fns/locale/pt-BR';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

const HomePage = lazy(() => import('./HomePage'));

const PessoasDataGrid = lazy(() => import('../Pessoa/PessoasDataGrid'));
const PessoaCreateForm = lazy(() => import('../Pessoa/PessoaCreateForm'));
const PessoaEditForm = lazy(() => import('../Pessoa/PessoaEditForm'));
const EditPessoaPage = () => {
  const { id } = useParams();
  return <PessoaEditForm pessoaId={id} />;
};

const ContaBancariaDataGrid = lazy(() => import('../ContaBancaria/ContaBancariaDataGrid'));
const CreateContaForm = lazy(() => import('../ContaBancaria/CreateContaForm'));
const EditContaForm = lazy(() => import('../ContaBancaria/EditContaForm'));
const EditContaPage = () => {
  const { id } = useParams();
  return <EditContaForm contaId={id} />;
};

const LancamentoDataGrid = lazy(() => import('../Lancamento/LancamentosDataGrid'));
const LancamentoCreateForm = lazy(() => import('../Lancamento/LancamentoCreateForm'));
const EditLancamentoForm = lazy(() => import('../Lancamento/LancamentoEditForm'));
const EditLancamentoPage = () => {
  const { id } = useParams();
  return <EditLancamentoForm lancamentoId={id} />;
};

const PlanoContaDataGrid = lazy(() => import('../PlanoConta/PlanoContaDataGrid'));
const PlanoContaCreateForm = lazy(() => import('../PlanoConta/PlanoContaCreateForm'));
const PlanoContaEditForm = lazy(() => import('../PlanoConta/PlanoContaEditForm'));
const EditPlanoContaPage = () => {
  const { id } = useParams();
  return <PlanoContaEditForm planoContaId={id} />;
};

const drawerWidth = 240;

const App = () => {
  const { userName, csrfToken } = window.APP_DATA || {};
  const [isToggled, setIsToggled] = useState(() => {
  const savedState = localStorage.getItem('sidebarToggled');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarToggled', JSON.stringify(isToggled));
  }, [isToggled]);

  const handleToggle = () => setIsToggled(!isToggled);

  const handleLogout = async () => {
  try {
    const response = await fetch("/Login/Logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json().catch(() => null);
      console.log("Logout:", data);
      window.location.href = "/Login";
    } else {
      console.error("Erro ao deslogar:", response.status);
    }
  } catch (error) {
    console.error("Erro na requisição de logout:", error);
  }
};

  return (
    <Router>
      <CssBaseline />
      <Topbar
        isSidebarOpen={isToggled}
        handleSidebarToggle={handleToggle}
        userName={userName}
        handleLogout={handleLogout}
      />

      <Sidebar isToggled={isToggled} handleToggle={handleToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f4f6f8',
          minHeight: '100vh',
          transition: (theme) =>
            theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ml: (theme) => (isToggled ? `${drawerWidth}px` : theme.spacing(7)),
        }}
      >
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/pessoas" element={<PessoasDataGrid />} />
            <Route path="/pessoas/create" element={<PessoaCreateForm />} />
            <Route path="/pessoas/edit/:id" element={<EditPessoaPage />} />
            <Route path="/planocontas" element={<PlanoContaDataGrid />} />
            <Route path="/planocontas/create" element={<PlanoContaCreateForm />} />
            <Route path="/planocontas/edit/:id" element={<EditPlanoContaPage />} />
            <Route path="/contas" element={<ContaBancariaDataGrid />} />
            <Route path="/contas/create" element={<CreateContaForm />} />
            <Route path="/contas/edit/:id" element={<EditContaPage />} />
            <Route path="/lancamentos" element={<LancamentoDataGrid />} />
            <Route path="/lancamentos/create" element={<LancamentoCreateForm />} />
            <Route path="/lancamentos/edit/:id" element={<EditLancamentoPage />} />
            <Route path="*" element={<h1>Página Não Encontrada</h1>} />
          </Routes>
        </Suspense>
      </Box>
    </Router>
  );
};

const container = document.getElementById('main-app-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Notifcacao />
          <App />
        </SnackbarProvider>
      </LocalizationProvider>
    </React.StrictMode>
  );
} else {
  console.error(
    'Elemento raiz "main-app-root" não encontrado no DOM. Verifique seu _Layout.cshtml.'
  );
}
