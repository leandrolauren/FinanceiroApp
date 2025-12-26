import React, { useState, useEffect, useCallback } from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import {
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Collapse,
  Grid,
  TextField,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  alpha,
} from '@mui/material'
import { DatePicker } from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import FilterListIcon from '@mui/icons-material/FilterList'
import axios from 'axios'
import { startOfYear, endOfYear } from 'date-fns'

const getFiltrosSalvos = () => {
  const filtrosSalvos = localStorage.getItem('entradaeSaidaFiltros')
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

export default function EntradaeSaida() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const [filtrosAtivos, setFiltrosAtivos] = useState(getFiltrosSalvos)
  const [filtrosEditando, setFiltrosEditando] = useState(filtrosAtivos)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        dataInicio: filtrosAtivos.dataInicio.toISOString().slice(0, 10),
        dataFim: filtrosAtivos.dataFim.toISOString().slice(0, 10),
        status: filtrosAtivos.status,
      }

      const response = await axios.get('/api/dashboard/entradas-e-saidas', {
        params,
      })
      setChartData(response.data)
    } catch (err) {
      setError('Não foi possível carregar os dados do gráfico.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filtrosAtivos])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFiltroChange = (name, value) => {
    setFiltrosEditando((prev) => ({ ...prev, [name]: value }))
  }

  const aplicarFiltro = () => {
    localStorage.setItem(
      'entradaeSaidaFiltros',
      JSON.stringify(filtrosEditando),
    )
    setFiltrosAtivos(filtrosEditando)
    setMostrarFiltros(false)
  }

  const formatCurrency = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Paper>
    )
  }

  const chartHeight = isMobile ? 300 : isTablet ? 400 : 450

  return (
    <I18nProvider locale="pt-BR">
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ 
              p: 1, 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              display: 'flex'
            }}>
              <AccountBalanceWalletIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Fluxo de Caixa
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Entradas vs Saídas mensais
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            sx={{ borderRadius: 2 }}
          >
            Filtros
          </Button>
        </Box>

        <Collapse in={mostrarFiltros}>
          <Box sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.divider, 0.05), borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <DatePicker
                  label="Início"
                  value={filtrosEditando.dataInicio ? parseDate(filtrosEditando.dataInicio.toISOString().split('T')[0]) : null}
                  onChange={(d) => handleFiltroChange('dataInicio', d ? d.toDate(getLocalTimeZone()) : null)}
                  variant="flat"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker
                  label="Fim"
                  value={filtrosEditando.dataFim ? parseDate(filtrosEditando.dataFim.toISOString().split('T')[0]) : null}
                  onChange={(d) => handleFiltroChange('dataFim', d ? d.toDate(getLocalTimeZone()) : null)}
                  variant="flat"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Situação"
                  value={filtrosEditando.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Pago">Pagos</MenuItem>
                  <MenuItem value="Aberto">Em Aberto</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button fullWidth variant="contained" onClick={aplicarFiltro} sx={{ borderRadius: 2, py: 1 }}>
                  Aplicar
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {chartData && chartData.meses && chartData.meses.length > 0 ? (
          <Box sx={{ width: '100%', height: chartHeight + 100 }}>
            <BarChart
              dataset={chartData.meses.map((mes, i) => ({
                mes,
                receitas: chartData.receitas[i] || 0,
                despesas: Math.abs(chartData.despesas[i] || 0)
              }))}
              xAxis={[{ 
                scaleType: 'band', 
                dataKey: 'mes',
                tickLabelStyle: {
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: 500
                }
              }]}
              series={[
                { dataKey: 'receitas', label: 'Receitas', color: theme.palette.success.main, valueFormatter: (v) => formatCurrency(v) },
                { dataKey: 'despesas', label: 'Despesas', color: theme.palette.error.main, valueFormatter: (v) => formatCurrency(v) },
              ]}
              height={chartHeight + 100}
              grid={{ horizontal: true }}
              margin={{ top: 30, right: 30, bottom: 40, left: isMobile ? 70 : 100 }}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'middle' },
                  padding: -5,
                },
              }}
              sx={{
                '& .MuiBarElement-root': { rx: 6 },
                '.MuiChartsGrid-line': { 
                  stroke: theme.palette.divider, 
                  strokeDasharray: '4 4' 
                },
                width: '100%'
              }}
            />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: chartHeight }}>
            <Typography variant="body2" color="text.secondary">Nenhum dado encontrado.</Typography>
          </Box>
        )}

      </Paper>
    </I18nProvider>
  )
}

