import * as React from 'react'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, CircularProgress } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { ptBR } from '@mui/x-data-grid/locales'
import AppWrapper from '../Shared/AppWrapper'

const columns = [
  {
    field: 'descricao',
    headerName: 'Descrição',
    flex: 1.55,
    renderCell: (params) => (
      <Box
        sx={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: '1.2',
        }}
      >
        {params.value}
      </Box>
    ),
  },
  { field: 'tipo', headerName: 'Tipo', flex: 1 },
  { field: 'valor', headerName: 'Valor R$', flex: 1, type: Number },
  {
    field: 'pessoaNome',
    headerName: 'Pessoa',
    flex: 1.5,
    renderCell: (params) => (
      <Box
        sx={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: '1.2',
        }}
      >
        {params.value}
      </Box>
    ),
  },
  {
    field: 'dataCompetencia',
    headerName: 'Data Competência',
    flex: 1,
    type: 'Date',
    renderCell: (params) => formatarParaExibicao(params.value),
  },
  {
    field: 'dataVencimento',
    headerName: 'Data Vencimento',
    flex: 1,
    type: 'Date',
    renderCell: (params) => formatarParaExibicao(params.value),
  },
  {
    field: 'dataLancamento',
    headerName: 'Data Lançamento',
    flex: 1,
    type: 'Date',
    renderCell: (params) => formatarParaExibicao(params.value),
  },
  { field: 'pagoTexto', headerName: 'Pago', flex: 0.5 },
  {
    field: 'planoContasDescricao',
    headerName: 'Plano de Contas',
    flex: 1,
    renderCell: (params) => (
      <Box
        sx={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: '1.2',
        }}
      >
        {params.value}
      </Box>
    ),
  },
  {
    field: 'dataPagamento',
    headerName: 'Data do Pagamento',
    flex: 1,
    type: 'Date',
    renderCell: (params) => formatarParaExibicao(params.value),
  },
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
          href={`/Lancamentos/EditLancamento/${params.id}`}
        >
          Editar
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => window.abrirModalExclusaoLancamento(params.id)}
        >
          Excluir
        </Button>
      </Box>
    ),
  },
]

const formatarParaExibicao = (value) => {
  if (!value) return '---'

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value)
      return isNaN(date.getTime()) ? '---' : date.toLocaleDateString('pt-BR')
    } catch {
      return '---'
    }
  }

  return value || '---'
}

export default function LancamentoDataGrid() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [gridState, setGridState] = useState(() => {
    const savedState = localStorage.getItem('lancamentosGridState')
    return savedState
      ? JSON.parse(savedState)
      : {
          columns: {
            columnVisibilityModel: {
              acoes: true,
            },
          },
          sorting: {
            sortModel: [{ field: 'dataVencimento', sort: 'asc' }],
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

  useEffect(() => {
    localStorage.setItem('lancamentosGridState', JSON.stringify(gridState))
  }, [gridState])

  const handleStateChange = (newState) => {
    setGridState((prev) => ({
      ...prev,
      ...newState,
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Lancamentos/GetLancamentos')
        const data = await response.json()

        const rowsAdaptadas = data.map((item) => ({
          ...item,
          pessoaNome: item?.pessoa?.nome ?? '--',
          planoContasDescricao: item?.planoContas?.descricao ?? '--',
          pagoTexto: item?.pago ? 'Sim' : 'Não',
          valor:
            item.valor != null
              ? new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 2,
                }).format(Number(item.valor))
              : '--',
        }))

        setRows(rowsAdaptadas)
      } catch (error) {
        console.error('Erro ao carregar lançamentos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    window.atualizarTabelaLancamentos = (idRemovido) => {
      setRows((prevRows) => prevRows.filter((l) => l.id !== idRemovido))
    }
  }, [])

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Button
        variant="contained"
        href="/Lancamentos/CreateLancamento"
        sx={{ alignSelf: 'flex-start' }}
      >
        Novo Lançamento
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
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
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

const rootElement = document.getElementById('lancamentos-table-root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <AppWrapper>
      <LancamentoDataGrid />
    </AppWrapper>,
  )
}
