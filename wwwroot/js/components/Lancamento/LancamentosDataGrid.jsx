import * as React from 'react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, CircularProgress } from '@mui/material'
import { ptBR } from '@mui/x-data-grid/locales'
import LancamentoDeleteModal from './LancamentoDeleteModal'

const defaultGridState = {
  columns: { columnVisibilityModel: {}, columnWidths: {} },
  sorting: { sortModel: [] },
  pagination: { pageSize: 25 },
  layout: { height: 500 },
}


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
    const savedState = localStorage.getItem('contasGridState')
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      return {
        ...defaultGridState,
        ...parsedState,
        columns: { ...defaultGridState.columns, ...parsedState.columns },
        sorting: { ...defaultGridState.sorting, ...parsedState.sorting },
        pagination: {
          ...defaultGridState.pagination,
          ...parsedState.pagination,
        },
        layout: { ...defaultGridState.layout, ...parsedState.layout },
      }
    }
    return defaultGridState
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLancamentoId, setSelectedLancamentoId] = useState(null)

  const handleOpenDeleteModal = useCallback((id) => {
    setSelectedLancamentoId(id)
    setIsModalOpen(true)
  }, [])

  const handleCloseDeleteModal = (deleted) => {
    setIsModalOpen(false)
    setSelectedLancamentoId(null)
    if (deleted) {
      fetchData()
    }
  }
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

  const handleColumnResize = (params) => {
    handleStateChange({
      columns: {
        ...gridState.columns,
        columnWidths: {
          ...gridState.columns.columnWidths,
          [params.colDef.field]: params.width,
        },
      },
    })
  }

  const columns = useMemo(() => {
    const baseColumns = [
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
              href={`/Lancamentos/Edit/${params.id}`}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleOpenDeleteModal(params.id)}
            >
              Excluir
            </Button>
          </Box>
        ),
      },
    ]
    return baseColumns.map((col) => ({
      ...col,
      width: gridState.columns?.columnWidths?.[col.field] || col.width,
    }))
  }, [gridState.columns?.columnWidths])

  useEffect(() => {
    localStorage.setItem('contasGridState', JSON.stringify(gridState))
  }, [gridState])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Lancamentos')
        const data = await response.json()

        const rowsAdaptadas = data.data.map((item) => ({
          ...item,
          pessoaNome: item?.pessoaNome ?? '--',
          planoContasDescricao: item?.planoContasDescricao ?? '--',
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
        const eventoErro = new CustomEvent('onNotificacao', {
          detail: {
            mensagem: 'Erro ao carregar os lançamentos.',
            variant: 'error',
          },
        })
        window.dispatchEvent(eventoErro)
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
        href="/Lancamentos/Create"
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
            onColumnResize={handleColumnResize}
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
            {isModalOpen && (
        <LancamentoDeleteModal
          open={isModalOpen}
          lancamentoId={selectedLancamentoId}
          onClose={handleCloseDeleteModal}
        />
      )}
    </Box>
  )
}
