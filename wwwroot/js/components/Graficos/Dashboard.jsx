import React, { useState } from 'react'
import { Box, Button, Collapse, Grid, Paper } from '@mui/material'
import { DatePicker, Select, SelectItem } from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { startOfYear, endOfYear } from 'date-fns'

import EntradaeSaida from './EntradaeSaida'
import IndicadoresKPIs from './IndicadoresKPIs'
import TopDespesas from './TopDespesas'
import TopReceitas from './TopReceitas'
import ContasProximas from './ContasProximas'
import EvolucaoSaldo from './EvolucaoSaldo'
import SaldosContasBancarias from './SaldosContasBancarias'

// --- Ícone de Filtro (copiado de PlanoConta.jsx) ---
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

const getFiltrosSalvos = () => {
  const filtrosSalvos = localStorage.getItem('dashboardFiltros')
  if (filtrosSalvos) {
    const filtros = JSON.parse(filtrosSalvos)
    return {
      dataInicio: new Date(filtros.dataInicio),
      dataFim: new Date(filtros.dataFim),
      status: filtros.status,
    }
  }
  return {
    dataInicio: startOfYear(new Date()),
    dataFim: endOfYear(new Date()),
    status: 'Todos',
  }
}

export default function Dashboard() {
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtrosAtivos, setFiltrosAtivos] = useState(getFiltrosSalvos)
  const [filtrosEditando, setFiltrosEditando] = useState(filtrosAtivos)

  const handleFiltroChange = (name, value) => {
    setFiltrosEditando((prev) => ({ ...prev, [name]: value }))
  }

  const aplicarFiltro = () => {
    localStorage.setItem('dashboardFiltros', JSON.stringify(filtrosEditando))
    setFiltrosAtivos(filtrosEditando)
    setMostrarFiltros(false)
  }

  const resetarFiltro = () => {
    const hoje = new Date()
    const filtrosPadrao = {
      dataInicio: startOfYear(hoje),
      dataFim: endOfYear(hoje),
      status: 'Todos',
    }
    setFiltrosEditando(filtrosPadrao)
    setFiltrosAtivos(filtrosPadrao)
  }
  return (
    <I18nProvider locale="pt-BR">
      <Box sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          mb={2}
        >
          <Button
            variant="bordered"
            startContent={<FilterIcon />}
            id="tour-dashboard-filtros"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            Filtros {mostrarFiltros ? '▲' : '▼'}
          </Button>
        </Box>
        <Collapse in={mostrarFiltros}>
          <Paper sx={{ p: 2, mb: 3, border: '1px solid #ddd' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Select
                  label="Situação"
                  className="w-[190px]"
                  selectedKeys={[filtrosEditando.status]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0]
                    if (value) {
                      handleFiltroChange('status', value)
                    }
                  }}
                >
                  <SelectItem key="Todos">Todos - Competência</SelectItem>
                  <SelectItem key="Pago">Pagos - Pagamento</SelectItem>
                  <SelectItem key="Aberto">Aberto - Vencimento</SelectItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={2}>
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
                    handleFiltroChange(
                      'dataInicio',
                      d ? d.toDate(getLocalTimeZone()) : null,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={2}>
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
                    handleFiltroChange(
                      'dataFim',
                      d ? d.toDate(getLocalTimeZone()) : null,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <div className="flex justify-end gap-2">
                  <Button variant="bordered" onClick={resetarFiltro}>
                    Redefinir
                  </Button>
                  <Button color="primary" onClick={aplicarFiltro}>
                    Aplicar
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4} id="tour-dashboard-kpis">
            <IndicadoresKPIs filtros={filtrosAtivos} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={3} id="tour-dashboard-graficos-pizza">
              <Grid item xs={12} md={6}>
                <TopDespesas filtros={filtrosAtivos} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TopReceitas filtros={filtrosAtivos} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <SaldosContasBancarias />
          </Grid>
          <Grid item xs={12} md={6} id="tour-dashboard-contas-proximas">
            <ContasProximas filtros={filtrosAtivos} />
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={3}>
          <EvolucaoSaldo filtros={filtrosAtivos} />
        </Grid>

        <Grid container spacing={3}>
          <EntradaeSaida />
        </Grid>
      </Box>
    </I18nProvider>
  )
}
