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
} from '@mui/material'
import { DatePicker } from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { FilterAlt } from '@mui/icons-material'
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ width: '100%', aspectRatio: '1 / 1' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ width: '100%', aspectRatio: '1 / 1' }}
      >
        <Alert severity="error">
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      </Box>
    )
  }

  const todosValores = [
    ...(chartData?.receitas || []),
    ...(chartData?.despesas || []),
  ].map((v) => Math.abs(v))

  const yAxisMax =
    todosValores.length > 0 ? Math.max(...todosValores) * 1.1 : 1000

  return (
    <I18nProvider locale="pt-BR">
      <Box
        sx={{
          width: '100%',
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6">
          Fluxo de Caixa (Receitas vs. Despesas)
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button
            variant="outlined"
            startIcon={<FilterAlt />}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            Filtros
          </Button>
        </Box>

        <Collapse in={mostrarFiltros}>
          <Box sx={{ p: 2, mb: 2, border: '1px solid #ddd', borderRadius: 1 }}>
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
                    Aplicar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {chartData && chartData.meses.length > 0 ? (
          <BarChart
            sx={{ height: { xs: 300, md: 500 } }}
            series={[
              {
                data: chartData.receitas,
                label: 'Receitas',
                color: '#4CAF50',
                id: 'receitasId',
              },
              {
                // Usamos Math.abs para garantir que as barras de despesa sejam sempre positivas (para cima)
                data: chartData.despesas.map((v) => Math.abs(v)),
                label: 'Despesas',
                color: '#F44336',
                id: 'despesasId',
              },
            ]}
            xAxis={[{ data: chartData.meses, scaleType: 'band', label: 'Mês' }]}
            yAxis={[{ label: 'Valor (R$)', max: yAxisMax }]}
            slotProps={{
              bar: { rx: 4 },
              legend: {
                direction: 'vertical',
                position: { vertical: 'top', horizontal: 'end' },
              },
            }}
          />
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ height: { xs: 300, md: 500 } }}
          >
            <Typography>
              Nenhum dado encontrado para o período selecionado.
            </Typography>
          </Box>
        )}
      </Box>
    </I18nProvider>
  )
}
