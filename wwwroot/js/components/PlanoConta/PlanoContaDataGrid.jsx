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
  const [total, setTotal] = useState(0.0)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        const [contasResponse, totalResponse] = await Promise.all([
          axios.get('/PlanoContas/GetPlanoContas'),
          axios.get('/PlanoContas/GetTotalPorPlano'),
        ])
        setContas(contasResponse.data)

        const totaisMap = totalResponse.data.reduce((acc, item) => {
          acc[item.plano_conta_id] = item.total_valor
          return acc
        }, {})

        setTotal(totaisMap)
      } catch (error) {
        console.error('Erro ao buscar dados do Plano de Contas:', error)
        setError('Erro ao carregar os dados do Plano de Contas.')
        enqueueSnackbar('Erro ao carregar os dados do Plano de Contas.', {
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()

    window.atualizarTabelaPlanoContas = (idRemovido) => {
      setContas((prevContas) => prevContas.filter((l) => l.id !== idRemovido))
    }
  }, [])

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
