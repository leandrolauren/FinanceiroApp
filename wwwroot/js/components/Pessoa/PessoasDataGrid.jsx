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
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Divider,
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por nome..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                  className="w-full sm:w-auto"
                  size="sm"
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
      <div className="py-2 px-2 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-small text-gray-600 dark:text-gray-400 w-full sm:w-[30%] text-center sm:text-left">
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
          size="sm"
        />
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <label className="flex items-center text-gray-600 dark:text-gray-400 text-small whitespace-nowrap">
            Linhas por página:
            <select
              className="bg-transparent outline-none text-gray-600 dark:text-gray-400 text-small ml-1"
              onChange={onRowsPerPageChange}
              defaultValue={rowsPerPage}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
          <div className="flex gap-2 sm:hidden">
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
    <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: 2, alignItems: 'center' }}>
        <Tooltip title="Aqui você gerencia todas as pessoas e empresas (clientes, fornecedores, etc.) com quem você transaciona. Mantenha os cadastros atualizados para facilitar seus lançamentos.">
          <IconButton size="small" sx={{ p: { xs: 0.5, sm: 1 } }}>
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
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          Nova Pessoa
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Box>
          <Box sx={{ mb: 2 }}>{topContent}</Box>
          {sortedItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma pessoa encontrada
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sortedItems.map((pessoa) => (
                <Card
                  key={pessoa.id}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            mb: 0.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {pessoa.nome || pessoa.razaoSocial || 'Sem nome'}
                        </Typography>
                        {(pessoa.nomeFantasia || pessoa.razaoSocial) && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {pessoa.nomeFantasia || pessoa.razaoSocial}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ ml: 1 }}>
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
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      {pessoa.cpf && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            CPF
                          </Typography>
                          <Typography variant="body2">{pessoa.cpf}</Typography>
                        </Box>
                      )}
                      {pessoa.cnpj && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            CNPJ
                          </Typography>
                          <Typography variant="body2">{pessoa.cnpj}</Typography>
                        </Box>
                      )}
                      {pessoa.telefone && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            Telefone
                          </Typography>
                          <Typography variant="body2">{pessoa.telefone}</Typography>
                        </Box>
                      )}
                      {pessoa.email && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            E-mail
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {pessoa.email}
                          </Typography>
                        </Box>
                      )}
                      {pessoa.cidade && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            Cidade
                          </Typography>
                          <Typography variant="body2">
                            {pessoa.cidade}
                            {pessoa.estado && ` - ${pessoa.estado}`}
                          </Typography>
                        </Box>
                      )}
                      {pessoa.endereco && (
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            Endereço
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {pessoa.endereco}
                            {pessoa.numero && `, ${pessoa.numero}`}
                            {pessoa.bairro && ` - ${pessoa.bairro}`}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
          <Box sx={{ mt: 3 }}>{bottomContent}</Box>
        </Box>
      ) : (
        <div className="overflow-x-auto">
          <Table
            aria-label="Tabela de Pessoas"
            id="tour-pessoas-grid"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{ 
              wrapper: 'max-h-[calc(100vh-280px)] min-w-[800px]',
              base: 'overflow-x-auto'
            }}
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
                  minWidth={column.uid === 'nome' ? 150 : column.uid === 'email' ? 180 : 100}
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
