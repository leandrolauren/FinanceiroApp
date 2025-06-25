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
  { field: 'pessoa.Nome', headerName: 'Pessoa', flex: 1 },
  { field: 'dataCompetencia', headerName: 'Data Competência', flex: 1 },
  { field: 'dataVencimento', headerName: 'Data Vencimento', flex: 1 },
  { field: 'pago', headerName: 'Pago', flex: 1 },
  { field: 'planocontas', headerName: 'Plano de Contas', flex: 1 },
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
          href={`/Lancamentos/DeleteLancamento/${params.id}`}
        >
          Excluir
        </Button>
      </Box>
    ),
  },
]

export default function LancamentoDataGrid() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/Lancamentos/GetLancamentos')
      .then((res) => res.json())
      .then((data) => {
        setRows(data)
        setLoading(false)
      })
  }, [])

  return (
    <Box sx={{ height: 500, width: '100%', padding: 1 }}>
      <Typography variant="h4" gutterBottom>
        Lançamentos
      </Typography>
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
          }}
        />
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
