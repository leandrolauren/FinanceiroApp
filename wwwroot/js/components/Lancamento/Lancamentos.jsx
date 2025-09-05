import * as React from 'react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from '@heroui/react'
import {
  Box,
  CircularProgress,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import LancamentoDeleteModal from './LancamentoDeleteModal'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

const PlusIcon = ({ size = 24, width, height, ...props }) => (
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
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    >
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
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

const SearchIcon = (props) => (
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
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...otherProps}
  >
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={strokeWidth}
    />
  </svg>
)

const UploadIcon = ({ size = 24, width, height, ...props }) => (
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
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="17 8 12 3 7 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="3"
      x2="12"
      y2="15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
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

// --- Configurações da Tabela ---
const columns = [
  { name: 'DESCRIÇÃO', uid: 'descricao', sortable: true },
  { name: 'PESSOA', uid: 'pessoaNome', sortable: true },
  { name: 'VALOR', uid: 'valor', sortable: true },
  { name: 'VENCIMENTO', uid: 'dataVencimento', sortable: true },
  { name: 'COMPETENCIA', uid: 'dataCompetencia', sortable: true },
  { name: 'PAGAMENTO', uid: 'dataPagamento', sortable: true },
  { name: 'PLANOCONTAS', uid: 'planoContasDescricao', sortable: true },
  { name: 'CONTA BANCÁRIA', uid: 'contaBancariaDescricao', sortable: true },
  { name: 'TIPO', uid: 'tipo', sortable: true },
  { name: 'STATUS', uid: 'pagoTexto', sortable: true },
  { name: 'AÇÕES', uid: 'acoes' },
]

const statusOptions = [
  { name: 'Pago', uid: 'Pago' },
  { name: 'Não Pago', uid: 'Não Pago' },
]

const statusColorMap = {
  Pago: 'success',
  'Não Pago': 'danger',
  Receita: 'success',
  Despesa: 'danger',
}

const INITIAL_VISIBLE_COLUMNS = [
  'descricao',
  'valor',
  'pessoaNome',
  'dataVencimento',
  'pagoTexto',
  'acoes',
]

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

export default function Lancamentos() {
  const navigate = useNavigate()
  const [lancamentos, setLancamentos] = useState([])
  const [loading, setLoading] = useState(true)

  // State para o modal de exclusão
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLancamentoId, setSelectedLancamentoId] = useState(null)

  // States da tabela (filtro, paginação, etc.)
  const [filterValue, setFilterValue] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('lancamentoVisibleColumns')
    return saved ? new Set(JSON.parse(saved)) : new Set(INITIAL_VISIBLE_COLUMNS)
  })
  const [statusFilter, setStatusFilter] = useState(() => {
    const saved = localStorage.getItem('lancamentoStatusFilter')
    if (saved) {
      return saved === 'all' ? 'all' : new Set(JSON.parse(saved))
    }
    return 'all'
  })
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'dataVencimento',
    direction: 'descending',
  })
  const [page, setPage] = useState(1)

  useEffect(() => {
    localStorage.setItem(
      'lancamentoVisibleColumns',
      JSON.stringify(Array.from(visibleColumns)),
    )
  }, [visibleColumns])

  useEffect(() => {
    if (statusFilter === 'all') {
      localStorage.setItem('lancamentoStatusFilter', 'all')
    } else {
      localStorage.setItem(
        'lancamentoStatusFilter',
        JSON.stringify(Array.from(statusFilter)),
      )
    }
  }, [statusFilter])

  const hasSearchFilter = Boolean(filterValue)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/Lancamentos')
      const { data, success } = await response.json()

      if (success) {
        const rowsAdaptadas = data.map((item) => ({
          ...item,
          pessoaNome: item?.pessoa?.nome ?? '--',
          planoContasDescricao: item?.planoContas?.descricao ?? '--',
          pagoTexto: item.pago ? 'Pago' : 'Não Pago',
          contaBancariaDescricao: item?.contaBancaria?.nome ?? '--',
        }))
        setLancamentos(rowsAdaptadas)
      } else {
        showNotification('Erro ao carregar os lançamentos.', 'error')
      }
    } catch (error) {
      showNotification('Erro ao carregar os lançamentos.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleEstornar = async (id) => {
    if (
      window.confirm(
        'Tem certeza que deseja estornar este pagamento? O saldo da conta será revertido.',
      )
    ) {
      try {
        const response = await axios.post(`/api/lancamentos/${id}/estornar`)
        showNotification(response.data.message, 'success')
        fetchData()
        window.dispatchEvent(new CustomEvent('lancamentoAtualizado'))
      } catch (error) {
        showNotification(
          error.response?.data?.message || 'Erro ao estornar o lançamento.',
          'error',
        )
      }
    }
  }

  const handleOpenDeleteModal = useCallback((id) => {
    setSelectedLancamentoId(id)
    setIsModalOpen(true)
  }, [])

  const handleCloseDeleteModal = (deleted) => {
    setIsModalOpen(false)
    setSelectedLancamentoId(null)
    if (deleted) {
      fetchData()
      window.dispatchEvent(new CustomEvent('lancamentosAtualizados'))
    }
  }

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    )
  }, [visibleColumns])

  const filteredItems = useMemo(() => {
    let filteredLancamentos = [...lancamentos]

    if (hasSearchFilter) {
      filteredLancamentos = filteredLancamentos.filter((lancamento) =>
        lancamento.descricao.toLowerCase().includes(filterValue.toLowerCase()),
      )
    }
    if (
      statusFilter !== 'all' &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredLancamentos = filteredLancamentos.filter((lancamento) =>
        Array.from(statusFilter).includes(lancamento.pagoTexto),
      )
    }

    return filteredLancamentos
  }, [lancamentos, filterValue, statusFilter])

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column]
      const second = b[sortDescriptor.column]
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, items])

  const renderCell = useCallback(
    (lancamento, columnKey) => {
      const cellValue = lancamento[columnKey]

      switch (columnKey) {
        case 'valor':
          return (
            <span
              className={
                lancamento.tipo === 'Receita'
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(cellValue)}
            </span>
          )
        case 'pagoTexto':
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[lancamento.pagoTexto]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          )
        case 'tipo':
          return (
            <Chip
              className="capitalize"
              color={lancamento.tipo === 'Receita' ? 'success' : 'danger'}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          )
        case 'dataCompetencia':
        case 'dataVencimento':
        case 'dataPagamento':
          return formatarParaExibicao(cellValue)
        case 'acoes':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Ações do Lançamento">
                  {lancamento.pago
                    ? [
                        <DropdownItem
                          key="estornar"
                          onPress={() => handleEstornar(lancamento.id)}
                        >
                          Estornar
                        </DropdownItem>,
                      ]
                    : [
                        <DropdownItem
                          key="edit"
                          onPress={() =>
                            navigate(`/Lancamentos/Edit/${lancamento.id}`)
                          }
                        >
                          Editar
                        </DropdownItem>,
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          onPress={() => handleOpenDeleteModal(lancamento.id)}
                        >
                          Excluir
                        </DropdownItem>,
                      ]}
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        default:
          return cellValue
      }
    },
    [handleEstornar, handleOpenDeleteModal, navigate],
  )

  const onNextPage = useCallback(() => {
    if (page < pages) setPage(page + 1)
  }, [page, pages])

  const onPreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1)
  }, [page])

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value))
    setPage(1)
  }, [])

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value)
      setPage(1)
    } else {
      setFilterValue('')
    }
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const listener = () => fetchData()
    window.addEventListener('lancamentosAtualizados', listener)

    return () => window.removeEventListener('lancamentosAtualizados', listener)
  }, [fetchData])

  useEffect(() => {
    window.atualizarTabelaLancamentos = (idRemovido) => {
      setLancamentos((prev) => prev.filter((l) => l.id !== idRemovido))
    }
  }, [])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por descrição..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por Status"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Colunas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Colunas Visíveis"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    )
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    lancamentos.length,
    onSearchChange,
    onClear,
    rowsPerPage,
  ])

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === 'all'
            ? 'Todos os itens selecionados'
            : `${selectedKeys.size} de ${filteredItems.length} selecionados`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="flex justify-between items-center">
          <label className="flex items-center text-default-400 text-small">
            Linhas por página:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              defaultValue={rowsPerPage}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Anterior
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Próximo
          </Button>
        </div>
      </div>
    )
  }, [
    selectedKeys,
    page,
    pages,
    filteredItems.length,
    onPreviousPage,
    onNextPage,
  ])

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h5" component="h1">
          Lançamentos Financeiros
        </Typography>
        <Tooltip title="Esta é a tela principal para registrar todas as suas movimentações: receitas (o que você ganha) e despesas (o que você gasta). Um registro detalhado ajuda a manter o controle.">
          <IconButton size="small">
            <InfoOutlinedIcon
              fontSize="small"
              sx={{ color: 'text.secondary' }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          color="primary"
          endContent={<PlusIcon />}
          onPress={() => navigate('/lancamentos/create')}
        >
          Novo Lançamento
        </Button>
        <Button
          color="default"
          variant="flat"
          endContent={<UploadIcon />}
          onPress={() => navigate('/lancamentos/importar/ofx')}
        >
          Importar OFX
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table
          aria-label="Tabela de Lançamentos Financeiros"
          isHeaderSticky
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{ wrapper: 'max-h-[70vh]' }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === 'acoes' ? 'center' : 'start'}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={'Nenhum lançamento encontrado'}
            items={sortedItems}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
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
