import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Tabs,
  Tab,
  Spinner,
  Select,
  SelectItem,
} from '@heroui/react'
import { Autocomplete, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { NumericFormat } from 'react-number-format'
import axios from 'axios'

// Icons
const SaveIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)
const ArrowBackIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 12H5" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const API_PESSOAS = '/api/pessoas'
const API_PLANOS_CONTAS = '/api/planoContas/hierarquia'
const API_CONTAS_BANCARIAS = '/api/contas'

const getLeafNodes = (nodes) => {
  let leafNodes = []

  if (!Array.isArray(nodes)) return leafNodes
  nodes.forEach((node) => {
    if (!node.filhos || node.filhos.length === 0) {
      leafNodes.push(node)
    } else {
      leafNodes = leafNodes.concat(getLeafNodes(node.filhos))
    }
  })
  return leafNodes
}

const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return null
  }
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

const initialFormState = {
  descricao: '',
  tipo: '2', // Despesa
  valor: '',
  dataCompetencia: new Date(),
  dataVencimento: new Date(),
  dataPagamento: null,
  pago: false,
  contaBancariaId: '',
  planoContasId: '',
  pessoaId: '',
}

const LancamentoCreateForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormState)
  const [pessoas, setPessoas] = useState([])
  const [planosContas, setPlanosContas] = useState([])
  const [contasBancarias, setContasBancarias] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchDependencies = async () => {
      setPageLoading(true)
      try {
        const [pessoasRes, planosRes, contasRes] = await axios.all([
          axios.get(API_PESSOAS),
          axios.get(API_PLANOS_CONTAS),
          axios.get(API_CONTAS_BANCARIAS),
        ])
        setPessoas(pessoasRes.data || [])
        setPlanosContas(planosRes.data || [])
        setContasBancarias(contasRes.data.data || [])
      } catch (error) {
        console.error('Erro ao buscar dependências:', error)
        showNotification('Erro ao carregar dados de apoio.', 'error')
      } finally {
        setPageLoading(false)
      }
    }

    fetchDependencies()
  }, [])

  const handleValueChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.pago && !formData.dataPagamento) {
      setErrors((prev) => ({
        ...prev,
        DataPagamento: ['A Data de Pagamento é obrigatória.'],
      }))
      showNotification('A Data de Pagamento é obrigatória.', 'warning')
      return
    }

    setLoading(true)
    setErrors({})

    const dados = {
      ...formData,
      tipo: formData.tipo === '1' ? 'R' : 'D',
      planoContasId: formData.planoContasId || null,
      contaBancariaId: formData.contaBancariaId || null,
      pessoaId: formData.pessoaId || null,
      dataPagamento: formatDate(formData.dataPagamento),
      dataCompetencia: formatDate(formData.dataCompetencia),
      dataVencimento: formatDate(formData.dataVencimento),
    }

    try {
      await axios.post('/api/lancamentos', dados)
      showNotification('Lançamento cadastrado com sucesso!', 'success')
      setFormData(initialFormState)
      window.dispatchEvent(new CustomEvent('lancamentosAtualizados'))
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error)
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data.errors || {})
        showNotification(
          error.response.data.message ||
            'Por favor, corrija os erros no formulário.',
          'warning',
        )
      } else {
        showNotification(
          error.response?.data?.message || 'Erro ao salvar o lançamento.',
          'error',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const planosDeContaFilhos = useMemo(() => {
    return getLeafNodes(
      planosContas.filter((p) => p.tipo.toString() === formData.tipo),
    )
  }, [planosContas, formData.tipo])

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Carregando..." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 rounded-lg shadow-sm text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Novo Lançamento</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs
          aria-label="Tipo de Lançamento"
          selectedKey={formData.tipo}
          onSelectionChange={(key) => handleValueChange('tipo', key)}
          color="primary"
          radius="md"
        >
          <Tab key="1" title="Receita" />
          <Tab key="2" title="Despesa" />
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
          <Input
            className="md:col-span-4"
            label="Descrição"
            value={formData.descricao}
            onValueChange={(v) => handleValueChange('descricao', v)}
            isRequired
            isInvalid={!!errors.Descricao}
            errorMessage={errors.Descricao?.[0]}
          />
          <NumericFormat
            className="md:col-span-2"
            name="valor"
            label="Valor (R$)"
            value={formData.valor}
            customInput={TextField}
            fullWidth
            onValueChange={(values) => {
              handleValueChange('valor', values.floatValue || '')
            }}
            prefix={'R$ '}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            required
            error={!!errors.Valor}
            helperText={errors.Valor?.[0]}
          />

          <div className="md:col-span-2">
            <Autocomplete
              options={pessoas}
              getOptionLabel={(option) => option.nome || ''}
              value={pessoas.find((p) => p.id === formData.pessoaId) || null}
              onChange={(event, newValue) => {
                handleValueChange('pessoaId', newValue ? newValue.id : '')
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pessoa (Cliente/Fornecedor)"
                  error={!!errors.PessoaId}
                  helperText={errors.PessoaId?.[0]}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <Autocomplete
              options={planosDeContaFilhos}
              getOptionLabel={(option) => option.descricao || ''}
              value={
                planosDeContaFilhos.find(
                  (p) => p.id === formData.planoContasId,
                ) || null
              }
              onChange={(event, newValue) => {
                handleValueChange('planoContasId', newValue ? newValue.id : '')
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Plano de Contas"
                  required
                  error={!!errors.PlanoContasId}
                  helperText={errors.PlanoContasId?.[0]}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <Autocomplete
              options={contasBancarias}
              getOptionLabel={(option) => option.descricao || ''}
              value={
                contasBancarias.find(
                  (c) => c.id === formData.contaBancariaId,
                ) || null
              }
              onChange={(event, newValue) => {
                handleValueChange(
                  'contaBancariaId',
                  newValue ? newValue.id : '',
                )
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={formData.pago ? 'Conta Bancária *' : 'Conta Bancária'}
                  error={!!errors.ContaBancariaId}
                  required={formData.pago}
                  helperText={errors.ContaBancariaId?.[0]}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <DatePicker
              label="Data de Competência"
              value={formData.dataCompetencia}
              onChange={(date) => handleValueChange('dataCompetencia', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.DataCompetencia}
                  helperText={errors.DataCompetencia?.[0] || ''}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <DatePicker
              label="Data de Vencimento"
              value={formData.dataVencimento}
              onChange={(date) => handleValueChange('dataVencimento', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.DataVencimento}
                  helperText={errors.DataVencimento?.[0] || ''}
                />
              )}
            />
          </div>

          <Select
            className="md:col-span-1"
            label="Situação"
            selectedKeys={[String(formData.pago)]}
            onSelectionChange={(keys) =>
              handleValueChange('pago', Array.from(keys)[0] === 'true')
            }
          >
            <SelectItem key="false">Em Aberto</SelectItem>
            <SelectItem key="true">Pago</SelectItem>
          </Select>

          <div className="md:col-span-1">
            <DatePicker
              label={
                formData.pago ? 'Data de Pagamento *' : 'Data de Pagamento'
              }
              value={formData.dataPagamento}
              onChange={(date) => handleValueChange('dataPagamento', date)}
              disabled={!formData.pago}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required={formData.pago}
                  fullWidth
                  error={
                    !!errors.DataPagamento ||
                    (formData.pago && !formData.dataPagamento)
                  }
                  helperText={
                    errors.DataPagamento?.[0] ||
                    (formData.pago && !formData.dataPagamento
                      ? 'Campo obrigatório.'
                      : '')
                  }
                />
              )}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            color="primary"
            isDisabled={loading}
            startIcon={
              loading ? <Spinner color="current" size="sm" /> : <SaveIcon />
            }
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            variant="bordered"
            onClick={() => navigate('/lancamentos')}
            startIcon={<ArrowBackIcon />}
          >
            Voltar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default LancamentoCreateForm
