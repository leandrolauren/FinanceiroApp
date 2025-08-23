import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'

const CreateContaForm = () => {
  const [formData, setFormData] = useState({
    Descricao: '',
    NumeroConta: '',
    DigitoConta: '',
    Agencia: '',
    DigitoAgencia: '',
    Banco: '',
    Tipo: 'Corrente',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/contas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        window.__notificacao_sucesso = 'Conta bancária cadastrada com sucesso!'
        setTimeout(() => {
          window.location.href = '/Contas'
        }, 2000)
      } else {
        window.__notificacao_erro = 'Erro ao cadastrar conta bancária.'
        console.error(result.message || result.errors.join(', '))
      }
    } catch (error) {
      windows.__notificacao_erro = 'Erro na requisição. Tente novamente.'
      console.error('Error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row justify-content-center mb-3">
        <div className="col-auto text-center">
          <div className="container">
            <div className="tabs">
              <input
                className="form-check-input radio-1"
                type="radio"
                id="tipoCorrente"
                name="Tipo"
                value="Corrente"
                checked={formData.Tipo === 'Corrente'}
                onChange={handleChange}
              />
              <label className="tab" htmlFor="tipoCorrente">
                Corrente
              </label>

              <input
                className="form-check-input radio-2"
                type="radio"
                id="tipoPoupanca"
                name="Tipo"
                value="Poupanca"
                checked={formData.Tipo === 'Poupanca'}
                onChange={handleChange}
              />
              <label className="tab" htmlFor="tipoPoupanca">
                Poupança
              </label>

              <input
                className="form-check-input radio-3"
                type="radio"
                id="tipoSalario"
                name="Tipo"
                value="Salario"
                checked={formData.Tipo === 'Salario'}
                onChange={handleChange}
              />
              <label className="tab" htmlFor="tipoSalario">
                Salário
              </label>

              <input
                className="form-check-input radio-4"
                type="radio"
                id="tipoInvestimento"
                name="Tipo"
                value="Investimento"
                checked={formData.Tipo === 'Investimento'}
                onChange={handleChange}
              />
              <label className="tab" htmlFor="tipoInvestimento">
                Investimento
              </label>
              <span className="glider"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col md-4">
          <label htmlFor="Descricao" className="control-label">
            Descrição
          </label>
          <input
            type="text"
            className="input"
            id="Descricao"
            name="Descricao"
            value={formData.Descricao}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col md-4">
          <label htmlFor="NumeroConta" className="control-label">
            Número da Conta
          </label>
          <input
            type="text"
            className="input"
            id="NumeroConta"
            name="NumeroConta"
            value={formData.NumeroConta}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col md-4">
          <label htmlFor="DigitoConta" className="control-label">
            Digito Conta
          </label>
          <input
            type="text"
            className="input"
            id="DigitoConta"
            name="DigitoConta"
            value={formData.DigitoConta}
            onChange={handleChange}
            maxLength="2"
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col md-2">
          <label htmlFor="Agencia" className="control-label">
            Agência
          </label>
          <input
            type="text"
            className="input"
            id="Agencia"
            name="Agencia"
            value={formData.Agencia}
            onChange={handleChange}
          />
        </div>
        <div className="col md-2">
          <label htmlFor="DigitoAgencia" className="control-label">
            Digito Agência
          </label>
          <input
            type="text"
            className="input"
            id="DigitoAgencia"
            name="DigitoAgencia"
            value={formData.DigitoAgencia}
            onChange={handleChange}
          />
        </div>
        <div className="col md-2">
          <label htmlFor="Banco" className="control-label">
            Banco
          </label>
          <input
            type="text"
            className="input"
            id="Banco"
            name="Banco"
            value={formData.Banco}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-success">
        Salvar
      </button>
      <a href="/Contas" className="btn btn-secondary ms-2">
        Voltar
      </a>
    </form>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('create-conta-form-root'),
)
root.render(<CreateContaForm />)
