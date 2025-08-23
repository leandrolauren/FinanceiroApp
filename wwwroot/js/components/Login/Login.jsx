import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        window.location.href = '/home'
      } else {
        const errorData = await response.json()
        const eventoErro = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: errorData.message || 'E-mail ou senha inválidos.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoErro)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      const eventoErro = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Não foi possível conectar ao servidor. Tente novamente.',
          variant: 'error',
        },
      })
      window.dispatchEvent(eventoErro)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="vh-100 mt-5">
      <div className="container-fluid h-custom">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-9 col-lg-6 col-xl-5">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="img-fluid"
              alt="Sample image"
            />
          </div>
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <form onSubmit={handleSubmit}>
              <div className="form-outline mb-4">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  id="email"
                  className="form-control form-control-lg"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-outline mb-3">
                <label className="form-label" htmlFor="senha">
                  Senha
                </label>
                <input
                  name="senha"
                  type="password"
                  id="senha"
                  className="form-control form-control-lg"
                  placeholder="Digite a senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <a href="#!" className="text-body">
                  Esqueceu a senha?
                </a>
              </div>

              <div className="text-center text-lg-start mt-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <p className="small fw-bold mt-2 pt-1 mb-0">
                  Não tem uma conta?{' '}
                  <a href="/Usuario/Create" className="link-danger">
                    Cadastre-se
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

// Renderiza o componente na div com id 'login-root'
const rootElement = document.getElementById('login-root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(<Login />)
}

export default Login
