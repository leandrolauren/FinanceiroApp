import * as React from 'react'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, CircularProgress } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { ptBR } from '@mui/x-data-grid/locales'
import AppWrapper from '../Shared/AppWrapper'
import { enqueueSnackbar } from 'notistack'

const columns = [
  { field: 'descricao', headerName: 'Descrição', flex: 1 },
  {
    field: 'tipo',
    headerName: 'Tipo',
    flex: 1,
  },
  { field: 'numeroConta', headerName: 'Número', flex: 1 },
  { field: 'digitoConta', headerName: 'Dg. Conta', flex: 1 },
  { field: 'agencia', headerName: 'Agência', flex: 1 },
  { field: 'digitoAgencia', headerName: 'Dg. Agencia', flex: 1 },
  {
    field: 'ativoTexto',
    headerName: 'Ativo',
    flex: 1,
  },
  { field: 'banco', headerName: 'Banco', flex: 1 },
  { field: 'saldo', headerName: 'Saldo', flex: 1, type: Number },
  {
    field: 'acoes',
    headerName: 'Ações',
    width: 180,
    sortable: false,
    disableColumnMenu: true,
    hideable: false,
    pinned: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 1, minWidth: 240 }}>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          href={`/Contas/EditConta/${params.id}`}
        >
          Editar
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => window.abrirModalExclusaoConta(params.id)}
        >
          Excluir
        </Button>
      </Box>
    ),
  },
]

export default function ContaBancariaDataGrid() {
  const [loading, setLoading] = useState(true)
  const [contas, setContas] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Contas/GetContas')
        const data = await response.json()

        const contas = data.map((item) => ({
          ...item,
          ativoTexto: item?.ativa ? 'Ativo' : 'Inativo',
          saldo:
            item.saldo != null
              ? new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 2,
                }).format(Number(item.saldo))
              : '--',
        }))

        setContas(contas)
      } catch (error) {
        enqueueSnackbar('Erro ao carregar as contas bancárias.', {
          variant: 'error',
        })
        console.error('Erro ao carregar as Contas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    window.atualizarTabelaContas = (idRemovido) => {
      setContas((prevContas) => prevContas.filter((p) => p.id !== idRemovido))
    }
  }, [])

  return (
    <Box sx={{ height: 500, width: '100%', padding: 1 }}>
      <Button
        variant="contained"
        href="/Contas/CreateConta"
        sx={{ marginBottom: 2 }}
      >
        Nova Conta
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <div
          style={{
            resize: 'vertical',
            overflow: 'auto',
            minHeight: 300,
            maxHeight: 900,
            height: 500,
          }}
        >
          <DataGrid
            rows={contas}
            columns={columns}
            getRowId={(conta) => conta.id}
            pageSize={15}
            rowsPerPageOptions={[5, 10, 20]}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': { fontSize: '0.95rem' },
              '& .MuiDataGrid-columnHeaders': { fontWeight: 'bold' },
            }}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  acoes: true,
                  ativa: false,
                },
              },
            }}
          />
        </div>
      )}
    </Box>
  )
}

const rootElement = document.getElementById('conta-table-root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <AppWrapper>
      <ContaBancariaDataGrid />
    </AppWrapper>,
  )
}
