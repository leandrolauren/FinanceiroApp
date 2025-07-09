import React, { useState, useEffect, use } from 'react'
import { createRoot } from 'react-dom/client'
import AppWrapper from '../Shared/AppWrapper'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material'
import {
  Folder,
  FolderOpen,
  ArrowRight,
  Edit,
  Delete,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptBR from 'date-fns/locale/pt-BR'
import { FilterAlt } from '@mui/icons-material'

export default function PlanoContaDataGrid() {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { enqueueSnackbar } = useSnackbar()
  const [total, setTotal] = useState(0.0)
  const [filtros, setFiltros] = useState({
    tipoData: 'vencimento',
    dataInicio: null,
    dataFim: null,
  })

  const [filtrosEditando, setFiltrosEditando] = useState({
    tipoData: 'vencimento',
    dataInicio: null,
    dataFim: null,
  })
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    tipoData: 'vencimento',
    dataInicio: null,
    dataFim: null,
  })

  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    const hoje = new Date()
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    setFiltros((prev) => ({
      ...prev,
      dataInicio: primeiroDiaMes,
      dataFim: ultimoDiaMes,
    }))
  }, [])

  const buscarDados = async () => {
    try {
      setLoading(true)

      const params = {
        tipoData: filtrosAtivos.tipoData,
        dataInicio: filtrosAtivos.dataInicio?.toISOString(),
        dataFim: filtrosAtivos.dataFim?.toISOString(),
      }

      const [contasResponse, totalResponse] = await Promise.all([
        axios.get('/PlanoContas/GetPlanoContas'),
        axios.get('/PlanoContas/GetTotalPorPlano', { params }),
      ])

      setContas(contasResponse.data)

      const totaisMap = totalResponse.data.reduce((acc, item) => {
        acc[item.plano_conta_id] = item.total_valor
        return acc
      }, {})

      setTotal(totaisMap)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setError('Erro ao carregar os dados.')
      enqueueSnackbar('Erro ao carregar os dados.', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    buscarDados()
  }, [filtrosAtivos])

  const handleFiltroChange = (event) => {
    const { name, value } = event.target
    setFiltrosEditando((prev) => ({ ...prev, [name]: value }))
  }

  const handleDataChange = (name, value) => {
    setFiltrosEditando((prev) => ({ ...prev, [name]: value }))
  }

  const aplicarFiltro = () => {
    setFiltrosAtivos(filtrosEditando)
  }

  const resetarFiltro = () => {
    const hoje = new Date()
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    const novosFiltros = {
      tipoData: 'vencimento',
      dataInicio: primeiroDiaMes,
      dataFim: ultimoDiaMes,
    }

    setFiltrosEditando(novosFiltros)
    setFiltrosAtivos(novosFiltros)
  }

  const renderConta = (conta, nivel = 0) => {
    const isPai = conta.filhos && conta.filhos.length > 0
    const isFilho = conta.planoContasPaiId !== null

    let icon
    let style = {}

    if (isPai && isFilho) {
      // Intermediário: Pai e Filho
      icon = <FolderOpen color="info" />
      style = { fontStyle: 'italic', fontWeight: 'bold' }
    } else if (isPai || (!isPai && !isFilho)) {
      // Pai raiz ou isolado
      icon = <Folder color="primary" />
      style = { fontWeight: 'bold' }
    } else {
      // Apenas filho final
      icon = <ArrowRight />
      style = { fontStyle: 'italic', color: '#555' }
    }

    const valorTotal = total[conta.id] || 0.0

    return (
      <React.Fragment key={conta.id}>
        <tr style={{ color: '#000' }}>
          <td style={{ paddingLeft: `${nivel * 25}px` }}>
            <Box display="flex" alignItems="center" style={style}>
              {icon}
              <Box ml={1}>{conta.descricao}</Box>
            </Box>
          </td>
          <td>{conta.tipo}</td>
          <td>
            {valorTotal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </td>
          <td>
            <IconButton
              color="warning"
              href={`/PlanoContas/EditPlanoConta/${conta.id}`}
              size="small"
            >
              <Edit />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => window.abrirModalExclusaoPlanoConta(conta)}
              size="small"
            >
              <Delete />
            </IconButton>
          </td>
        </tr>
        {conta.filhos?.map((filho) => renderConta(filho, nivel + 1))}
      </React.Fragment>
    )
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Erro</AlertTitle>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          href="/PlanoContas/CreatePlanoConta"
          sx={{ marginBottom: 2 }}
        >
          Novo Plano de Contas
        </Button>

        <Button
          variant="outlined"
          startIcon={<FilterAlt />}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          sx={{
            backgroundColor: mostrarFiltros ? 'action.selected' : 'inherit',
            '&:hover': {
              backgroundColor: mostrarFiltros ? 'action.hover' : 'inherit',
            },
          }}
        >
          Filtros {mostrarFiltros ? '▲' : '▼'}
        </Button>
      </Box>

      <Collapse in={mostrarFiltros}>
        <Box
          sx={{
            p: 2,
            mb: 2,
            border: '1px solid #ddd',
            borderRadius: 1,
            backgroundColor: 'background.paper',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Tipo de Data"
                name="tipoData"
                value={filtrosEditando.tipoData}
                onChange={handleFiltroChange}
              >
                <MenuItem value="vencimento">Vencimento</MenuItem>
                <MenuItem value="competencia">Competência</MenuItem>
                <MenuItem value="lancamento">Lançamento</MenuItem>
                <MenuItem value="pagamento">Pagamento</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data Início"
                  value={filtrosEditando.dataInicio}
                  onChange={(date) => handleDataChange('dataInicio', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={4}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data Fim"
                  value={filtrosEditando.dataFim}
                  onChange={(date) => handleDataChange('dataFim', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={resetarFiltro}>
                  Redefinir
                </Button>
                <Button variant="contained" onClick={aplicarFiltro}>
                  Aplicar Filtro
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}

      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#000' }}>
              <th>NOME</th>
              <th>TIPO</th>
              <th>TOTAL</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {contas
              .filter((c) => c.planoContasPaiId === null)
              .map((conta) => renderConta(conta))}
          </tbody>
        </table>
      </Box>
    </Box>
  )
}

const rootElement = document.getElementById('planoConta-table-root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <AppWrapper>
      <PlanoContaDataGrid />
    </AppWrapper>,
  )
}
