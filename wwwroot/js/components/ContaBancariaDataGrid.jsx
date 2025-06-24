import * as React from 'react'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { ptBR } from '@mui/x-data-grid/locales'
import AppWrapper from './AppWrapper'

const columns = [
  { field: 'descricao', headerName: 'Descrição', flex: 1 },
  { field: 'tipo', headerName: 'Tipo', flex: 1 },
  { field: 'numeroConta', headerName: 'Número', flex: 1 },
  { field: 'digitoConta', headerName: 'Dg. Conta', flex: 1 },
  { field: 'agencia', headerName: 'Agência', flex: 1 },
  { field: 'digitoAgencia', headerName: 'Dg. Agencia', flex: 1 },
  { field: 'ativa', headerName: 'Ativo', flex: 1 },
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
          href={`/Contas/DeleteConta/${params.id}`}
        >
          Excluir
        </Button>
      </Box>
    ),
  },
]

export default function ContaBancariaDataGrid() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/Contas/GetContas')
      .then((res) => res.json())
      .then((data) => {
        setRows(data)
        setLoading(false)
      })
  }, [])

  return (
    <Box sx={{ height: 500, width: '100%', padding: 1 }}>
      <Typography variant="h4" gutterBottom>
        Contas Bancárias
      </Typography>
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

const rootElement = document.getElementById('conta-table-root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <AppWrapper>
      <ContaBancariaDataGrid />
    </AppWrapper>
  )
}