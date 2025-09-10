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
import {
  formatarCpf,
  formatarCnpj,
  formatarTelefone,
  formatarCep,
  formatarData,
} from '../../utils/form-utils'
import PessoaDeleteModal from './PessoaDeleteModal'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

// --- Ícones e Helpers ---
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

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
}

const showNotification = (message, variant) => {
  const event = new CustomEvent('onNotificacao', {
    detail: {
      mensagem: message,
      variant: variant,
    },
  })
  window.dispatchEvent(event)
}

// --- Configurações da Tabela ---
const columns = [
  { name: 'NOME', uid: 'nome', sortable: true },
  { name: 'RAZÃO SOCIAL', uid: 'razaoSocial', sortable: true },
  { name: 'NOME FANTASIA', uid: 'nomeFantasia', sortable: true },
  { name: 'CNPJ', uid: 'cnpj' },
  { name: 'INSC. ESTADUAL', uid: 'inscricaoEstadual' },
  { name: 'CPF', uid: 'cpf' },
  { name: 'RG', uid: 'rg' },
  { name: 'NASCIMENTO', uid: 'dataNascimento' },
  { name: 'TELEFONE', uid: 'telefone' },
  { name: 'E-MAIL', uid: 'email', sortable: true },
  { name: 'CEP', uid: 'cep' },
  { name: 'ENDEREÇO', uid: 'endereco' },
  { name: 'NÚMERO', uid: 'numero' },
  { name: 'BAIRRO', uid: 'bairro' },
  { name: 'CIDADE', uid: 'cidade', sortable: true },
  { name: 'ESTADO', uid: 'estado', sortable: true },
  { name: 'COMPLEMENTO', uid: 'complemento' },
  { name: 'AÇÕES', uid: 'acoes' },
]

const INITIAL_VISIBLE_COLUMNS = [
  'nome',
  'cpf',
  'cnpj',
  'telefone',
  'email',
  'cidade',
  'acoes',
]

export default function PessoasDataGrid() {
  const navigate = useNavigate()
  const [pessoas, setPessoas] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal de exclusão
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPessoaId, setSelectedPessoaId] = useState(null)

  // States da tabela
  const [filterValue, setFilterValue] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('pessoasVisibleColumns')
    return saved ? new Set(JSON.parse(saved)) : new Set(INITIAL_VISIBLE_COLUMNS)
  })
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('pessoasRowsPerPage')
    return saved ? Number(saved) : 25
  })
  const [sortDescriptor, setSortDescriptor] = useState(() => {
    const saved = localStorage.getItem('pessoasSortDescriptor')
    return saved
      ? JSON.parse(saved)
      : { column: 'nome', direction: 'ascending' }
  })
  const [page, setPage] = useState(1)

  useEffect(() => {
    localStorage.setItem(
      'pessoasVisibleColumns',
      JSON.stringify(Array.from(visibleColumns)),
    )
  }, [visibleColumns])

  useEffect(() => {
    localStorage.setItem('pessoasRowsPerPage', rowsPerPage)
  }, [rowsPerPage])

  useEffect(() => {
    localStorage.setItem(
      'pessoasSortDescriptor',
      JSON.stringify(sortDescriptor),
    )
  }, [sortDescriptor])

  const hasSearchFilter = Boolean(filterValue)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
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

      setPessoas(formattedRows)
    } catch (error) {
      showNotification('Erro ao carregar as Pessoas', 'error')
      console.error('Erro ao carregar as Pessoas: ', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpenDeleteModal = useCallback((id) => {
    setSelectedPessoaId(id)
    setIsModalOpen(true)
  }, [])

  const handleCloseDeleteModal = (deleted) => {
    setIsModalOpen(false)
    if (deleted) {
      setPessoas((prevPessoas) =>
        prevPessoas.filter((pessoa) => pessoa.id !== selectedPessoaId),
      )
    }
    setSelectedPessoaId(null)
  }

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    )
  }, [visibleColumns])

  const filteredItems = useMemo(() => {
    let filteredPessoas = [...pessoas]

    if (hasSearchFilter) {
      filteredPessoas = filteredPessoas.filter((pessoa) =>
        pessoa.nome.toLowerCase().includes(filterValue.toLowerCase()),
      )
    }

    return filteredPessoas
  }, [pessoas, filterValue])

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
    (pessoa, columnKey) => {
      const cellValue = pessoa[columnKey]

      switch (columnKey) {
        case 'acoes':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Ações da Pessoa">
                  <DropdownItem
                    onPress={() => navigate(`/Pessoas/Edit/${pessoa.id}`)}
                  >
                    Editar
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger"
                    color="danger"
                    onPress={() => handleOpenDeleteModal(pessoa.id)}
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
    [handleOpenDeleteModal, navigate],
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

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por nome..."
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
  }, [filterValue, visibleColumns, onSearchChange, onClear])

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-gray-600 dark:text-gray-400">
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
          <label className="flex items-center text-gray-600 dark:text-gray-400 text-small">
            Linhas por página:
            <select
              className="bg-transparent outline-none text-gray-600 dark:text-gray-400 text-small"
              onChange={onRowsPerPageChange}
              defaultValue={rowsPerPage}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
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
    rowsPerPage,
    onRowsPerPageChange,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Tooltip title="Aqui você gerencia todas as pessoas e empresas (clientes, fornecedores, etc.) com quem você transaciona. Mantenha os cadastros atualizados para facilitar seus lançamentos.">
          <IconButton size="small">
            <InfoOutlinedIcon
              fontSize="small"
              sx={{ color: 'text.secondary' }}
            />
          </IconButton>
        </Tooltip>
        <Button
          color="primary"
          id="tour-nova-pessoa"
          endContent={<PlusIcon />}
          onPress={() => navigate('/Pessoas/Create')}
        >
          Nova Pessoa
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table
          aria-label="Tabela de Pessoas"
          id="tour-pessoas-grid"
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
            emptyContent={'Nenhuma pessoa encontrada'}
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
        <PessoaDeleteModal
          open={isModalOpen}
          pessoaId={selectedPessoaId}
          onClose={handleCloseDeleteModal}
        />
      )}
    </Box>
  )
}
