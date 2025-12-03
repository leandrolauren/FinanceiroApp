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
import {
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Tooltip,
  IconButton,
  Collapse,
  Grid,
  Paper,
  Typography,
} from '@mui/material'
import { I18nProvider } from '@react-aria/i18n'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { useNavigate } from 'react-router-dom'
import PlanoContaDeleteModal from './PlanoContaDeleteModal'
import PlanoContaMigrateModal from './PlanoContaMigrateModal'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

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

  const removerContaDaHierarquia = (id, contas) => {
    const contasFiltradas = contas.filter((c) => c.id !== id)

    return contasFiltradas.map((c) => {
      if (c.filhos && c.filhos.length > 0) {
        return { ...c, filhos: removerContaDaHierarquia(id, c.filhos) }
      }
      return c
    })
  }

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
    if (deleted && selectedPlano) {
      setContas((prevContas) =>
        removerContaDaHierarquia(selectedPlano.id, prevContas),
      )
    }
    setSelectedPlano(null)
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                pl: { xs: item.nivel * 1.5, sm: item.nivel * 2, md: item.nivel * 3 },
                minWidth: 0,
                width: '100%',
              }}
            >
              <Box
                component="span"
                sx={{
                  color: isPai
                    ? 'primary.main'
                    : 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  flexShrink: 0,
                  mr: 1,
                }}
              >
                {isPai ? <FolderOpenIcon /> : <ArrowRightIcon />}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isPai ? 600 : 400,
                  fontStyle: isPai ? 'normal' : 'italic',
                  color: isPai ? 'text.primary' : 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: 1,
                }}
                title={cellValue}
              >
                {cellValue}
              </Typography>
            </Box>
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
    <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: { xs: 1, sm: 2 }, 
          mb: 2, 
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tooltip title="O Plano de Contas é a estrutura que organiza suas finanças. Crie categorias como 'Salário', 'Aluguel' ou 'Supermercado' para classificar suas receitas e despesas e entender para onde seu dinheiro está indo.">
          <IconButton size="small" sx={{ p: { xs: 0.5, sm: 1 } }}>
            <InfoOutlinedIcon
              fontSize="small"
              sx={{ color: 'text.secondary' }}
            />
          </IconButton>
        </Tooltip>
        <Button 
          color="primary" 
          onPress={() => navigate('/PlanoContas/Create')}
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          Novo Plano de Contas
        </Button>
        <Button
          variant="bordered"
          startContent={<FilterIcon />}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          Filtros {mostrarFiltros ? '▲' : '▼'}
        </Button>
      </Box>
      <Collapse in={mostrarFiltros}>
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, border: '1px solid #ddd' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <I18nProvider locale="pt-BR">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <Select
                    label="Tipo de Data"
                    name="tipoData"
                    selectedKeys={[filtrosEditando.tipoData]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0]
                      if (value) {
                        setFiltrosEditando((prev) => ({
                          ...prev,
                          tipoData: value,
                        }))
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
                            filtrosEditando.dataInicio
                              .toISOString()
                              .split('T')[0],
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
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}
      <Box sx={{ width: '100%', overflowX: 'auto', position: 'relative', mt: 2 }}>
        <Table 
          aria-label="Tabela de Plano de Contas"
          classNames={{
            wrapper: 'w-full',
            base: 'w-full'
          }}
        >
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
              width={column.uid === 'descricao' ? '50%' : column.uid === 'total' ? '25%' : column.uid === 'acoes' ? '10%' : '15%'}
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
                  sx={{
                    maxWidth: columnKey === 'descricao' ? { xs: '200px', sm: '300px', md: '400px' } : 'none',
                    overflow: columnKey === 'descricao' ? 'hidden' : 'visible',
                    textOverflow: columnKey === 'descricao' ? 'ellipsis' : 'clip',
                    whiteSpace: columnKey === 'descricao' ? 'nowrap' : 'normal',
                  }}
                >
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
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
    </Box>
  )
}
