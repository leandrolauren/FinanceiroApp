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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptBR from 'date-fns/locale/pt-BR'
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
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <Button
          variant="outlined"
          startIcon={<FilterAlt />}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          Filtros
        </Button>
      </Box>
      <Collapse in={mostrarFiltros}>
        <Paper sx={{ p: 2, mb: 3, border: '1px solid #ddd' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data Início"
                  value={filtrosEditando.dataInicio}
                  onChange={(date) => handleFiltroChange('dataInicio', date)}
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
                  onChange={(date) => handleFiltroChange('dataFim', date)}
                />
              </LocalizationProvider>
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
        <Grid item xs={12} md={4}>
          <IndicadoresKPIs filtros={filtrosAtivos} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopDespesas filtros={filtrosAtivos} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopReceitas filtros={filtrosAtivos} />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <SaldosContasBancarias />
        </Grid>
        <Grid item xs={12} md={6}>
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
  )
}
