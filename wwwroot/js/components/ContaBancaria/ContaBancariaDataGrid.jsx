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
  const [gridState, setGridState] = useState(() => {
    const savedState = localStorage.getItem('contasGridState')
    return savedState
      ? JSON.parse(savedState)
      : {
          columns: {
            columnVisibilityModel: {
              acoes: true,
            },
          },
          sorting: {
            sortModel: [],
          },
          pagination: {
            pageSize: 25,
          },
          dimensions: {},
          layout: {
            height: 500,
          },
        }
  })

  const handleResize = () => {
    const container = document.querySelector('.datagrid-container')
    if (container) {
      const newHeight = container.clientHeight
      if (newHeight > 300) {
        handleStateChange({
          layout: {
            ...gridState.layout,
            height: newHeight,
          },
        })
      }
    }
  }

  const handleStateChange = (newState) => {
    setGridState((prev) => ({
      ...prev,
      ...newState,
    }))
  }

  useEffect(() => {
    localStorage.setItem('contasGridState', JSON.stringify(gridState))
  }, [gridState])

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
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Button
        variant="contained"
        href="/Contas/CreateConta"
        sx={{ alignSelf: 'flex-start' }}
      >
        Nova Conta
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <div
          className="datagrid-container"
          style={{
            resize: 'vertical',
            overflow: 'auto',
            height: gridState.layout.height,
            minHeight: 300,
          }}
          onMouseUp={handleResize}
        >
          <DataGrid
            rows={contas}
            columns={columns}
            getRowId={(conta) => conta.id}
            rowsPerPageOptions={[5, 10, 20]}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                padding: '8px 16px',
                fontSize: '0.975rem',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#f5f5f5',
              },
            }}
            columnVisibilityModel={gridState.columns.columnVisibilityModel}
            sortModel={gridState.sorting.sortModel}
            pageSize={gridState.pagination.pageSize}
            onPageSizeChange={(newPageSize) =>
              handleStateChange({ pagination: { pageSize: newPageSize } })
            }
            onColumnVisibilityModelChange={(newModel) =>
              handleStateChange({
                columns: {
                  ...gridState.columns,
                  columnVisibilityModel: newModel,
                },
              })
            }
            onSortModelChange={(newModel) =>
              handleStateChange({ sorting: { sortModel: newModel } })
            }
            initialState={{
              columns: {
                columnVisibilityModel: gridState.columns.columnVisibilityModel,
              },
              sorting: {
                sortModel: gridState.sorting.sortModel,
              },
              pagination: {
                pageSize: gridState.pagination.pageSize,
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
