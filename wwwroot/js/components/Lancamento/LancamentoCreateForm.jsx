import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Tabs,
  Tab,
  Spinner,
  Select,
  SelectItem,
  Switch,
  Accordion,
  AccordionItem,
} from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { DatePicker } from '@heroui/react'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { Autocomplete, TextField } from '@mui/material'
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

const addDays = (date, days) => {
  if (!(date instanceof Date) || isNaN(date)) return null
  const result = new Date(date.getTime())
  result.setDate(result.getDate() + days)
  return result
}

const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00'
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

const calculateParcelValues = (total, quantidade) => {
  const totalNumero = Number(total) || 0
  const parcelas = Number(quantidade) || 0
  if (parcelas <= 0) return []
  const totalCentavos = Math.round(totalNumero * 100)
  const valorBase = Math.floor(totalCentavos / parcelas)
  const resto = totalCentavos % parcelas

  return Array.from({ length: parcelas }, (_, index) => {
    const valor = valorBase + (index < resto ? 1 : 0)
    return valor / 100
  })
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
  const [parcelado, setParcelado] = useState(false)
  const [parcelasConfig, setParcelasConfig] = useState({
    quantidade: 2,
    intervaloDias: 30,
  })
  const [parcelas, setParcelas] = useState([])
  const [parcelasManuais, setParcelasManuais] = useState(false)

  const isReceita = formData.tipo === '1'
  const situacaoPagoLabel = isReceita ? 'Recebido' : 'Pago'
  const dataPagamentoLabel = isReceita
    ? 'Data do Recebimento'
    : 'Data de Pagamento'
  const parcelasCount = parcelas.length
  const totalParcelasValor = useMemo(() => {
    if (!parcelado || parcelas.length === 0) return 0
    return parcelas.reduce(
      (acc, parcela) => acc + (typeof parcela.valor === 'number' ? parcela.valor : 0),
      0,
    )
  }, [parcelado, parcelas])
  const totalLancamento = Number(formData.valor) || 0
  const diferencaParcelas = totalLancamento - totalParcelasValor
  const parcelasBalanceadas = Math.abs(diferencaParcelas) < 0.01

  const gerarParcelasAutomaticamente = useCallback(() => {
    if (!parcelado) return

    const quantidade = Math.max(Number(parcelasConfig.quantidade) || 2, 2)
    const intervalo = Math.max(Number(parcelasConfig.intervaloDias) || 30, 1)
    const baseCompetencia =
      formData.dataCompetencia instanceof Date
        ? formData.dataCompetencia
        : new Date()
    const baseVencimento =
      formData.dataVencimento instanceof Date
        ? formData.dataVencimento
        : formData.dataCompetencia || new Date()

    const valores = calculateParcelValues(formData.valor, quantidade)

    const novasParcelas = Array.from({ length: quantidade }, (_, index) => {
      const offset = intervalo * index
      return {
        valor: valores[index] ?? 0,
        dataCompetencia: addDays(baseCompetencia, offset),
        dataVencimento: addDays(baseVencimento, offset),
      }
    })

    setParcelas(novasParcelas)
  }, [
    parcelado,
    parcelasConfig.quantidade,
    parcelasConfig.intervaloDias,
    formData.dataCompetencia,
    formData.dataVencimento,
    formData.valor,
  ])

  useEffect(() => {
    if (!parcelado) {
      setParcelas([])
      setParcelasManuais(false)
      return
    }

    if (!parcelasManuais) {
      gerarParcelasAutomaticamente()
    }
  }, [parcelado, parcelasManuais, gerarParcelasAutomaticamente])

  useEffect(() => {
    if (!parcelado || parcelasCount === 0 || parcelasManuais) return
    const valores = calculateParcelValues(formData.valor, parcelasCount)
    setParcelas((prev) =>
      prev.map((parcela, index) => ({
        ...parcela,
        valor: valores[index] ?? parcela.valor,
      })),
    )
  }, [formData.valor, parcelado, parcelasCount, parcelasManuais])

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

  const clearParcelasError = () => {
    if (errors.Parcelas) {
      setErrors((prev) => ({ ...prev, Parcelas: undefined }))
    }
  }

  const handleParceladoToggle = (isSelected) => {
    setParcelado(isSelected)
    setParcelasManuais(false)
    clearParcelasError()

    if (isSelected) {
      setFormData((prev) => ({ ...prev, pago: false, dataPagamento: null }))
    } else {
      setParcelas([])
    }
  }

  const handleParcelasConfigChange = (field, value) => {
    const parsed = Number(value)
    setParcelasConfig((prev) => ({
      ...prev,
      [field]: Number.isNaN(parsed) ? prev[field] : parsed,
    }))
    setParcelasManuais(false)
    clearParcelasError()
  }

  const handleParcelaDateChange = (index, field, dateValue) => {
    setParcelasManuais(true)
    setParcelas((prev) => {
      const clone = [...prev]
      clone[index] = { ...clone[index], [field]: dateValue }
      return clone
    })
    clearParcelasError()
  }

  const handleParcelaValorChange = (index, valor) => {
    setParcelasManuais(true)
    setParcelas((prev) => {
      const clone = [...prev]
      clone[index] = { ...clone[index], valor }
      return clone
    })
    clearParcelasError()
  }

  const handleRemoveParcela = (index) => {
    if (parcelas.length <= 2) {
      showNotification(
        'Um lançamento parcelado precisa ter no mínimo duas parcelas.',
        'warning',
      )
      return
    }

    setParcelasManuais(true)
    setParcelas((prev) => {
      const atualizadas = prev.filter((_, i) => i !== index)
      setParcelasConfig((config) => ({
        ...config,
        quantidade: Math.max(atualizadas.length, 2),
      }))
      return atualizadas
    })
    clearParcelasError()
  }

  const handleRegenerateParcelas = () => {
    setParcelasManuais(false)
    gerarParcelasAutomaticamente()
    clearParcelasError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!parcelado && formData.pago && !formData.dataPagamento) {
      setErrors((prev) => ({
        ...prev,
        DataPagamento: [`A ${dataPagamentoLabel} é obrigatória.`],
      }))
      showNotification(`A ${dataPagamentoLabel} é obrigatória.`, 'warning')
      return
    }

    if (parcelado) {
      if (!parcelasCount) {
        showNotification(
          'Defina a quantidade e as datas das parcelas antes de salvar.',
          'warning',
        )
        return
      }

      if (!formData.valor || Number(formData.valor) <= 0) {
        showNotification(
          'Informe o valor total do lançamento para calcular as parcelas.',
          'warning',
        )
        return
      }

      const possuiDatasInvalidas = parcelas.some(
        (parcela) => !parcela.dataCompetencia || !parcela.dataVencimento,
      )

      if (possuiDatasInvalidas) {
        showNotification(
          'Todas as parcelas precisam ter datas de competência e vencimento.',
          'warning',
        )
        return
      }

      if (!parcelasBalanceadas) {
        const mensagem =
          'A soma dos valores das parcelas deve ser igual ao valor total informado.'
        setErrors((prev) => ({
          ...prev,
          Parcelas: [mensagem],
        }))
        showNotification(mensagem, 'warning')
        return
      }
    }

    setLoading(true)
    setErrors({})

    const parcelasPayload = parcelado
      ? parcelas.map((parcela, index) => ({
          numero: index + 1,
          valor: parcela.valor,
          dataCompetencia: formatDate(parcela.dataCompetencia),
          dataVencimento: formatDate(parcela.dataVencimento),
        }))
      : null

    const dados = {
      ...formData,
      pago: parcelado ? false : formData.pago,
      tipo: formData.tipo === '1' ? 'R' : 'D',
      planoContasId: formData.planoContasId || null,
      contaBancariaId: formData.contaBancariaId || null,
      pessoaId: formData.pessoaId || null,
      dataPagamento: parcelado ? null : formatDate(formData.dataPagamento),
      dataCompetencia: formatDate(formData.dataCompetencia),
      dataVencimento: formatDate(formData.dataVencimento),
      parcelado,
      quantidadeParcelas: parcelado ? parcelasCount : null,
      intervaloDiasParcelas: parcelado
        ? Number(parcelasConfig.intervaloDias) || null
        : null,
      parcelas: parcelasPayload,
    }

    try {
      await axios.post('/api/lancamentos', dados)
      showNotification('Lançamento cadastrado com sucesso!', 'success')
      setFormData(initialFormState)
      setParcelado(false)
      setParcelas([])
      setParcelasManuais(false)
      setParcelasConfig({ quantidade: 2, intervaloDias: 30 })
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
    <I18nProvider locale="pt-BR">
      <div className="p-3 sm:p-4 md:p-6 rounded-lg shadow-sm text-gray-900 dark:text-gray-100">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Novo Lançamento</h1>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <Tabs
            aria-label="Tipo de Lançamento"
            selectedKey={formData.tipo}
            onSelectionChange={(key) => handleValueChange('tipo', key)}
            color="primary"
            radius="md"
            size="sm"
            classNames={{
              tabList: "flex-wrap"
            }}
          >
            <Tab key="1" title="Receita" />
            <Tab key="2" title="Despesa" />
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 items-start">
            <Input
              id="tour-descricao"
              className="md:col-span-4"
              label="Descrição"
              value={formData.descricao}
              onValueChange={(v) => handleValueChange('descricao', v)}
              isRequired
              isInvalid={!!errors.Descricao}
              errorMessage={errors.Descricao?.[0]}
            />
            <NumericFormat
              id="tour-valor"
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
                id="tour-pessoa"
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
                    label="Pessoa (Cliente/Fornecedor)*"
                    error={!!errors.PessoaId}
                    helperText={errors.PessoaId?.[0]}
                    required
                  />
                )}
              />
            </div>

            <div className="md:col-span-2">
              <Autocomplete
                id="tour-plano-contas"
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
              />
            </div>

            <Select
              className="md:col-span-1"
              id="tour-situacao"
              label="Situação"
              isDisabled={parcelado}
              selectedKeys={[String(formData.pago)]}
              onSelectionChange={(keys) =>
                handleValueChange('pago', Array.from(keys)[0] === 'true')
              }
            >
              <SelectItem key="false">Em Aberto</SelectItem>
              <SelectItem key="true">{situacaoPagoLabel}</SelectItem>
            </Select>

            <div className="md:col-span-1">
              <DatePicker
                label={
                  formData.pago ? `${dataPagamentoLabel} *` : dataPagamentoLabel
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
                isDisabled={!formData.pago || parcelado}
                isRequired={formData.pago && !parcelado}
                isInvalid={
                  !!errors.DataPagamento ||
                  (formData.pago && !formData.dataPagamento)
                }
                errorMessage={errors.DataPagamento?.[0]}
              />
            </div>
          </div>

          <div className="border border-default-200 dark:border-default-100 rounded-lg p-4 space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Switch
                isSelected={parcelado}
                onValueChange={handleParceladoToggle}
                aria-label="Habilitar lançamento parcelado"
              >
                Lançamento parcelado
              </Switch>
              {parcelado && (
                <Button
                  variant="light"
                  size="sm"
                  onPress={handleRegenerateParcelas}
                  isDisabled={!parcelasCount}
                >
                  Recalcular parcelas
                </Button>
              )}
            </div>

            {parcelado && (
              <>
                <p className="text-sm text-default-500">
                  Informe a quantidade de parcelas (mínimo de 2) e o intervalo em dias. Você
                  pode ajustar manualmente as datas de cada parcela.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Quantidade de parcelas"
                    type="number"
                    min={2}
                    value={parcelasConfig.quantidade.toString()}
                    onValueChange={(value) =>
                      handleParcelasConfigChange('quantidade', value)
                    }
                  />
                  <Input
                    label="Intervalo entre parcelas (dias)"
                    type="number"
                    min={1}
                    value={parcelasConfig.intervaloDias.toString()}
                    onValueChange={(value) =>
                      handleParcelasConfigChange('intervaloDias', value)
                    }
                  />
                  <Input
                    label="Valor médio por parcela"
                    value={
                      parcelasCount
                        ? formatCurrency(Number(formData.valor || 0) / parcelasCount)
                        : formatCurrency(0)
                    }
                    isReadOnly
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm">
                  <span>
                    Total das parcelas:{' '}
                    <strong>{formatCurrency(totalParcelasValor)}</strong>
                  </span>
                  <span
                    className={
                      parcelasBalanceadas ? 'text-success-500' : 'text-danger-500'
                    }
                  >
                    Diferença:{' '}
                    <strong>{formatCurrency(Math.abs(diferencaParcelas))}</strong>
                    {!parcelasBalanceadas ? ' (ajuste os valores)' : ''}
                  </span>
                </div>

                {errors.Parcelas && (
                  <p className="text-sm text-danger-500">{errors.Parcelas?.[0]}</p>
                )}

                <Accordion variant="splitted">
                  <AccordionItem
                    key="parcelas"
                    aria-label="Detalhamento das parcelas"
                    title={`Detalhes das parcelas (${parcelasCount})`}
                  >
                    <div className="space-y-4">
                      {parcelas.map((parcela, index) => (
                        <div
                          key={`parcela-${index}`}
                          className="border border-default-200 dark:border-default-50 rounded-md p-4 space-y-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <p className="font-medium">
                              Parcela {index + 1}/{parcelasCount}
                            </p>
                            <p className="text-sm text-default-500">
                              {formatCurrency(parcela.valor)}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            <NumericFormat
                              label="Valor da Parcela"
                              value={parcela.valor}
                              customInput={TextField}
                              fullWidth
                              onValueChange={(values) =>
                                handleParcelaValorChange(index, values.floatValue || 0)
                              }
                              prefix={'R$ '}
                              thousandSeparator="."
                              decimalSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                            <DatePicker
                              label="Data de Competência"
                              value={
                                parcela.dataCompetencia
                                  ? parseDate(
                                      parcela.dataCompetencia
                                        .toISOString()
                                        .split('T')[0],
                                    )
                                  : null
                              }
                              onChange={(d) =>
                                handleParcelaDateChange(
                                  index,
                                  'dataCompetencia',
                                  d ? d.toDate(getLocalTimeZone()) : null,
                                )
                              }
                            />
                            <DatePicker
                              label="Data de Vencimento"
                              value={
                                parcela.dataVencimento
                                  ? parseDate(
                                      parcela.dataVencimento.toISOString().split('T')[0],
                                    )
                                  : null
                              }
                              onChange={(d) =>
                                handleParcelaDateChange(
                                  index,
                                  'dataVencimento',
                                  d ? d.toDate(getLocalTimeZone()) : null,
                                )
                              }
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              color="danger"
                              variant="light"
                              size="sm"
                              onPress={() => handleRemoveParcela(index)}
                              isDisabled={parcelasCount <= 2}
                            >
                              Remover parcela
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              id="tour-salvar-lancamento"
              type="submit"
              color="primary"
              isDisabled={loading}
              startIcon={
                loading ? <Spinner color="current" size="sm" /> : <SaveIcon />
              }
              className="w-full sm:w-auto"
              size="sm"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              variant="bordered"
              onClick={() => navigate('/lancamentos')}
              startIcon={<ArrowBackIcon />}
              className="w-full sm:w-auto"
              size="sm"
            >
              Voltar
            </Button>
          </div>
        </form>
      </div>
    </I18nProvider>
  )
}

export default LancamentoCreateForm
