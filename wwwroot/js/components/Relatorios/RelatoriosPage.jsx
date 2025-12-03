import React, { useState, useEffect, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material'
import {
  Button,
  DatePicker,
  Select,
  SelectItem,
  Pagination,
} from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { startOfMonth, endOfMonth } from 'date-fns'
import axios from 'axios'
import ResumoFinanceiroViewer from './ResumoFinanceiroViewer'
import ExtratoCategoriaViewer from './ExtratoCategoriaViewer'
import MoreVertIcon from '@mui/icons-material/MoreVert'

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

const RelatoriosPage = () => {
  const [listLoading, setListLoading] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [generatedReports, setGeneratedReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 5,
    totalPages: 1,
  })

  // State para o modal de e-mail
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedReportForEmail, setSelectedReportForEmail] = useState(null)
  const [emailToSend, setEmailToSend] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  const [anchorEl, setAnchorEl] = useState(null)
  const [currentMenuReportId, setCurrentMenuReportId] = useState(null)

  // Data for dropdowns
  const [planosContas, setPlanosContas] = useState([])

  const [filtros, setFiltros] = useState({
    dataInicio: startOfMonth(new Date()),
    dataFim: endOfMonth(new Date()),
    status: 'Todos',
  })

  const [filtrosExtrato, setFiltrosExtrato] = useState({
    dataInicio: startOfMonth(new Date()),
    dataFim: endOfMonth(new Date()),
    planoContaId: null,
    status: 'Todos',
  })

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const planosRes = await axios.get('/api/planoContas/hierarquia')
        const leafNodes = getLeafNodes(planosRes.data || [])
        setPlanosContas(leafNodes)
      } catch (error) {
        console.error('Erro ao buscar planos de contas', error)
      }
    }
    fetchDropdownData()
  }, [])

  const fetchReports = useCallback(async () => {
    setListLoading(true)
    try {
      const params = {
        pageNumber: pagination.page,
        pageSize: pagination.pageSize,
      }
      const response = await axios.get('/api/relatorios', { params })
      setGeneratedReports(response.data)
      if (response.headers['x-pagination']) {
        const paginationHeader = JSON.parse(response.headers['x-pagination'])
        setPagination((prev) => ({
          ...prev,
          totalPages: paginationHeader.totalPages,
        }))
      }
    } catch (err) {
      setError('Erro ao buscar relatórios gerados.')
    } finally {
      setListLoading(false)
    }
  }, [pagination.page, pagination.pageSize])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/relatorioHub')
      .withAutomaticReconnect()
      .build()

    connection.on('RelatorioPronto', (relatorioId) => {
      showNotification(
        'Seu relatório está pronto para visualização!',
        'success',
      )
      fetchReports()
    })

    connection
      .start()
      .then(() => console.log('Conectado ao SignalR para relatórios.'))
      .catch((err) => console.error('Erro de conexão SignalR: ', err))

    return () => {
      connection.stop()
    }
  }, [fetchReports])

  const handleFiltroChange = (name, value) => {
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    setError('')
    try {
      const payload = {
        ...filtros,
        dataInicio: filtros.dataInicio.toISOString().split('T')[0],
        dataFim: filtros.dataFim.toISOString().split('T')[0],
      }
      const response = await axios.post(
        '/api/relatorios/resumo-financeiro',
        payload,
      )
      showNotification(response.data.message, 'info')
      fetchReports()
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erro ao solicitar o relatório.'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateExtrato = async () => {
    if (!filtrosExtrato.planoContaId) {
      showNotification('Por favor, selecione um Plano de Contas.', 'warning')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const payload = {
        ...filtrosExtrato,
        dataInicio: filtrosExtrato.dataInicio.toISOString().split('T')[0],
        dataFim: filtrosExtrato.dataFim.toISOString().split('T')[0],
      }
      const response = await axios.post(
        '/api/relatorios/extrato-categoria',
        payload,
      )
      showNotification(response.data.message, 'info')
      fetchReports()
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erro ao solicitar o extrato.'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleViewReport = async (reportId) => {
    const report = generatedReports.find((r) => r.id === reportId)
    if (report && report.status !== 'Concluido') {
      showNotification('Este relatório ainda está sendo processado.', 'info')
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`/api/relatorios/${reportId}`)
      setSelectedReport(response.data)
    } catch (err) {
      showNotification('Erro ao carregar os dados do relatório.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleMenuClick = (event, reportId) => {
    setAnchorEl(event.currentTarget)
    setCurrentMenuReportId(reportId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setCurrentMenuReportId(null)
  }

  const handleExportPdf = (reportId) => {
    window.open(`/api/relatorios/${reportId}/pdf`, '_blank')
    handleMenuClose()
  }

  const handleOpenEmailModal = (reportId) => {
    setSelectedReportForEmail(reportId)
    setEmailModalOpen(true)
    handleMenuClose()
  }

  const handleCloseEmailModal = () => {
    setEmailModalOpen(false)
    setSelectedReportForEmail(null)
    setEmailToSend('')
  }

  const handleSendEmail = async () => {
    if (!emailToSend) {
      showNotification('Por favor, insira um endereço de e-mail.', 'warning')
      return
    }
    setEmailSending(true)
    try {
      const response = await axios.post(
        `/api/relatorios/${selectedReportForEmail}/enviar-email`,
        { email: emailToSend },
      )
      showNotification(response.data.message, 'success')
      handleCloseEmailModal()
    } catch (err) {
      showNotification(
        err.response?.data?.message || 'Erro ao enviar o e-mail.',
        'error',
      )
    } finally {
      setEmailSending(false)
    }
  }

  if (selectedReport) {
    if (selectedReport.tipoRelatorio === 'ResumoFinanceiro') {
      return (
        <ResumoFinanceiroViewer
          reportData={JSON.parse(selectedReport.resultado)}
          onBack={() => setSelectedReport(null)}
        />
      )
    }
    if (selectedReport.tipoRelatorio === 'ExtratoCategoria') {
      return (
        <ExtratoCategoriaViewer
          reportData={JSON.parse(selectedReport.resultado)}
          onBack={() => setSelectedReport(null)}
        />
      )
    }
  }

  return (
    <I18nProvider locale="pt-BR">
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Central de Relatórios
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Resumo Financeiro
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Gere uma visão geral de suas receitas, despesas e saldo.
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Data Início"
                      value={
                        filtros.dataInicio
                          ? parseDate(
                              filtros.dataInicio.toISOString().split('T')[0],
                            )
                          : null
                      }
                      onChange={(d) =>
                        handleFiltroChange(
                          'dataInicio',
                          d ? d.toDate(getLocalTimeZone()) : null,
                        )
                      }
                      size="sm"
                      className="w-full"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Data Fim"
                      value={
                        filtros.dataFim
                          ? parseDate(
                              filtros.dataFim.toISOString().split('T')[0],
                            )
                          : null
                      }
                      onChange={(d) =>
                        handleFiltroChange(
                          'dataFim',
                          d ? d.toDate(getLocalTimeZone()) : null,
                        )
                      }
                      size="sm"
                      className="w-full"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Select
                      label="Situação"
                      className="w-full"
                      selectedKeys={[filtros.status]}
                      onSelectionChange={(keys) =>
                        handleFiltroChange('status', Array.from(keys)[0])
                      }
                      size="sm"
                    >
                      <SelectItem key="Todos">Todos</SelectItem>
                      <SelectItem key="Pago">Pago</SelectItem>
                      <SelectItem key="Aberto">Aberto</SelectItem>
                    </Select>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
                <Button
                  color="primary"
                  onClick={handleGenerateReport}
                  isLoading={generating}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Gerar Relatório
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Extrato por Categoria
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Analise todos os lançamentos de uma categoria específica.
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={planosContas}
                      getOptionLabel={(option) => option.descricao || ''}
                      value={
                        planosContas.find(
                          (p) => p.id === filtrosExtrato.planoContaId,
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        setFiltrosExtrato((prev) => ({
                          ...prev,
                          planoContaId: newValue ? newValue.id : null,
                        }))
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Plano de Contas *"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Data Início"
                      value={
                        filtrosExtrato.dataInicio
                          ? parseDate(
                              filtrosExtrato.dataInicio
                                .toISOString()
                                .split('T')[0],
                            )
                          : null
                      }
                      onChange={(d) =>
                        setFiltrosExtrato((prev) => ({
                          ...prev,
                          dataInicio: d ? d.toDate(getLocalTimeZone()) : null,
                        }))
                      }
                      size="sm"
                      className="w-full"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Data Fim"
                      value={
                        filtrosExtrato.dataFim
                          ? parseDate(
                              filtrosExtrato.dataFim
                                .toISOString()
                                .split('T')[0],
                            )
                          : null
                      }
                      onChange={(d) =>
                        setFiltrosExtrato((prev) => ({
                          ...prev,
                          dataFim: d ? d.toDate(getLocalTimeZone()) : null,
                        }))
                      }
                      size="sm"
                      className="w-full"
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
                <Button
                  color="primary"
                  onClick={handleGenerateExtrato}
                  isLoading={generating}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Gerar Extrato
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
              <Typography variant="h6">Relatórios Gerados</Typography>
              {listLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {generatedReports.map((report) => (
                    <ListItem
                      key={report.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <ListItemText
                        primary={
                          report.tipoRelatorio === 'ExtratoCategoria'
                            ? `Extrato de ${
                                planosContas.find(
                                  (p) =>
                                    p.id ===
                                    JSON.parse(report.parametros).PlanoContaId,
                                )?.descricao || 'Categoria'
                              }`
                            : `Resumo de ${new Date(
                                JSON.parse(report.parametros).DataInicio,
                              ).toLocaleDateString()}`
                        }
                        secondary={`Solicitado em: ${new Date(
                          report.dataSolicitacao,
                        ).toLocaleString()}`}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          ml: 2,
                        }}
                      >
                        <Chip
                          label={report.status}
                          color={
                            report.status === 'Concluido'
                              ? 'success'
                              : report.status === 'Processando'
                              ? 'info'
                              : 'error'
                          }
                        />
                        {report.status === 'Concluido' && (
                          <IconButton
                            aria-label="actions"
                            onClick={(e) => handleMenuClick(e, report.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Pagination
                    isCompact
                    showControls
                    color="primary"
                    page={pagination.page}
                    total={pagination.totalPages}
                    onChange={(newPage) =>
                      setPagination((p) => ({ ...p, page: newPage }))
                    }
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleViewReport(currentMenuReportId)}>
            Visualizar
          </MenuItem>
          <MenuItem onClick={() => handleExportPdf(currentMenuReportId)}>
            Exportar PDF
          </MenuItem>
          <MenuItem onClick={() => handleOpenEmailModal(currentMenuReportId)}>
            Enviar por Email
          </MenuItem>
        </Menu>
        <Dialog open={emailModalOpen} onClose={handleCloseEmailModal}>
          <DialogTitle>Enviar Relatório por E-mail</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="Endereço de E-mail"
              type="email"
              fullWidth
              variant="standard"
              value={emailToSend}
              onChange={(e) => setEmailToSend(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onPress={handleCloseEmailModal} variant="light">
              Cancelar
            </Button>
            <Button
              onPress={handleSendEmail}
              isLoading={emailSending}
              color="primary"
            >
              {emailSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </I18nProvider>
  )
}

export default RelatoriosPage
