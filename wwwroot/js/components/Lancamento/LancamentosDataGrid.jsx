import * as React from 'react'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { ptBR } from '@mui/x-data-grid/locales'
import AppWrapper from '../Shared/AppWrapper'

const columns = [
  { field: 'descricao', headerName: 'Descrição', flex: 1 },
  { field: 'tipo', headerName: 'Tipo', flex: 1 },
  { field: 'valor', headerName: 'Valor', flex: 1, type: Number },
  { field: 'pessoaNome', headerName: 'Pessoa', flex: 1 },
  { field: 'dataCompetencia', headerName: 'Data Competência', flex: 1 },
  { field: 'dataVencimento', headerName: 'Data Vencimento', flex: 1 },
  { field: 'dataLancamento', headerName: 'Data Lançamento', flex: 1 },
  { field: 'pagoTexto', headerName: 'Pago', flex: 1 },
  { field: 'planoContasDescricao', headerName: 'Plano de Contas', flex: 1 },
  { field: 'dataPagamento', headerName: 'Data do Pagamento', flex: 1 },
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

const formatarData = (data) => {
  if (!data) return '---'
  return new Date(data).toLocaleDateString('pt-BR')
}

export default function LancamentoDataGrid() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

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
          dataCompetencia: formatarData(item.dataCompetencia),
          dataVencimento: formatarData(item.dataVencimento),
          dataPagamento: formatarData(item.dataPagamento),
          dataLancamento: formatarData(item.dataLancamento),
          valor:
            item.valor != null
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
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
    <Box sx={{ height: 500, width: '100%', padding: 1 }}>
      <Button
        variant="contained"
        href="/Lancamentos/Create"
        sx={{ marginBottom: 2 }}
      >
        Novo Lançamento
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
            height: 500, // altura inicial
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
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
                },
              },
              sorting: {
                sortModel: [{ field: 'dataVencimento', sort: 'desc' }],
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
