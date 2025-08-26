import * as React from 'react'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, CircularProgress } from '@mui/material'
import { ptBR } from '@mui/x-data-grid/locales'

import PessoaDeleteModal from './PessoaDeleteModal'

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

export default function PessoasDataGrid() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [gridState, setGridState] = useState(() => {
    const savedState = localStorage.getItem('pessoasGridState')
    return savedState ? JSON.parse(savedState) : {}
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPessoaId, setSelectedPessoaId] = useState(null)

  const handleOpenDeleteModal = (id) => {
    setSelectedPessoaId(id)
    setIsModalOpen(true)
  }

  const handleCloseDeleteModal = (deleted) => {
    setIsModalOpen(false)
    setSelectedPessoaId(null)
    if (deleted) {
      fetchData()
    }
  }

  const fetchData = async () => {
    try {
      if (!loading) setLoading(true)
      const response = await fetch('/api/Pessoas')
      const data = await response.json()

      const formattedRows = data.map((item) => ({
        ...item,
        dataNascimento: formatarData(item.dataNascimento),
        cpf: formatarCpf(item.cpf),
        cnpj: formatarCnpj(item.cnpj),
        telefone: formatarTelefone(item.telefone),
        cep: formatarCep(item.cep),
      }))

      setRows(formattedRows)
    } catch (error) {
      const eventoErro = new CustomEvent('onNotificacao', {
        detail: {
          mensagem: 'Erro ao carregar as Pessoas',
          variant: 'error',
        },
      })
      window.dispatchEvent(eventoErro)

      console.error('Erro ao carregar as Pessoas: ', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResize = () => {}
  const handleStateChange = (newState) => {}

  useEffect(() => {
    localStorage.setItem('pessoasGridState', JSON.stringify(gridState))
  }, [gridState])

  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    { field: 'nome', headerName: 'Nome', flex: 1.5 },
    { field: 'razaoSocial', headerName: 'Razão Social', flex: 1 },
    { field: 'nomeFantasia', headerName: 'Nome Fantasia', flex: 1 },
    { field: 'cnpj', headerName: 'CNPJ', flex: 1 },
    { field: 'inscricaoEstadual', headerName: 'Inscrição Estadual', flex: 1 },
    { field: 'cpf', headerName: 'CPF', flex: 1 },
    { field: 'rg', headerName: 'RG', flex: 1 },
    { field: 'dataNascimento', headerName: 'Data de Nascimento', flex: 1 },
    { field: 'telefone', headerName: 'Telefone', flex: 1 },
    { field: 'email', headerName: 'E-mail', flex: 1 },
    { field: 'cep', headerName: 'CEP', flex: 1 },
    { field: 'endereco', headerName: 'Endereço', flex: 1 },
    { field: 'numero', headerName: 'Número', flex: 0.5 },
    { field: 'bairro', headerName: 'Bairro', flex: 0.8 },
    { field: 'cidade', headerName: 'Cidade', flex: 0.7 },
    { field: 'estado', headerName: 'Estado', flex: 0.4 },
    { field: 'complemento', headerName: 'Complemento', flex: 0.7 },
    {
      field: 'acoes',
      headerName: 'Ações',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            href={`/Pessoas/Edit/${params.id}`}
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

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Button
        variant="contained"
        href="/Pessoas/Create"
        sx={{ alignSelf: 'flex-start' }}
      >
        Nova Pessoa
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
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            disableRowSelectionOnClick
            columnVisibilityModel={gridState.columns.columnVisibilityModel}
            sortModel={gridState.sorting.sortModel}
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
          />
        </div>
      )}
      {isModalOpen && (
        <PessoaDeleteModal
          open={isModalOpen}
          pessoaId={selectedPessoaId}
          onClose={handleCloseDeleteModal}
        />
      )}
    </Box>
  )
}
