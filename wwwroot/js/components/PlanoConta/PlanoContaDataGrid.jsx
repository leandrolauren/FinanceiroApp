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
  Menu,
} from '@mui/material'
import {
  FolderOpen,
  ArrowRight,
  FilterAlt,
  MoreVert,
} from '@mui/icons-material'
import axios from 'axios'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptBR from 'date-fns/locale/pt-BR'
import { useNavigate } from 'react-router-dom'
import PlanoContaDeleteModal from './PlanoContaDeleteModal'
import PlanoContaMigrateModal from './PlanoContaMigrateModal'

export default function PlanoContaDataGrid() {
  const navigate = useNavigate()
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getFiltrosSalvos = () => {
    const filtrosSalvos = localStorage.getItem('planoContaFiltros')
    if (filtrosSalvos) {
      const filtros = JSON.parse(filtrosSalvos)
      return {
        tipoData: filtros.tipoData || 'vencimento',
        dataInicio: filtros.dataInicio
          ? new Date(filtros.dataInicio)
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        dataFim: filtros.dataFim
          ? new Date(filtros.dataFim)
          : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      }
    }
    const hoje = new Date()
    return {
      tipoData: 'vencimento',
      dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    }
  }

  const [filtrosAtivos, setFiltrosAtivos] = useState(getFiltrosSalvos)
  const [filtrosEditando, setFiltrosEditando] = useState(filtrosAtivos)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false)
  const [selectedPlano, setSelectedPlano] = useState(null)
  const [migrationSource, setMigrationSource] = useState(null)

  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const handleMenuClick = (event, conta) => {
    setAnchorEl(event.currentTarget)
    setSelectedPlano(conta)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleOpenDeleteModal = () => {
    setAnchorEl(null)
    setIsDeleteModalOpen(true)
  }

  const handleOpenMigrateModal = () => {
    setMigrationSource(selectedPlano)
    setIsMigrateModalOpen(true)
    setAnchorEl(null)
  }

  const handleCloseDeleteModal = (deleted) => {
    setIsDeleteModalOpen(false)
    setSelectedPlano(null)
    if (deleted) {
      fetchData()
    }
  }
  const handleCloseMigrateModal = (migrated) => {
    setIsMigrateModalOpen(false)
    setMigrationSource(null)
    setSelectedPlano(null)
    if (migrated) {
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
    localStorage.setItem('planoContaFiltros', JSON.stringify(filtrosEditando))
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
    localStorage.setItem('planoContaFiltros', JSON.stringify(filtrosPadrao))
    setFiltrosEditando(filtrosPadrao)
    setFiltrosAtivos(filtrosPadrao)
  }

  const renderConta = (conta, nivel = 0) => {
    const isPai = conta.filhos && conta.filhos.length > 0
    const icon = isPai ? (
      <FolderOpen color="primary" />
    ) : (
      <ArrowRight fontSize="small" />
    )
    const style = isPai
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
              aria-label="Opções"
              aria-controls={`menu-${conta.id}`}
              aria-haspopup="true"
              onClick={(e) => handleMenuClick(e, conta)}
              size="small"
            >
              <MoreVert />
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
        <Button variant="contained" href="/PlanoContas/Create">
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

      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            navigate(`/PlanoContas/Edit/${selectedPlano.id}`)
          }}
        >
          Editar
        </MenuItem>
        <MenuItem onClick={handleOpenMigrateModal}>Migrar Lançamentos</MenuItem>
        <MenuItem onClick={handleOpenDeleteModal} sx={{ color: 'error.main' }}>
          Excluir
        </MenuItem>
      </Menu>

      {isDeleteModalOpen && (
        <PlanoContaDeleteModal
          open={isDeleteModalOpen}
          planoId={selectedPlano?.id}
          onClose={handleCloseDeleteModal}
        />
      )}

      {isMigrateModalOpen && (
        <PlanoContaMigrateModal
          open={isMigrateModalOpen}
          planoOrigem={migrationSource}
          onClose={handleCloseMigrateModal}
        />
      )}
    </Box>
  )
}
