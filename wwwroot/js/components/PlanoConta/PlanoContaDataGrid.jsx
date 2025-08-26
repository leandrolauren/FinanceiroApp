import React, { useState, useEffect, useCallback } from 'react'
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
  FilterAlt,
} from '@mui/icons-material'
import axios from 'axios'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptBR from 'date-fns/locale/pt-BR'
import PlanoContaDeleteModal from './PlanoContaDeleteModal'

export default function PlanoContaDataGrid() {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filtrosAtivos, setFiltrosAtivos] = useState(() => {
    const hoje = new Date()
    return {
      tipoData: 'vencimento',
      dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    }
  })

  const [filtrosEditando, setFiltrosEditando] = useState(filtrosAtivos)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlanoId, setSelectedPlanoId] = useState(null)

  const handleOpenDeleteModal = (id) => {
    setSelectedPlanoId(id)
    setIsModalOpen(true)
  }

  const handleCloseDeleteModal = (deleted) => {
    setIsModalOpen(false)
    setSelectedPlanoId(null)
    if (deleted) {
      fetchData()
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        tipoData: filtrosAtivos.tipoData,
        dataInicio: filtrosAtivos.dataInicio?.toISOString().split('T')[0],
        dataFim: filtrosAtivos.dataFim?.toISOString().split('T')[0],
      }

      const response = await axios.get('/api/planoContas/hierarquia', {
        params,
      })
      setContas(response.data)
    } catch (err) {
      const errorMessage = 'Erro ao carregar os dados do plano de contas.'
      setError(errorMessage)
      const eventoErro = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: err.response?.data?.message || errorMessage,
          variant: 'error',
        },
      })
      window.dispatchEvent(eventoErro)
    } finally {
      setLoading(false)
    }
  }, [filtrosAtivos])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFiltroChange = (event) => {
    const { name, value } = event.target
    setFiltrosEditando((prev) => ({ ...prev, [name]: value }))
  }

  const handleDataChange = (name, value) => {
    setFiltrosEditando((prev) => ({ ...prev, [name]: value }))
  }

  const aplicarFiltro = () => {
    setFiltrosAtivos(filtrosEditando)
    setMostrarFiltros(false)
  }

  const resetarFiltro = () => {
    const hoje = new Date()
    const filtrosPadrao = {
      tipoData: 'vencimento',
      dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    }
    setFiltrosEditando(filtrosPadrao)
    setFiltrosAtivos(filtrosPadrao)
  }

  const renderConta = (conta, nivel = 0) => {
    const isPai = conta.filhos && conta.filhos.length > 0

    let icon = isPai ? (
      <FolderOpen color="primary" />
    ) : (
      <ArrowRight fontSize="small" />
    )
    let style = isPai
      ? { fontWeight: 'bold' }
      : { fontStyle: 'italic', color: '#555' }

    const valorTotal = conta.total || 0.0
    const corValor = conta.tipo === 2 ? 'red' : 'green'

    return (
      <React.Fragment key={conta.id}>
        <tr style={{ backgroundColor: nivel % 2 === 1 ? '#f9f9f9' : 'white' }}>
          <td style={{ paddingLeft: `${nivel * 25}px` }}>
            <Box display="flex" alignItems="center" style={style}>
              {icon}
              <Box ml={1}>{conta.descricao}</Box>
            </Box>
          </td>
          <td>{conta.tipo === 1 ? 'Receita' : 'Despesa'}</td>
          <td
            style={{
              color: corValor,
              fontWeight: 'bold',
              textAlign: 'right',
              paddingRight: '10px',
            }}
          >
            {valorTotal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </td>
          <td style={{ textAlign: 'center' }}>
            <IconButton
              color="warning"
              href={`/PlanoContas/Edit/${conta.id}`}
              size="small"
            >
              <Edit />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleOpenDeleteModal(conta.id)}
              size="small"
            >
              <Delete />
            </IconButton>
          </td>
        </tr>
        {isPai && conta.filhos.map((filho) => renderConta(filho, nivel + 1))}
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
        <Button
          variant="contained"
          href="/PlanoContas/Create"
          sx={{ marginBottom: 2 }}
        >
          Novo Plano de Contas
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterAlt />}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data Início"
                  value={filtrosEditando.dataInicio}
                  onChange={(date) => handleDataChange('dataInicio', date)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data Fim"
                  value={filtrosEditando.dataFim}
                  onChange={(date) => handleDataChange('dataFim', date)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={resetarFiltro}>
                  Redefinir
                </Button>
                <Button variant="contained" onClick={aplicarFiltro}>
                  Aplicar
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

      <Box
        sx={{
          overflowX: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr style={{ color: '#000' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>NOME</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>TIPO</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>TOTAL</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {contas.length > 0 ? (
              contas.map((conta) => renderConta(conta))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  Nenhum plano de contas encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
      {isModalOpen && (
        <PlanoContaDeleteModal
          open={isModalOpen}
          planoId={selectedPlanoId}
          onClose={handleCloseDeleteModal}
        />
      )}
    </Box>
  )
}
