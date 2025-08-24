import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import Notifcacao from '../Shared/Notificacao'

import Sidebar from './Sidebar'
import Topbar from './Topbar'
import HomePage from './HomePage'
import ContaBancariaDataGrid from '../ContaBancaria/ContaBancariaDataGrid'
import CreateContaForm from '../ContaBancaria/CreateContaForm'
import EditContaForm from '../ContaBancaria/EditContaForm'
import Lancamentos from '../Lancamento/Lancamentos'
import PessoasDataGrid from '../Pessoa/PessoasDataGrid'
import PlanoContaDataGrid from '../PlanoConta/PlanoContaDataGrid'
import PessoaCreateForm from '../Pessoa/PessoaCreateForm'
import PessoaEditForm from '../Pessoa/PessoaEditForm'

const EditContaPage = () => {
  const { id } = useParams()
  return <EditContaForm contaId={id} />
}
const EditPessoaPage = () => {
  const { id } = useParams()
  return <PessoaEditForm pessoaId={id} />
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
      else console.error('Falha ao fazer logout no servidor.')
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
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/pessoas" element={<PessoasDataGrid />} />
                <Route path="/pessoas/create" element={<PessoaCreateForm />} />
                <Route path="/pessoas/edit/:id" element={<EditPessoaPage />} />
                <Route path="/planocontas" element={<PlanoContaDataGrid />} />
                <Route path="/contas" element={<ContaBancariaDataGrid />} />
                <Route path="/contas/create" element={<CreateContaForm />} />
                <Route path="/contas/edit/:id" element={<EditContaPage />} />
                <Route path="/lancamentos" element={<Lancamentos />} />
                <Route path="*" element={<h1>Página Não Encontrada</h1>} />
              </Routes>
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
