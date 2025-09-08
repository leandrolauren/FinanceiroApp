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
import { I18nProvider } from '@react-aria/i18n'
import { DatePicker } from '@heroui/react'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { Autocomplete, TextField, Alert } from '@mui/material'
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

const LancamentoEditForm = ({ lancamentoId }) => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(null)
  const [pessoas, setPessoas] = useState([])
  const [planosContas, setPlanosContas] = useState([])
  const [contasBancarias, setContasBancarias] = useState([])
  const [loading, setLoading] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [isPago, setIsPago] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pessoasRes, planosRes, contasRes, lancamentoRes] =
          await axios.all([
            axios.get(API_PESSOAS),
            axios.get(API_PLANOS_CONTAS),
            axios.get(API_CONTAS_BANCARIAS),
            axios.get(`/api/lancamentos/${lancamentoId}`),
          ])

        setPessoas(pessoasRes.data || [])
        setPlanosContas(planosRes.data || [])
        setContasBancarias(contasRes.data.data || [])

        const lancamento = lancamentoRes.data.data
        setIsPago(lancamento.pago)

        setFormData({
          descricao: lancamento.descricao,
          tipo: lancamento.tipo === 'Receita' ? '1' : '2',
          valor: lancamento.valor,
          dataCompetencia: lancamento.dataCompetencia
            ? new Date(lancamento.dataCompetencia)
            : null,
          dataVencimento: lancamento.dataVencimento
            ? new Date(lancamento.dataVencimento)
            : null,
          dataPagamento: lancamento.dataPagamento
            ? new Date(lancamento.dataPagamento)
            : null,
          pago: lancamento.pago,
          contaBancariaId: lancamento.contaBancaria?.id || '',
          planoContasId: lancamento.planoContas?.id || '',
          pessoaId: lancamento.pessoa?.id || '',
        })
      } catch (error) {
        showNotification('Erro ao carregar dados para edição.', 'error')
        navigate('/lancamentos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lancamentoId, navigate])

  const handleValueChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isPago) return

    if (formData.pago && !formData.dataPagamento) {
      setErrors((prev) => ({
        ...prev,
        DataPagamento: ['A Data de Pagamento é obrigatória.'],
      }))
      showNotification('A Data de Pagamento é obrigatória.', 'warning')
      setFormSubmitting(false)
      return
    }

    setFormSubmitting(true)
    setErrors({})

    const dados = {
      ...formData,
      tipo: formData.tipo === '1' ? 'R' : 'D',
      planoContasId: formData.planoContasId || null,
      contaBancariaId: formData.contaBancariaId || null,
      pessoaId: formData.pessoaId || null,
      dataPagamento: formData.pago ? formatDate(formData.dataPagamento) : null,
      dataCompetencia: formatDate(formData.dataCompetencia),
      dataVencimento: formatDate(formData.dataVencimento),
    }

    try {
      await axios.put(`/api/lancamentos/${lancamentoId}`, dados)
      showNotification('Lançamento atualizado com sucesso!', 'success')
      if (dados.pago) {
        window.dispatchEvent(new CustomEvent('lancamentoAtualizado'))
      }
      navigate('/lancamentos')
    } catch (error) {
      if (error.response && error.response.data) {
        showNotification(
          error.response.data.message || 'Ocorreu um erro.',
          'error',
        )
        if (error.response.status === 400) {
          setErrors(error.response.data.errors || {})
        }
      } else {
        showNotification(
          'Erro de comunicação ao atualizar o lançamento.',
          'error',
        )
      }
    } finally {
      setFormSubmitting(false)
    }
  }

  const planosDeContaFilhos = useMemo(() => {
    if (!formData) return []
    return getLeafNodes(
      planosContas.filter((p) => p.tipo.toString() === formData.tipo),
    )
  }, [planosContas, formData])

  if (loading || !formData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Carregando..." />
      </div>
    )
  }

  return (
    <I18nProvider locale="pt-BR">
      <div className="p-4 md:p-6 rounded-lg shadow-sm text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-semibold mb-6">Editar Lançamento</h1>

        {isPago && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Este lançamento está pago e não pode ser editado. Para fazer
            alterações, você deve primeiro estornar o pagamento na tela de
            listagem.
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs
            aria-label="Tipo de Lançamento"
            selectedKey={formData.tipo}
            onSelectionChange={(key) => handleValueChange('tipo', key)}
            color="primary"
            radius="md"
            isDisabled={true} // Tipo desabilitado na edição
          >
            <Tab key="1" title="Receita" />
            <Tab key="2" title="Despesa" />
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
            <Input
              className="md:col-span-4"
              name="descricao"
              label="Descrição"
              value={formData.descricao}
              onValueChange={(v) => handleValueChange('descricao', v)}
              required
              error={!!errors.Descricao}
              helperText={errors.Descricao?.[0]}
              disabled={isPago}
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
              disabled={isPago}
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
                    required
                  />
                )}
                disabled={isPago}
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
                  handleValueChange(
                    'planoContasId',
                    newValue ? newValue.id : '',
                  )
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
                disabled={isPago}
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
                    label={
                      formData.pago ? 'Conta Bancária *' : 'Conta Bancária'
                    }
                    error={!!errors.ContaBancariaId}
                    required={formData.pago}
                    helperText={errors.ContaBancariaId?.[0]}
                  />
                )}
                disabled={isPago}
              />
            </div>

            <div className="md:col-span-2">
              <DatePicker
                label="Data de Competência"
                value={
                  formData.dataCompetencia
                    ? parseDate(
                        formData.dataCompetencia.toISOString().split('T')[0],
                      )
                    : null
                }
                onChange={(d) =>
                  handleValueChange(
                    'dataCompetencia',
                    d ? d.toDate(getLocalTimeZone()) : null,
                  )
                }
                isRequired
                isInvalid={!!errors.DataCompetencia}
                errorMessage={errors.DataCompetencia?.[0]}
                disabled={isPago}
              />
            </div>

            <div className="md:col-span-2">
              <DatePicker
                label="Data de Vencimento"
                value={
                  formData.dataVencimento
                    ? parseDate(
                        formData.dataVencimento.toISOString().split('T')[0],
                      )
                    : null
                }
                onChange={(d) =>
                  handleValueChange(
                    'dataVencimento',
                    d ? d.toDate(getLocalTimeZone()) : null,
                  )
                }
                isRequired
                isInvalid={!!errors.DataVencimento}
                errorMessage={errors.DataVencimento?.[0]}
                disabled={isPago}
              />
            </div>

            <Select
              className="md:col-span-1"
              label="Situação"
              selectedKeys={[String(formData.pago)]}
              onSelectionChange={(keys) =>
                handleValueChange('pago', Array.from(keys)[0] === 'true')
              }
              isDisabled={isPago}
            >
              <SelectItem key="false">Em Aberto</SelectItem>
              <SelectItem key="true">Pago</SelectItem>
            </Select>

            <div className="md:col-span-1">
              <DatePicker
                label={
                  formData.pago ? 'Data de Pagamento *' : 'Data de Pagamento'
                }
                value={
                  formData.dataPagamento
                    ? parseDate(
                        formData.dataPagamento.toISOString().split('T')[0],
                      )
                    : null
                }
                onChange={(d) =>
                  handleValueChange(
                    'dataPagamento',
                    d ? d.toDate(getLocalTimeZone()) : null,
                  )
                }
                isDisabled={!formData.pago || isPago}
                isRequired={formData.pago}
                isInvalid={
                  !!errors.DataPagamento ||
                  (formData.pago && !formData.dataPagamento)
                }
                errorMessage={errors.DataPagamento?.[0]}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              color="primary"
              isDisabled={formSubmitting || isPago}
              startIcon={
                formSubmitting ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {formSubmitting ? 'Salvando...' : 'Salvar Alterações'}
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
    </I18nProvider>
  )
}

export default LancamentoEditForm
