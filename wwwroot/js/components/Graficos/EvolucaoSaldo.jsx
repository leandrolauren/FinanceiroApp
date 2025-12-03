import React, { useState, useEffect } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { Box, Typography, Skeleton, Paper, useTheme, useMediaQuery } from '@mui/material'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

export default function EvolucaoSaldo({ filtros }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const chartHeight = isMobile ? 300 : isTablet ? 400 : 550
  const chartMargin = isMobile 
    ? { left: 60, right: 20, top: 20, bottom: 40 }
    : isTablet
    ? { left: 80, right: 25, top: 25, bottom: 45 }
    : { left: 100, right: 30, top: 30, bottom: 50 }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = {
          dataInicio: filtros.dataInicio.toISOString().slice(0, 10),
          dataFim: filtros.dataFim.toISOString().slice(0, 10),
        }
        const response = await axios.get('/api/dashboard/evolucao-saldo', {
          params,
        })
        setData(response.data)
      } catch (error) {
        console.error('Erro ao buscar evolução do saldo:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filtros])

  if (loading) return <Skeleton variant="rectangular" height={chartHeight} />

  if (!data || data.datas.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={chartHeight}
        >
          <Typography variant={isMobile ? 'body2' : 'body1'}>
            Não há dados de pagamentos para exibir a evolução.
          </Typography>
        </Box>
      </Paper>
    )
  }

  const firstIndex = data.saldos.findIndex((s) => s !== 0)

  if (firstIndex === -1) {
    return (
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={chartHeight}
        >
          <Typography variant={isMobile ? 'body2' : 'body1'}>
            Não há saldos movimentados para exibir a evolução.
          </Typography>
        </Box>
      </Paper>
    )
  }

  const startIndex = Math.max(0, firstIndex - 1)
  const datasFiltradas = data.datas.slice(startIndex)
  const saldosFiltrados = data.saldos.slice(startIndex)

  if (startIndex === firstIndex - 1) {
    saldosFiltrados[0] = 0
  }

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
      <Typography 
        variant={isMobile ? 'subtitle1' : 'h6'} 
        sx={{ mb: { xs: 1, sm: 2 }, fontWeight: 600 }}
      >
        Evolução do Saldo Diário
      </Typography>
      <Box 
        sx={{ 
          width: '100%',
          minWidth: 0,
        }}
      >
        <LineChart
          xAxis={[
            {
              data: datasFiltradas,
              scaleType: 'point',
              label: 'Dias',
              tickNumber: isMobile ? 5 : isTablet ? 7 : 10,
            },
          ]}
          yAxis={[
            {
              valueFormatter: (value) => formatCurrency(value),
              tickNumber: isMobile ? 5 : isTablet ? 6 : 8,
            },
          ]}
          series={[
            {
              data: saldosFiltrados,
              label: 'Saldo',
              showMark: !isMobile,
              color: '#265ef8ff',
              area: true,
            },
          ]}
          height={chartHeight}
          margin={chartMargin}
          sx={{ width: '100%' }}
        />
      </Box>
    </Paper>
  )
}
