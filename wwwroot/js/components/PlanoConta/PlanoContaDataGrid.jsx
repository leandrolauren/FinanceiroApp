import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  DatePicker,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react'
import { Box, CircularProgress, Alert, AlertTitle } from '@mui/material'
import { I18nProvider } from '@react-aria/i18n'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { useNavigate } from 'react-router-dom'
import PlanoContaDeleteModal from './PlanoContaDeleteModal'
import PlanoContaMigrateModal from './PlanoContaMigrateModal'

// --- Ícones ---
const FilterIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M3 7h18M6 12h12M10 17h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const FolderOpenIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="currentColor"
    focusable="false"
    height="1.2em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1.2em"
    {...props}
  >
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
  </svg>
)

const ArrowRightIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="currentColor"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M10 17l5-5-5-5v10z" />
  </svg>
)

const VerticalDotsIcon = ({ size = 24, width, height, ...props }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      fill="currentColor"
    />
  </svg>
)

const columns = [
  { name: 'NOME', uid: 'descricao' },
  { name: 'TIPO', uid: 'tipo' },
  { name: 'TOTAL', uid: 'total' },
  { name: 'AÇÕES', uid: 'acoes' },
]

export default function PlanoContaDataGrid() {
  const navigate = useNavigate()
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Converte a data do localStorage para um objeto Date
  const getFiltrosSalvos = () => {
    const filtrosSalvos = localStorage.getItem('planoContaFiltros')
    if (filtrosSalvos) {
      const filtros = JSON.parse(filtrosSalvos)
      return {
        tipoData: filtros.tipoData || 'vencimento',
        dataInicio: filtros.dataInicio
          ? new Date(filtros.dataInicio)
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        dataFim: filtros.dataFim
          ? new Date(filtros.dataFim)
          : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      }
    }
    const hoje = new Date()
    return {
      tipoData: 'vencimento',
      dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    }
  }

  const [filtrosAtivos, setFiltrosAtivos] = useState(getFiltrosSalvos)
  const [filtrosEditando, setFiltrosEditando] = useState(filtrosAtivos)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false)
  const [selectedPlano, setSelectedPlano] = useState(null)
  const [migrationSource, setMigrationSource] = useState(null)
  const [planoParaAcao, setPlanoParaAcao] = useState(null)

  const handleOpenDeleteModal = (plano) => {
    setSelectedPlano(plano)
    setIsDeleteModalOpen(true)
  }

  const handleOpenMigrateModal = (plano) => {
    setMigrationSource(plano)
    setIsMigrateModalOpen(true)
  }

  const handleCloseDeleteModal = (deleted) => {
    setIsDeleteModalOpen(false)
    setSelectedPlano(null)
    if (deleted) {
      fetchData()
    }
  }
  const handleCloseMigrateModal = (migrated) => {
    setIsMigrateModalOpen(false)
    setMigrationSource(null)
    setSelectedPlano(null)
    if (migrated) {
      fetchData()
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        tipoData: filtrosAtivos.tipoData,
        dataInicio: filtrosAtivos.dataInicio?.toISOString().split('T')[0],
        dataFim: filtrosAtivos.dataFim?.toISOString().split('T')[0],
      }

      const query = new URLSearchParams(params).toString()
      const response = await fetch(`/api/planoContas/hierarquia?${query}`)

      if (!response.ok) {
        throw new Error('Falha na requisição à API.')
      }
      const data = await response.json()
      setContas(data)
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar os dados.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filtrosAtivos])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const aplicarFiltro = () => {
    localStorage.setItem('planoContaFiltros', JSON.stringify(filtrosEditando))
    setFiltrosAtivos(filtrosEditando)
    setMostrarFiltros(false)
  }

  const resetarFiltro = () => {
    const hoje = new Date()
    const filtrosPadrao = {
      tipoData: 'vencimento',
      dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    }
    localStorage.setItem('planoContaFiltros', JSON.stringify(filtrosPadrao))
    setFiltrosEditando(filtrosPadrao)
    setFiltrosAtivos(filtrosPadrao)
  }

  const tableItems = useMemo(() => {
    const sortNodes = (nodes) => {
      nodes.sort((a, b) => a.descricao.localeCompare(b.descricao))
      nodes.forEach((node) => {
        if (node.filhos && node.filhos.length > 0) {
          sortNodes(node.filhos)
        }
      })
      return nodes
    }

    const flattenNodes = (nodes, nivel = 0, result = []) => {
      for (const node of nodes) {
        result.push({ ...node, nivel })
        if (node.filhos && node.filhos.length > 0) {
          flattenNodes(node.filhos, nivel + 1, result)
        }
      }
      return result
    }

    const receitas = contas.filter((c) => c.tipo === 1)
    const despesas = contas.filter((c) => c.tipo === 2)

    const sortedReceitas = sortNodes(receitas)
    const sortedDespesas = sortNodes(despesas)

    const sortedContas = [...sortedReceitas, ...sortedDespesas]

    return flattenNodes(sortedContas)
  }, [contas])

  const renderCell = useCallback(
    (item, columnKey) => {
      const cellValue = item[columnKey]
      const isPai = item.filhos && item.filhos.length > 0

      switch (columnKey) {
        case 'descricao':
          return (
            <div
              className="flex items-center"
              style={{ paddingLeft: `${item.nivel * 25}px` }}
            >
              <span
                className={
                  isPai
                    ? 'text-primary-600'
                    : 'text-gray-500 transform scale-75'
                }
              >
                {isPai ? <FolderOpenIcon /> : <ArrowRightIcon />}
              </span>
              <span
                className={`ml-2 ${
                  isPai ? 'font-bold' : 'italic text-gray-700'
                }`}
              >
                {cellValue}
              </span>
            </div>
          )
        case 'tipo':
          return cellValue === 1 ? 'Receita' : 'Despesa'
        case 'total':
          return (
            <span
              className={`font-bold ${
                item.tipo === 2 ? 'text-danger' : 'text-success'
              }`}
            >
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(cellValue)}
            </span>
          )
        case 'acoes':
          return (
            <div className="relative flex justify-center items-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label={`Ações para ${item.descricao}`}>
                  <DropdownItem
                    onPress={() => navigate(`/PlanoContas/Edit/${item.id}`)}
                  >
                    Editar
                  </DropdownItem>
                  <DropdownItem onPress={() => handleOpenMigrateModal(item)}>
                    Migrar Lançamentos
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger"
                    color="danger"
                    onPress={() => handleOpenDeleteModal(item)}
                  >
                    Excluir
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        default:
          return cellValue
      }
    },
    [navigate],
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button color="primary" onPress={() => navigate('/PlanoContas/Create')}>
          Novo Plano de Contas
        </Button>
        <Button
          variant="bordered"
          startContent={<FilterIcon />}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          Filtros {mostrarFiltros ? '▲' : '▼'}
        </Button>
      </div>
      {mostrarFiltros && (
        <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
          <I18nProvider locale="pt-BR">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Select
                label="Tipo de Data"
                name="tipoData"
                selectedKeys={[filtrosEditando.tipoData]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0]
                  if (value) {
                    setFiltrosEditando((prev) => ({ ...prev, tipoData: value }))
                  }
                }}
              >
                <SelectItem key="vencimento">Vencimento</SelectItem>
                <SelectItem key="competencia">Competência</SelectItem>
                <SelectItem key="lancamento">Lançamento</SelectItem>
                <SelectItem key="pagamento">Pagamento</SelectItem>
              </Select>
              <DatePicker
                label="Data Início"
                value={
                  filtrosEditando.dataInicio
                    ? parseDate(
                        filtrosEditando.dataInicio.toISOString().split('T')[0],
                      )
                    : null
                }
                onChange={(d) =>
                  setFiltrosEditando((prev) => ({
                    ...prev,
                    dataInicio: d ? d.toDate(getLocalTimeZone()) : null,
                  }))
                }
              />
              <DatePicker
                label="Data Fim"
                value={
                  filtrosEditando.dataFim
                    ? parseDate(
                        filtrosEditando.dataFim.toISOString().split('T')[0],
                      )
                    : null
                }
                onChange={(d) =>
                  setFiltrosEditando((prev) => ({
                    ...prev,
                    dataFim: d ? d.toDate(getLocalTimeZone()) : null,
                  }))
                }
              />
              <div className="flex justify-end gap-2">
                <Button variant="bordered" onClick={resetarFiltro}>
                  Redefinir
                </Button>
                <Button color="primary" onClick={aplicarFiltro}>
                  Aplicar
                </Button>
              </div>
            </div>
          </I18nProvider>
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}

      <Table aria-label="Tabela de Plano de Contas">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={
                column.uid === 'total'
                  ? 'end'
                  : column.uid === 'acoes'
                  ? 'center'
                  : 'start'
              }
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={tableItems}
          emptyContent={'Nenhum plano de contas encontrado.'}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell
                  className={
                    item.nivel % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                  }
                >
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {isDeleteModalOpen && (
        <PlanoContaDeleteModal
          open={isDeleteModalOpen}
          planoId={selectedPlano?.id}
          onClose={handleCloseDeleteModal}
        />
      )}

      {isMigrateModalOpen && (
        <PlanoContaMigrateModal
          open={isMigrateModalOpen}
          planoOrigem={migrationSource}
          onClose={handleCloseMigrateModal}
        />
      )}
    </div>
  )
}

/*
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Tipo de Data"
                name="tipoData"
                value={filtrosEditando.tipoData}
                onChange={handleFiltroChange}
              >
                <MenuItem value="vencimento">Vencimento</MenuItem>
                <MenuItem value="competencia">Competência</MenuItem>
                <MenuItem value="lancamento">Lançamento</MenuItem>
                <MenuItem value="pagamento">Pagamento</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data Início"
                  value={filtrosEditando.dataInicio}
                  onChange={(date) => handleDataChange('dataInicio', date)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data Fim"
                  value={filtrosEditando.dataFim}
                  onChange={(date) => handleDataChange('dataFim', date)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={resetarFiltro}>
                  Redefinir
                </Button>
                <Button variant="contained" onClick={aplicarFiltro}>
                  Aplicar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
*/
