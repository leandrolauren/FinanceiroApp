import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  Chip,
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { I18nProvider } from '@react-aria/i18n'
import { useNavigate } from 'react-router-dom'
import { DatePicker } from '@heroui/react'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { format } from 'date-fns'
import axios from 'axios'

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: { mensagem: message, variant: variant },
  })
  window.dispatchEvent(event)
}

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

const steps = ['1. Configurar Arquivo', '2. Selecionar Transações']

export default function ImportacaoOfx() {
  const navigate = useNavigate()

  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState('')
  const [contasBancarias, setContasBancarias] = useState([])
  const [selectedConta, setSelectedConta] = useState('')
  const [dataInicio, setDataInicio] = useState(null)
  const [dataFim, setDataFim] = useState(null)
  const [file, setFile] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [selectionModel, setSelectionModel] = useState([])
  const [planosDeContas, setPlanosDeContas] = useState([])
  const [pessoas, setPessoas] = useState([])
  const [selectedPlanoContasReceita, setSelectedPlanoContasReceita] =
    useState('')
  const [selectedPlanoContasDespesa, setSelectedPlanoContasDespesa] =
    useState('')
  const [selectedPessoa, setSelectedPessoa] = useState('')
  const [dataVencimento, setDataVencimento] = useState(new Date())
  const [dataCompetencia, setDataCompetencia] = useState(new Date())
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        const [contasRes, planosRes, pessoasRes] = await Promise.all([
          axios.get('/api/contas'),
          axios.get('/api/planocontas/hierarquia'),
          axios.get('/api/pessoas'),
        ])
        setContasBancarias(contasRes.data.data || [])
        setPlanosDeContas(planosRes.data || [])
        setPessoas(pessoasRes.data || [])
      } catch (err) {
        setError('Falha ao carregar dados. Tente recarregar a página.')
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  const planosReceita = useMemo(() => {
    const receitas = planosDeContas.filter((p) => p.tipo === 1)
    return getLeafNodes(receitas)
  }, [planosDeContas])

  const planosDespesa = useMemo(() => {
    const despesas = planosDeContas.filter((p) => p.tipo === 2)
    return getLeafNodes(despesas)
  }, [planosDeContas])

  const handleParseFile = useCallback(async () => {
    if (!file || !selectedConta || !dataInicio || !dataFim) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    setLoadingMessage('Analisando arquivo OFX...')
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileType', 'ofx')
    formData.append('contaBancariaId', selectedConta)
    formData.append('dataInicio', format(dataInicio, 'yyyy-MM-dd'))
    formData.append('dataFim', format(dataFim, 'yyyy-MM-dd'))
    try {
      const response = await axios.post('/api/importacao/parse', formData)
      const formattedTransactions = response.data.map((t) => ({
        ...t,
        id: String(t.fitId),
      }))
      setTransactions(formattedTransactions)
      setSelectionModel([])
      setPage(0)
      setActiveStep(1)
    } catch (err) {
      setError(err.response.data || 'Erro ao processar o arquivo OFX.')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }, [file, selectedConta, dataInicio, dataFim])

  const handlePlanoContasChange = (fitId, planoContasId) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === fitId ? { ...t, planoContasId: planoContasId } : t,
      ),
    )
  }

  const handleImport = useCallback(async () => {
    const selectedTransactions = transactions.filter((t) =>
      selectionModel.includes(t.id),
    )
    if (selectedTransactions.length === 0) {
      setError('Nenhuma transação selecionada.')
      return
    }

    const hasUncategorizedReceita = selectedTransactions.some(
      (t) => t.amount >= 0 && !t.planoContasId,
    )
    const hasUncategorizedDespesa = selectedTransactions.some(
      (t) => t.amount < 0 && !t.planoContasId,
    )

    if (hasUncategorizedReceita && !selectedPlanoContasReceita) {
      setError(
        'Existem receitas selecionadas sem categoria. Por favor, selecione um Plano de Contas padrão para receitas.',
      )
      return
    }
    if (hasUncategorizedDespesa && !selectedPlanoContasDespesa) {
      setError(
        'Existem despesas selecionadas sem categoria. Por favor, selecione um Plano de Contas padrão para despesas.',
      )
      return
    }

    if (!selectedPessoa) {
      setError('O campo Pessoa é obrigatório.')
      return
    }

    setLoading(true)
    setLoadingMessage('Importando transações...')
    setError('')

    const payload = {
      contaBancariaId: selectedConta,
      pessoaId: selectedPessoa,
      dataVencimento: format(dataVencimento, 'yyyy-MM-dd'),
      dataCompetencia: format(dataCompetencia, 'yyyy-MM-dd'),
      transactions: selectedTransactions,
      planoContasReceitaId: selectedPlanoContasReceita || null,
      planoContasDespesaId: selectedPlanoContasDespesa || null,
    }
    try {
      const response = await axios.post('/api/importacao/import', payload)
      showNotification(response.data.message, 'success')
      setSelectedPessoa('')
      setSelectedPlanoContasReceita('')
      setSelectedPlanoContasDespesa('')

      await handleParseFile()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao importar transações.')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }, [
    transactions,
    selectionModel,
    selectedConta,
    selectedPessoa,
    dataVencimento,
    dataCompetencia,
    handleParseFile,
    selectedPlanoContasReceita,
    selectedPlanoContasDespesa,
  ])

  const handleAiCategorize = async () => {
    const selectedTransactions = transactions.filter((t) =>
      selectionModel.includes(t.id),
    )
    if (selectedTransactions.length === 0) {
      setError('Selecione ao menos uma transação para analisar.')
      return
    }
    setLoading(true)
    setLoadingMessage('Analisando com a IA... Isso pode levar alguns segundos.')
    setError('')
    try {
      const response = await axios.post('/api/ai/categorize', {
        transactions: selectedTransactions,
      })
      const categorizedData = response.data
      setTransactions((prev) =>
        prev.map((t) => {
          const categorized = categorizedData.find((c) => c.fitId === t.id)
          return categorized
            ? { ...t, planoContasId: categorized.planoContasId }
            : t
        }),
      )
      showNotification('Análise da IA concluída!', 'success')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao analisar com a IA.')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const isSelected = (id) => selectionModel.includes(id)

  const handleToggleRow = (id) => {
    const strId = String(id)
    setSelectionModel((prev) =>
      prev.includes(strId) ? prev.filter((x) => x !== strId) : [...prev, strId],
    )
  }

  const handleToggleAll = () => {
    const selectableIds = transactions
      .filter((t) => !t.isImported)
      .map((t) => t.id)
    if (selectionModel.length === selectableIds.length) {
      setSelectionModel([])
    } else {
      setSelectionModel(selectableIds)
    }
  }

  const numSelectable = transactions.filter((t) => !t.isImported).length
  const numSelected = selectionModel.length

  const totalSelecionado = useMemo(() => {
    return transactions
      .filter((t) => selectionModel.includes(t.id))
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }, [selectionModel, transactions])

  return (
    <I18nProvider locale="pt-BR">
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            Importar Transações de Arquivo OFX
          </Typography>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              my: 2,
              gap: 2,
            }}
          >
            <CircularProgress size={24} />
            {loadingMessage && <Typography>{loadingMessage}</Typography>}
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Conta Bancária *"
                  value={selectedConta}
                  onChange={(e) => setSelectedConta(e.target.value)}
                  sx={{ width: 250 }}
                >
                  {contasBancarias.map((conta) => (
                    <MenuItem key={conta.id} value={conta.id}>
                      {conta.descricao}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  {file
                    ? `Arquivo: ${
                        file.name.length > 25
                          ? `${file.name.substring(0, 25)}...`
                          : file.name
                      }`
                    : 'Selecionar Arquivo OFX *'}
                  <input
                    type="file"
                    hidden
                    accept=".ofx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data de Início *"
                  value={
                    dataInicio
                      ? parseDate(dataInicio.toISOString().split('T')[0])
                      : null
                  }
                  onChange={(d) =>
                    setDataInicio(d ? d.toDate(getLocalTimeZone()) : null)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data de Fim *"
                  value={
                    dataFim
                      ? parseDate(dataFim.toISOString().split('T')[0])
                      : null
                  }
                  onChange={(d) =>
                    setDataFim(d ? d.toDate(getLocalTimeZone()) : null)
                  }
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={() => navigate('/lancamentos')} sx={{ mr: 1 }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleParseFile}
                disabled={
                  loading || !file || !selectedConta || !dataInicio || !dataFim
                }
              >
                Analisar Arquivo
              </Button>
            </Box>
          </Paper>
        )}

        {activeStep === 1 && (
          <Paper sx={{ p: 3 }}>
            {transactions.length > 0 ? (
              <>
                <TableContainer sx={{ maxHeight: 520 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            indeterminate={
                              numSelected > 0 && numSelected < numSelectable
                            }
                            checked={
                              numSelectable > 0 && numSelected === numSelectable
                            }
                            onChange={handleToggleAll}
                            disabled={numSelectable === 0}
                            inputProps={{
                              'aria-label': 'select all transactions',
                            }}
                          />
                        </TableCell>
                        <TableCell>Data PG.</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell>Plano de Contas</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        )
                        .map((row) => (
                          <TableRow
                            hover
                            key={row.id}
                            selected={isSelected(row.id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isSelected(row.id)}
                                disabled={row.isImported}
                                onChange={() => handleToggleRow(row.id)}
                              />
                            </TableCell>
                            <TableCell>
                              {row.date
                                ? format(new Date(row.date), 'dd/MM/yyyy')
                                : '---'}
                            </TableCell>
                            <TableCell>{row.description}</TableCell>
                            <TableCell align="right">
                              <Typography
                                color={
                                  row.amount < 0 ? 'error' : 'success.main'
                                }
                              >
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(row.amount || 0)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 220 }}>
                              <TextField
                                select
                                fullWidth
                                variant="standard"
                                value={row.planoContasId || ''}
                                onChange={(e) =>
                                  handlePlanoContasChange(
                                    row.id,
                                    e.target.value,
                                  )
                                }
                                disabled={row.isImported}
                              >
                                <MenuItem value="">
                                  <em>Selecione...</em>
                                </MenuItem>
                                {(row.amount >= 0
                                  ? planosReceita
                                  : planosDespesa
                                ).map((plano) => (
                                  <MenuItem key={plano.id} value={plano.id}>
                                    {plano.descricao}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                color={
                                  row.isImported
                                    ? 'text.secondary'
                                    : 'primary.main'
                                }
                              >
                                {row.isImported ? 'Já Importado' : 'Pronto'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[25, 50, 75]}
                  component="div"
                  count={transactions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 25))
                    setPage(0)
                  }}
                  labelRowsPerPage="Linhas por pág."
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mt: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1">
                    Configuração para as{' '}
                    <strong>{selectionModel.length}</strong> transações
                    selecionadas:
                  </Typography>
                  {selectionModel.length > 0 && (
                    <Chip
                      label={
                        <Typography variant="subtitle2">
                          Total:{' '}
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(totalSelecionado)}
                        </Typography>
                      }
                      color={totalSelecionado >= 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Plano de Contas Padrão (Receitas)"
                      value={selectedPlanoContasReceita}
                      onChange={(e) =>
                        setSelectedPlanoContasReceita(e.target.value)
                      }
                      sx={{ width: 250 }}
                      disabled={
                        !selectionModel.some(
                          (id) =>
                            transactions.find((t) => t.id === id)?.amount >= 0,
                        )
                      }
                      helperText="Aplica às receitas selecionadas sem categoria."
                    >
                      {planosReceita.map((plano) => (
                        <MenuItem key={plano.id} value={plano.id}>
                          {plano.descricao}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Plano de Contas Padrão (Despesas)"
                      value={selectedPlanoContasDespesa}
                      onChange={(e) =>
                        setSelectedPlanoContasDespesa(e.target.value)
                      }
                      sx={{ width: 250 }}
                      disabled={
                        !selectionModel.some(
                          (id) =>
                            transactions.find((t) => t.id === id)?.amount < 0,
                        )
                      }
                      helperText="Aplica às despesas selecionadas sem categoria."
                    >
                      {planosDespesa.map((plano) => (
                        <MenuItem key={plano.id} value={plano.id}>
                          {plano.descricao}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Pessoa (Padrão) *"
                      value={selectedPessoa}
                      onChange={(e) => setSelectedPessoa(e.target.value)}
                      sx={{ width: 225 }}
                    >
                      {pessoas.map((pessoa) => (
                        <MenuItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Data de Vencimento *"
                      value={
                        dataVencimento
                          ? parseDate(
                              dataVencimento.toISOString().split('T')[0],
                            )
                          : null
                      }
                      onChange={(d) =>
                        setDataVencimento(
                          d ? d.toDate(getLocalTimeZone()) : null,
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Data de Competência *"
                      value={
                        dataCompetencia
                          ? parseDate(
                              dataCompetencia.toISOString().split('T')[0],
                            )
                          : null
                      }
                      onChange={(d) =>
                        setDataCompetencia(
                          d ? d.toDate(getLocalTimeZone()) : null,
                        )
                      }
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 3,
                  }}
                >
                  <Button onClick={() => setActiveStep(0)}>Voltar</Button>
                  <Button
                    variant="outlined"
                    onClick={handleAiCategorize}
                    disabled={loading || selectionModel.length === 0}
                    startIcon={<SmartToyIcon />}
                  >
                    Analisar com Galo Jhon
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleImport}
                    disabled={loading || selectionModel.length === 0}
                  >
                    Importar {selectionModel.length} Transações
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6">
                  Nenhuma transação encontrada
                </Typography>
                <Typography color="text.secondary">
                  Verifique o período ou o arquivo e tente novamente.
                </Typography>
                <Button
                  onClick={() => setActiveStep(0)}
                  sx={{ mt: 2 }}
                  variant="outlined"
                >
                  Voltar
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </I18nProvider>
  )
}
