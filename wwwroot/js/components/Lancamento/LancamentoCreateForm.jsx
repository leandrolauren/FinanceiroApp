import { useState, useEffect } from 'react'

const API_PESSOAS = '/api/Pessoas/GetPessoas'
const API_PLANOS_CONTAS = '/api/PlanoContas/GetPlanoContas'
const API_CONTAS_BANCARIAS = '/api/Contas/GetContas'

const LancamentoCreateForm = ({ lancamentoId, onSave }) => {
  const [formData, setFormData] = useState({
    id: lancamentoId || 0,
    descricao: '',
    tipo: 'Receita',
    valor: '',
    dataCompetencia: '',
    dataVencimento: '',
    dataPagamento: '',
    pago: false,
    contaBancariaId: '',
    planoContasId: '',
    pessoaId: '',
  })

  const [pessoas, setPessoas] = useState([])
  const [planosContas, setPlanosContas] = useState([])
  const [contasBancarias, setContasBancarias] = useState([])

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [pessoasRes, planosRes, contasRes] = await Promise.all([
          fetch(API_PESSOAS).then((res) => res.json()),
          fetch(API_PLANOS_CONTAS).then((res) => res.json()),
          fetch(API_CONTAS_BANCARIAS).then((res) => res.json()),
        ])

        setPessoas(pessoasRes)
        setPlanosContas(planosRes)
        setContasBancarias(contasRes)
      } catch (error) {
        console.error('Erro ao buscar dependências:', error)
        window.__notificacao_erro = 'Erro ao carregar dados. Tente novamente.'
      }
    }

    const fetchLancamento = async () => {
      if (lancamentoId) {
        try {
          const response = await fetch(`/api/Lancamentos/${lancamentoId}`)
          if (!response.ok) throw new Error('Lançamento não encontrado.')
          const data = await response.json()

          setFormData({
            ...data,
            dataCompetencia: new Date(data.dataCompetencia)
              .toISOString()
              .slice(0, 10),
            dataVencimento: new Date(data.dataVencimento)
              .toISOString()
              .slice(0, 10),
            dataPagamento: data.dataPagamento
              ? new Date(data.dataPagamento).toISOString().slice(0, 10)
              : '',
            tipo: data.tipo,
          })
        } catch (error) {
          window.notificacao_erro = 'Erro ao carregar lançamento.'
        }
      }
    }

    fetchDependencies()
    fetchLancamento()
  }, [lancamentoId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = lancamentoId ? 'PUT' : 'POST'
    const url = lancamentoId ? `${API_BASE_URL}/${lancamentoId}` : API_BASE_URL

    const csrfToken = $('meta[name="csrf-token"]').attr('content')

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          RequestVerificationToken: csrfToken,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        window.__notificacao_sucesso = 'Lançamento alterado'
        onSave()
      } else {
        window.__notificacao_erro = 'Erro desconhecido.'
      }
    } catch (error) {
      window.__notificacao_erro = 'Ocorreu um erro na requisição.'
    }
  }

  useEffect(() => {
    $('.select2').select2({
      dropdownParent: $('.modal-content'),
    })

    $('.select2').on('change', (e) => {
      const { name } = e.target
      const value = $(e.target).val()
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }))
    })
  }, [pessoas, planosContas, contasBancarias])

  return (
    <form onSubmit={handleSubmit}>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Tipo</label>
          <select
            name="tipo"
            className="form-select"
            value={formData.tipo}
            onChange={handleChange}
            disabled={!!lancamentoId}
          >
            <option value="Receita">Receita</option>
            <option value="Despesa">Despesa</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Valor R$</label>
          <input
            type="number"
            step="0.01"
            name="valor"
            className="input"
            placeholder="0.00"
            value={formData.valor}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Descrição</label>
          <input
            type="text"
            name="descricao"
            className="input"
            placeholder="Descrição"
            value={formData.descricao}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Pessoa</label>
          <select
            name="pessoaId"
            className="form-select select2"
            value={formData.pessoaId}
            onChange={handleSelectChange}
          >
            <option value="">Selecione</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Plano de Contas</label>
          <select
            name="planoContasId"
            className="form-select select2"
            value={formData.planoContasId}
            onChange={handleSelectChange}
          >
            <option value="">Selecione</option>
            {planosContas.map((pc) => (
              <option key={pc.id} value={pc.id}>
                {pc.descricao}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Conta Bancária</label>
          <select
            name="contaBancariaId"
            className="form-select select2"
            value={formData.contaBancariaId}
            onChange={handleSelectChange}
          >
            <option value="">Selecione</option>
            {contasBancarias.map((cb) => (
              <option key={cb.id} value={cb.id}>
                {cb.descricao}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Data de Competência</label>
          <input
            type="date"
            name="dataCompetencia"
            className="input"
            value={formData.dataCompetencia}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Data de Vencimento</label>
          <input
            type="date"
            name="dataVencimento"
            className="input"
            value={formData.dataVencimento}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Pago</label>
          <select
            name="pago"
            className="form-select"
            value={formData.pago.toString()}
            onChange={handleChange}
          >
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Data de Pagamento</label>
          <input
            type="date"
            name="dataPagamento"
            className="input"
            value={formData.dataPagamento}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <button type="submit" className="btn btn-success me-2">
            Salvar
          </button>
          <a href="/Lancamentos" className="btn btn-secondary">
            Voltar
          </a>
        </div>
      </div>
    </form>
  )
}

export default LancamentoCreateForm
