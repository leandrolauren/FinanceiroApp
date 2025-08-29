import React, { useState, useEffect } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { Box, Typography, Skeleton, Paper } from '@mui/material'
import axios from 'axios'

export default function EvolucaoSaldoChart({ filtros }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <Skeleton variant="rectangular" height={300} />

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Evolução do Saldo Diário</Typography>
      {data && data.datas.length > 0 ? (
        <LineChart
          xAxis={[{ data: data.datas, scaleType: 'point' }]}
          series={[
            {
              data: data.saldos,
              label: 'Saldo (R$)',
              area: true,
              showMark: false,
            },
          ]}
          height={300}
        />
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={300}
        >
          <Typography>
            Não há dados de pagamentos para exibir a evolução.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
