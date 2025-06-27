import React, { useState, useEffect } from 'react'
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

export default function PlanoContaDataGrid() {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/PlanoContas/GetPlanoContas')
        setContas(response.data)
      } catch (err) {
        setError('Erro ao carregar plano de contas')
        enqueueSnackbar('Erro ao carregar plano de contas', {
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    window.atualizarTabelaPlanoContas = (idRemovido) => {
      setContas((prevContas) => prevContas.filter((l) => l.id !== idRemovido))
    }
  }, [])

  const calcularTotalRecursivo = (conta) => {
    const totalLancamentos =
      conta.lancamentos?.reduce((sum, l) => sum + l.valor, 0) || 0
    const totalFilhos =
      conta.filhos?.reduce((sum, f) => sum + calcularTotalRecursivo(f), 0) || 0
    return totalLancamentos + totalFilhos
  }

  const renderConta = (conta, nivel = 0) => {
    const total = calcularTotalRecursivo(conta)
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
            {total.toLocaleString('pt-BR', {
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
              onClick={() => window.abrirModalExclusaoPlanoConta(conta.id)}
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
