import React, { useState } from 'react'
import { Box, Button, Collapse, Grid, useTheme, alpha } from '@mui/material'
import { DatePicker, Select, SelectItem } from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { startOfYear, endOfYear } from 'date-fns'
import FilterListIcon from '@mui/icons-material/FilterList'
import ReplayIcon from '@mui/icons-material/Replay'

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
  const theme = useTheme()
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
      <Box sx={{ width: '100%' }}>
        {/* Barra de Ferramentas / Filtros */}
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            sx={{ 
              borderRadius: 2, 
              color: 'text.primary', 
              borderColor: 'divider',
              '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            {mostrarFiltros ? 'Ocultar Filtros' : 'Filtros'}
          </Button>
        </Box>

        <Collapse in={mostrarFiltros}>
          <Box 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 4, 
              border: '1px solid', 
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Grid container spacing={3} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={3}>
                <Select
                  label="Situação"
                  className="w-full"
                  selectedKeys={[filtrosEditando.status]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0]
                    if (value) handleFiltroChange('status', value)
                  }}
                  variant="flat"
                >
                  <SelectItem key="Todos">Todos (Competência)</SelectItem>
                  <SelectItem key="Pago">Pagos (Pagamento)</SelectItem>
                  <SelectItem key="Aberto">Aberto (Vencimento)</SelectItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Data Início"
                  value={filtrosEditando.dataInicio ? parseDate(filtrosEditando.dataInicio.toISOString().split('T')[0]) : null}
                  onChange={(d) => handleFiltroChange('dataInicio', d ? d.toDate(getLocalTimeZone()) : null)}
                  variant="flat"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Data Fim"
                  value={filtrosEditando.dataFim ? parseDate(filtrosEditando.dataFim.toISOString().split('T')[0]) : null}
                  onChange={(d) => handleFiltroChange('dataFim', d ? d.toDate(getLocalTimeZone()) : null)}
                  variant="flat"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" gap={1}>
                  <Button 
                    variant="text" 
                    onClick={resetarFiltro} 
                    startIcon={<ReplayIcon />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Resetar
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={aplicarFiltro}
                    fullWidth
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    Aplicar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Row 1: KPIs */}
        <Box mb={4}>
          <IndicadoresKPIs filtros={filtrosAtivos} />
        </Box>

        {/* Row 2: Evolução (Destaque Principal) */}
        <Box mb={4}>
          <EvolucaoSaldo filtros={filtrosAtivos} />
        </Box>

        {/* Row 3: Fluxo de Caixa (Individual para máximo detalhe) */}
        <Box mb={4}>
          <EntradaeSaida />
        </Box>

        {/* Row 4: Maiores Gastos/Receitas e Saldos */}
        <Grid container spacing={4} mb={4}>
          <Grid item xs={12} lg={4}>
            <SaldosContasBancarias />
          </Grid>
          <Grid item xs={12} lg={4}>
            <TopDespesas filtros={filtrosAtivos} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <TopReceitas filtros={filtrosAtivos} />
          </Grid>
        </Grid>

        {/* Row 5: Contas Próximas */}
        <Box>
          <ContasProximas filtros={filtrosAtivos} />
        </Box>
      </Box>

    </I18nProvider>
  )
}

