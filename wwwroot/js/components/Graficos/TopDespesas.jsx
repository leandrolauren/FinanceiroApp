import React, { useState, useEffect } from 'react'
import { PieChart } from '@mui/x-charts/PieChart'
import { Box, Typography, Skeleton, Paper } from '@mui/material'
import axios from 'axios'

export default function TopDespesas({ filtros }) {
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
        const chartData = response.data.map((item, index) => ({
          id: index,
          value: item.total,
          label: item.categoria,
        }))
        setData(chartData)
      } catch (error) {
        console.error('Erro ao buscar Top 5 Despesas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filtros])

  if (loading)
    return (
      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', aspectRatio: '1 / 1' }}
      />
    )

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h6" align="center" mb={0}>
        Top 5 Despesas por Categoria
      </Typography>
      {data.length > 0 ? (
        <PieChart
          height={200}
          series={[
            {
              data,
              innerRadius: 50,
              outerRadius: 80,
              paddingAngle: 2,
              cornerRadius: 5,
            },
          ]}
          slotProps={{
            legend: {
              direction: 'vertical',
              position: { vertical: 'middle', horizontal: 'right' },
            },
          }}
        />
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: 250 }}
        >
          <Typography>Nenhuma despesa encontrada no período.</Typography>
        </Box>
      )}
    </Paper>
  )
}
