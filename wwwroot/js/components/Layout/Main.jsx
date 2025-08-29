import React, { useState, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import Notifcacao from '../Shared/Notificacao'
import { Box, CircularProgress } from '@mui/material'

// Layout
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { Edit } from '@mui/icons-material'

// Pages e Componentes

// Home Page
const HomePage = lazy(() => import('./HomePage'))

// Pessoas
const PessoasDataGrid = lazy(() => import('../Pessoa/PessoasDataGrid'))
const PessoaCreateForm = lazy(() => import('../Pessoa/PessoaCreateForm'))
const PessoaEditForm = lazy(() => import('../Pessoa/PessoaEditForm'))
const EditPessoaPage = () => {
  const { id } = useParams()
  return <PessoaEditForm pessoaId={id} />
}

// Contas Bancárias
const ContaBancariaDataGrid = lazy(() =>
  import('../ContaBancaria/ContaBancariaDataGrid'),
)
const CreateContaForm = lazy(() => import('../ContaBancaria/CreateContaForm'))
const EditContaForm = lazy(() => import('../ContaBancaria/EditContaForm'))
const EditContaPage = () => {
  const { id } = useParams()
  return <EditContaForm contaId={id} />
}

// Lançamentos
const LancamentoDataGrid = lazy(() =>
  import('../Lancamento/LancamentosDataGrid'),
)
const LancamentoCreateForm = lazy(() =>
  import('../Lancamento/LancamentoCreateForm'),
)
const EditLancamentoForm = lazy(() =>
  import('../Lancamento/LancamentoEditForm'),
)
const EditLancamentoPage = () => {
  const { id } = useParams()
  return <EditLancamentoForm lancamentoId={id} />
}

// Planos de Contas
const PlanoContaDataGrid = lazy(() =>
  import('../PlanoConta/PlanoContaDataGrid'),
)
const PlanoContaCreateForm = lazy(() =>
  import('../PlanoConta/PlanoContaCreateForm'),
)
const PlanoContaEditForm = lazy(() =>
  import('../PlanoConta/PlanoContaEditForm'),
)
const EditPlanoContaPage = () => {
  const { id } = useParams()
  return <PlanoContaEditForm planoContaId={id} />
}

const App = () => {
  const { userName, csrfToken } = window.APP_DATA || {}
  const [isToggled, setIsToggled] = useState(false)
  const handleToggle = () => setIsToggled(!isToggled)

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/Login/Logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          RequestVerificationToken: csrfToken,
        },
      })
      if (response.ok) window.location.href = '/Login'
    } catch (error) {
      console.error('Erro ao fazer logout', error)
    }
  }

  return (
    <Router>
      <div id="wrapper" className={isToggled ? 'toggled' : ''}>
        <Sidebar isToggled={isToggled} handleToggle={handleToggle} />
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Topbar userName={userName} handleLogout={handleLogout} />
            <div className="container-fluid">
              <Suspense
                fallback={
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                }
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/pessoas" element={<PessoasDataGrid />} />
                  <Route
                    path="/pessoas/create"
                    element={<PessoaCreateForm />}
                  />
                  <Route
                    path="/pessoas/edit/:id"
                    element={<EditPessoaPage />}
                  />
                  <Route path="/planocontas" element={<PlanoContaDataGrid />} />
                  <Route
                    path="/planocontas/create"
                    element={<PlanoContaCreateForm />}
                  />
                  <Route
                    path="/planocontas/edit/:id"
                    element={<EditPlanoContaPage />}
                  />
                  <Route path="/contas" element={<ContaBancariaDataGrid />} />
                  <Route path="/contas/create" element={<CreateContaForm />} />
                  <Route path="/contas/edit/:id" element={<EditContaPage />} />

                  <Route path="/lancamentos" element={<LancamentoDataGrid />} />
                  <Route
                    path="/lancamentos/create"
                    element={<LancamentoCreateForm />}
                  />
                  <Route
                    path="/lancamentos/edit/:id"
                    element={<EditLancamentoPage />}
                  />
                  <Route path="*" element={<h1>Página Não Encontrada</h1>} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Router>
  )
}

const container = document.getElementById('main-app-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Notifcacao />
        <App />
      </SnackbarProvider>
    </React.StrictMode>,
  )
} else {
  console.error(
    'Elemento raiz "main-app-root" não encontrado no DOM. Verifique seu _Layout.cshtml.',
  )
}
