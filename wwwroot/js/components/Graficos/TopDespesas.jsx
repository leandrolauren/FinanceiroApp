import React, { useState, useEffect } from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import { Box, Typography, Skeleton, Paper, useTheme, useMediaQuery, alpha } from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

export default function TopDespesas({ filtros }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = {
          dataInicio: filtros.dataInicio.toISOString().slice(0, 10),
          dataFim: filtros.dataFim.toISOString().slice(0, 10),
          status: filtros.status,
        }
        const response = await axios.get('/api/dashboard/top-despesas', {
          params,
        })
        setData(response.data)
      } catch (error) {
        console.error('Erro ao buscar Top 5 Despesas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filtros])

  if (loading) return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Skeleton variant="text" width="60%" height={30} />
      <Skeleton variant="rectangular" height={250} sx={{ mt: 2, borderRadius: 2 }} />
    </Paper>
  )

  const chartHeight = 300

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box display="flex" alignItems="center" mb={2} gap={1}>
        <ReceiptLongIcon color="error" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Maiores Despesas
        </Typography>
      </Box>

      {data.length > 0 ? (
        <Box sx={{ width: '100%', mt: 2, height: chartHeight + 50 }}>
          <BarChart
            dataset={data}
            xAxis={[{ 
              scaleType: 'band', 
              dataKey: 'categoria',
              tickLabelStyle: {
                fontSize: 12,
                fontWeight: 600,
                angle: -35,
                textAnchor: 'end',
              }
            }]}
            series={[{ 
              dataKey: 'total', 
              color: theme.palette.error.main,
              valueFormatter: (v) => formatCurrency(v)
            }]}
            height={chartHeight + 50}
            margin={{ left: 70, right: 20, top: 10, bottom: 80 }}
            slotProps={{
              legend: { hidden: true },
            }}
            sx={{
              '& .MuiBarElement-root': { rx: 6, stroke: alpha(theme.palette.error.main, 0.5), strokeWidth: 1 },
              width: '100%'
            }}
          />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={chartHeight}>
          <Typography variant="body2" color="text.secondary">Nenhuma despesa.</Typography>
        </Box>
      )}



    </Paper>
  )
}

