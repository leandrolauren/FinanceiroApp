import React, { useState, useEffect } from 'react'
import { PieChart } from '@mui/x-charts/PieChart'
import { Box, Typography, Skeleton } from '@mui/material'
import axios from 'axios'

export default function TopDespesasChart({ filtros }) {
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
        variant="circular"
        width={300}
        height={300}
        sx={{ mx: 'auto' }}
      />
    )

  return (
    <Box>
      <Typography variant="h6" align="center">
        Top 5 Despesas por Categoria
      </Typography>
      {data.length > 0 ? (
        <PieChart
          series={[
            {
              data,
              innerRadius: 60,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 5,
            },
          ]}
          height={300}
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
          height={300}
        >
          <Typography>Nenhuma despesa encontrada no período.</Typography>
        </Box>
      )}
    </Box>
  )
}
