import React, { useState } from 'react'
import {
  Box,
  Button,
  Collapse,
  Grid,
  TextField,
  MenuItem,
  Paper,
} from '@mui/material'
import { DatePicker } from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { FilterAlt } from '@mui/icons-material'
import { startOfYear, endOfYear } from 'date-fns'

import EntradaeSaida from './EntradaeSaida'
import IndicadoresKPIs from './IndicadoresKPIs'
import TopDespesas from './TopDespesas'
import TopReceitas from './TopReceitas'
import ContasProximas from './ContasProximas'
import EvolucaoSaldo from './EvolucaoSaldo'
import SaldosContasBancarias from './SaldosContasBancarias'

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
            variant="outlined"
            startIcon={<FilterAlt />}
            id="tour-dashboard-filtros"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            Filtros
          </Button>
        </Box>
        <Collapse in={mostrarFiltros}>
          <Paper sx={{ p: 2, mb: 3, border: '1px solid #ddd' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  label="Situação"
                  value={filtrosEditando.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                >
                  <MenuItem value="Todos">Todos - Competência</MenuItem>
                  <MenuItem value="Pago">Pagos - Pagamento</MenuItem>
                  <MenuItem value="Aberto">Em Aberto - Vencimento</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" justifyContent="flex-end">
                  <Button variant="contained" onClick={aplicarFiltro}>
                    Aplicar Filtros
                  </Button>
                </Box>
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
