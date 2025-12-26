import React, { useState, useEffect } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { Box, Typography, Skeleton, Paper, useTheme, useMediaQuery, alpha } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

export default function EvolucaoSaldo({ filtros }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const chartHeight = isMobile ? 300 : 400

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

  if (loading) return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="text" width="200px" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={chartHeight} sx={{ borderRadius: 4 }} />
    </Paper>
  )

  if (!data || !data.datas || data.datas.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography color="text.secondary">Dados insuficientes para exibir a evolução.</Typography>
      </Paper>
    )
  }

  // Preparar os arrays de dados
  const xAxisData = data.datas.map(d => new Date(d + 'T00:00:00'))
  const seriesData = data.saldos.map(s => s || 0)

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider',
        background: alpha(theme.palette.background.paper, 1),
        width: '100%',
        position: 'relative'
      }}
    >
      <Box display="flex" alignItems="center" mb={3} gap={1.5}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          display: 'flex'
        }}>
          <TrendingUpIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Evolução do Patrimônio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Saldo acumulado diário
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', minHeight: chartHeight }}>
        <LineChart
          xAxis={[{
            data: xAxisData,
            scaleType: 'time',
            valueFormatter: (v) => {
              if (v instanceof Date && !isNaN(v)) {
                return v.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              }
              return ''
            },
          }]}
          yAxis={[{
             valueFormatter: (v) => formatCurrency(v),
          }]}
          series={[{
            data: seriesData,
            label: 'Patrimônio',
            color: theme.palette.primary.main,
            area: true,
            showMark: false,
            curve: 'monotoneX',
          }]}
          grid={{ horizontal: true, vertical: true }}
          height={chartHeight}
          margin={{ top: 30, right: 30, bottom: 40, left: isMobile ? 60 : 100 }}
          slotProps={{
             legend: { hidden: true },
             tooltip: { trigger: 'axis' }
          }}
          sx={{
            width: '100%',
            '.MuiLineElement-root': { strokeWidth: 3 },
            '.MuiAreaElement-root': { 
              fillOpacity: 0.2,
              fill: theme.palette.primary.main 
            },
            '.MuiChartsGrid-line': { 
              stroke: theme.palette.divider, 
              strokeDasharray: '4 4' 
            }
          }}
        />
      </Box>


    </Paper>
  )
}



