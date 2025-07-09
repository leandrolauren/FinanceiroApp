import * as React from 'react'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, CircularProgress } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { ptBR } from '@mui/x-data-grid/locales'
import AppWrapper from '../Shared/AppWrapper'
import { enqueueSnackbar } from 'notistack'

function formatarCpf(cpf) {
  if (!cpf) return ''
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

function formatarCnpj(cnpj) {
  if (!cnpj) return ''
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function formatarTelefone(tel) {
  if (!tel) return ''
  if (tel.length === 11)
    return tel.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  if (tel.length === 10)
    return tel.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  return tel
}

function formatarCep(cep) {
  if (!cep) return ''
  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

const formatarData = (data) => {
  if (!data) return '---'
  return new Date(data).toLocaleDateString('pt-BR')
}

const columns = [
  { field: 'nome', headerName: 'Nome', width: 185 },
  { field: 'razaoSocial', headerName: 'Razão Social', flex: 1 },
  { field: 'nomeFantasia', headerName: 'Nome Fantasia', flex: 1 },
  { field: 'cnpj', headerName: 'CNPJ', flex: 1 },
  { field: 'inscricaoEstadual', headerName: 'Inscrição Estadual', flex: 1 },
  {
    field: 'cpf',
    headerName: 'CPF',
    flex: 1,
  },
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
    renderCell: (pessoa) => (
      <Box sx={{ display: 'flex', gap: 1, minWidth: 240 }}>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          href={`/Pessoas/EditPessoa/${pessoa.id}`}
        >
          Editar
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => window.abrirModalExclusaoPessoa(pessoa)}
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
    const fetchData = async () => {
      try {
        const response = await fetch('/Pessoas/GetPessoas')
        const data = await response.json()

        const rows = data.map((item) => ({
          ...item,
          dataNascimento: formatarData(item.dataNascimento),
          cpf: formatarCpf(item.cpf),
          cnpj: formatarCnpj(item.cnpj),
          telefone: formatarTelefone(item.telefone),
          cep: formatarCep(item.cep),
        }))

        setRows(rows)
      } catch (error) {
        enqueueSnackbar('Erro ao carregar as Pessoas', {
          variant: 'error',
        })
        console.error('Erro ao carregar as Pessoas: ', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
        </div>
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
