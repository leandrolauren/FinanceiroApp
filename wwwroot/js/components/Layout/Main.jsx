import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import HomePage from './HomePage'

const Main = ({ pageTitle, userName, csrfToken }) => {
  const [isToggled, setIsToggled] = useState(false)

  const handleToggle = () => {
    setIsToggled(!isToggled)
  }

  const handleLogout = async (e) => {
    try {
      e.preventDefault()
      const response = await fetch('/login/Logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          RequestVerificationToken: csrfToken,
        },
      })
      if (response.ok) {
        window.location.href = '/login'
      } else {
        console.error('Falha ao fazer logout no servidor.')
      }
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
            <Topbar
              pageTitle={pageTitle}
              userName={userName}
              handleLogout={handleLogout}
            />
            <div className="container-fluid">
              <Routes>
                <Route path="/login" element={<HomePage />} />
                {/* Adicione as rotas para as outras páginas aqui */}
                {/* Exemplo: <Route path="/Pessoas" element={<PessoasPage />} /> */}
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default Main
