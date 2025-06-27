import * as React from 'react'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { ptBR } from '@mui/x-data-grid/locales'
import AppWrapper from '../Shared/AppWrapper'

const columns = [
  { field: 'nome', headerName: 'Nome', width: 185 },
  { field: 'razaoSocial', headerName: 'Razão Social', flex: 1 },
  { field: 'nomeFantasia', headerName: 'Nome Fantasia', flex: 1 },
  { field: 'cnpj', headerName: 'CNPJ', flex: 1 },
  { field: 'inscricaoEstadual', headerName: 'Inscrição Estadual', flex: 1 },
  { field: 'cpf', headerName: 'CPF', flex: 1 },
  { field: 'rg', headerName: 'RG', flex: 1 },
  {
    field: 'dataNascimento',
    headerName: 'Data de Nascimento',
    flex: 1,
  },
  { field: 'telefone', headerName: 'Telefone', flex: 1 },
  { field: 'email', headerName: 'E-mail', flex: 1 },
  { field: 'cep', headerName: 'CEP', flex: 1 },
  { field: 'endereco', headerName: 'Endereço', flex: 1 },
  { field: 'numero', headerName: 'Número', flex: 1 },
  { field: 'bairro', headerName: 'Bairro', flex: 1 },
  { field: 'cidade', headerName: 'Cidade', flex: 1 },
  { field: 'estado', headerName: 'Estado', flex: 1 },
  { field: 'complemento', headerName: 'Complemento', flex: 1 },
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
          href={`/Pessoas/EditPessoa/${params.id}`}
        >
          Editar
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => window.abrirModalExclusaoPessoa(params.id)}
        >
          Excluir
        </Button>
      </Box>
    ),
  },
]

export default function PessoasDataGrid() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/Pessoas/GetPessoas')
      .then((res) => res.json())
      .then((data) => {
        setRows(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    window.atualizarTabelaPessoas = (idRemovido) => {
      setRows((prevRows) => prevRows.filter((p) => p.id !== idRemovido))
    }
  }, [])

  return (
    <Box sx={{ height: 500, width: '100%', padding: 1 }}>
      <Button
        variant="contained"
        href="/Pessoas/CreatePessoa"
        sx={{ marginBottom: 2 }}
      >
        Nova Pessoa
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
          pageSize={25}
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
                nomeFantasia: false,
                rg: false,
                dataNascimento: false,
                numero: false,
                cep: false,
                endereco: false,
                bairro: false,
                complemento: false,
                inscricaoEstadual: false,
                acoes: true,
              },
            },
          }}
        />
      )}
    </Box>
  )
}

const rootElement = document.getElementById('pessoas-table-root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <AppWrapper>
      <PessoasDataGrid />
    </AppWrapper>,
  )
}
