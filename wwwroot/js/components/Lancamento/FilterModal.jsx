import { TextField, Autocomplete } from '@mui/material'
import {
  DatePicker,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { useEffect, useState } from 'react'

import axios from 'axios'

const FilterModal = ({ isOpen, onClose, onApply, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters)
  const [pessoas, setPessoas] = useState([])
  const [planosContas, setPlanosContas] = useState([])
  const [contasBancarias, setContasBancarias] = useState([])

  useEffect(() => {
    if (isOpen) {
      const fetchDropdownData = async () => {
        try {
          const [pessoasRes, planosRes, contasRes] = await axios.all([
            axios.get('/api/pessoas'),
            axios.get('/api/planoContas/hierarquia'),
            axios.get('/api/contas'),
          ])
          setPessoas(pessoasRes.data || [])
          setPlanosContas(planosRes.data || [])
          setContasBancarias(contasRes.data.data || [])
        } catch (error) {
          console.error('Erro ao buscar dados para filtros', error)
        }
      }
      fetchDropdownData()
    }
  }, [isOpen])

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyClick = () => {
    onApply(filters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      tipo: null,
      pessoaId: null,
      planoContasId: null,
      contaBancariaId: null,
      dataInicio: null,
      dataFim: null,
      tipoData: 'vencimento',
    }
    setFilters(clearedFilters)
    onApply(clearedFilters)
  }

  return (
    <I18nProvider locale="pt-BR">
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>Filtros Avançados</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Lançamento"
                selectedKeys={filters.tipo ? [filters.tipo] : []}
                onSelectionChange={(keys) =>
                  handleFilterChange('tipo', Array.from(keys)[0])
                }
              >
                <SelectItem key="R">Receita</SelectItem>
                <SelectItem key="D">Despesa</SelectItem>
              </Select>
              <Autocomplete
                disablePortal
                options={pessoas}
                getOptionLabel={(o) => o.nome}
                value={pessoas.find((p) => p.id === filters.pessoaId) || null}
                onChange={(_, nv) =>
                  handleFilterChange('pessoaId', nv?.id ?? null)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Pessoa" />
                )}
              />
              <Autocomplete
                disablePortal
                options={planosContas}
                getOptionLabel={(o) => o.descricao}
                value={
                  planosContas.find((p) => p.id === filters.planoContasId) ||
                  null
                }
                onChange={(_, nv) =>
                  handleFilterChange('planoContasId', nv?.id ?? null)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Plano de Contas" />
                )}
              />
              <Autocomplete
                disablePortal
                options={contasBancarias}
                getOptionLabel={(o) => o.descricao}
                value={
                  contasBancarias.find(
                    (c) => c.id === filters.contaBancariaId,
                  ) || null
                }
                onChange={(_, nv) =>
                  handleFilterChange('contaBancariaId', nv?.id ?? null)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Conta Bancária" />
                )}
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
                <DatePicker
                  label="Data Início"
                  value={
                    filters.dataInicio
                      ? parseDate(
                          filters.dataInicio.toISOString().split('T')[0],
                        )
                      : null
                  }
                  onChange={(d) =>
                    handleFilterChange(
                      'dataInicio',
                      d ? d.toDate(getLocalTimeZone()) : null,
                    )
                  }
                />
                <DatePicker
                  label="Data Fim"
                  value={
                    filters.dataFim
                      ? parseDate(filters.dataFim.toISOString().split('T')[0])
                      : null
                  }
                  onChange={(d) =>
                    handleFilterChange(
                      'dataFim',
                      d ? d.toDate(getLocalTimeZone()) : null,
                    )
                  }
                />
                <Select
                  label="Tipo da Data"
                  selectedKeys={[filters.tipoData]}
                  onSelectionChange={(keys) =>
                    handleFilterChange('tipoData', Array.from(keys)[0])
                  }
                >
                  <SelectItem key="vencimento">Vencimento</SelectItem>
                  <SelectItem key="competencia">Competência</SelectItem>
                  <SelectItem key="pagamento">Pagamento</SelectItem>
                  <SelectItem key="lancamento">Lançamento</SelectItem>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClearFilters}>
              Limpar Filtros
            </Button>
            <Button color="primary" onPress={handleApplyClick}>
              Aplicar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </I18nProvider>
  )
}

export default FilterModal
