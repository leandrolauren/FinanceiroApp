import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const EditContaForm = ({ contaId }) => {
  const [formData, setFormData] = useState({
    id: contaId,
    descricao: '',
    numeroConta: '',
    agencia: '',
    digitoAgencia: '',
    digitoConta: '',
    tipo: '',
    ativa: false,
    banco: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConta = async () => {
      try {
        const response = await fetch(`/api/Contas/${contaId}`)
        const data = await response.json()
        if (response.ok) {
          setFormData(data)
        } else {
          const eventoErro = new CustomEvent('onNotificacao', {
            detail: {
              mensagem: 'Erro ao carregar dados da conta.',
              variant: 'error',
            },
          })
          window.dispatchEvent(eventoErro)
        }
      } catch (error) {
        const eventoErro = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: 'Erro de rede ao carregar a conta.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoErro)
      } finally {
        setIsLoading(false)
      }
    }

    if (contaId) {
      fetchConta()
    }
  }, [contaId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/Contas/Edit/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const eventoSucesso = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: 'Conta bancária editada com sucesso!',
            variant: 'success',
          },
        })
        window.dispatchEvent(eventoSucesso)
        setTimeout(() => {
          window.location.href = '/Contas'
        }, 1500)
      } else {
        const result = await response.json()
        const eventoErro = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: result.message || 'Erro ao editar conta bancária.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoErro)
      }
    } catch (error) {
      const eventoErro = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Erro na requisição. Tente novamente.',
          variant: 'error',
        },
      })
      window.dispatchEvent(eventoErro)
    }
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="Id" value={formData.id} />
      <div className="row justify-content-center mb-3">
        <div className="col-auto text-center">
          <div className="container">
            <div className="tabs">
              <input
                className="form-check-input radio-1"
                type="radio"
                id="tipoCorrente"
                name="tipo"
                value="Corrente"
                checked={formData.tipo === 1 || formData.tipo === 'Corrente'}
                onChange={handleChange}
              />
              <label className="tab" htmlFor="tipoCorrente">
                Corrente
              </label>

              <input
                className="form-check-input radio-2"
                type="radio"
                id="tipoPoupanca"
                name="tipo"
                value="Poupanca"
                checked={formData.tipo === 2 || formData.tipo === 'Poupanca'}
                onChange={handleChange}
              />
              <label className="tab" htmlFor="tipoPoupanca">
                Poupança
              </label>

              <input
                className="form-check-input radio-3"
                type="radio"
                id="tipoSalario"
                name="tipo"
                value="Salario"
                checked={formData.tipo === 3 || formData.tipo === 'Salario'}
                onChange={handleChange}
              />
              <label className="tab" htmlFor="tipoSalario">
                Salário
              </label>

              <input
                className="form-check-input radio-4"
                type="radio"
                id="tipoInvestimento"
                name="tipo"
                value="Investimento"
                checked={
                  formData.tipo === 4 || formData.tipo === 'Investimento'
                }
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
          <label htmlFor="descricao" className="control-label">
            Descrição
          </label>
          <input
            type="text"
            className="input"
            id="descricao"
            name="descricao"
            value={formData.descricao || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col md-4">
          <label htmlFor="numeroConta" className="control-label">
            Número da Conta
          </label>
          <input
            type="text"
            className="input"
            id="numeroConta"
            name="numeroConta"
            value={formData.numeroConta || ''}
            onChange={handleChange}
          />
        </div>
        <div className="col md-4">
          <label htmlFor="digitoConta" className="control-label">
            Digito Conta
          </label>
          <input
            type="text"
            className="input"
            id="digitoConta"
            name="digitoConta"
            value={formData.digitoConta || ''}
            onChange={handleChange}
            maxLength="2"
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col md-2">
          <label htmlFor="agencia" className="control-label">
            Agência
          </label>
          <input
            type="text"
            className="input"
            id="agencia"
            name="agencia"
            value={formData.agencia || ''}
            onChange={handleChange}
          />
        </div>
        <div className="col md-2">
          <label htmlFor="digitoAgencia" className="control-label">
            Digito Agência
          </label>
          <input
            type="text"
            className="input"
            id="digitoAgencia"
            name="digitoAgencia"
            value={formData.digitoAgencia || ''}
            onChange={handleChange}
          />
        </div>
        <div className="col md-2">
          <label htmlFor="banco" className="control-label">
            Banco
          </label>
          <input
            type="text"
            className="input"
            id="banco"
            name="banco"
            value={formData.banco || ''}
            onChange={handleChange}
          />
        </div>
        <div className="col md-2 form-check">
          <label className="form-check-label" htmlFor="Ativa">
            Conta Ativa?
          </label>
          <br></br>
          <input
            type="checkbox"
            className="form-check-input"
            id="ativa"
            name="ativa"
            checked={formData.ativa}
            onChange={handleCheckboxChange}
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

const rootElement = document.getElementById('edit-conta-form-root')
if (rootElement) {
  const contaId = parseInt(rootElement.dataset.contaId, 10)
  const root = ReactDOM.createRoot(rootElement)
  root.render(<EditContaForm contaId={contaId} />)
}
