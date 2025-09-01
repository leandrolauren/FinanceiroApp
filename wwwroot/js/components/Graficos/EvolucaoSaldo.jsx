import React, { useState, useEffect } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { Box, Typography, Skeleton, Paper } from '@mui/material'
import axios from 'axios'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

export default function EvolucaoSaldo({ filtros }) {
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

  if (loading) return <Skeleton variant="rectangular" height={550} />

  if (!data || data.datas.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={550}
        >
          <Typography>
            Não há dados de pagamentos para exibir a evolução.
          </Typography>
        </Box>
      </Paper>
    )
  }

  const firstIndex = data.saldos.findIndex((s) => s !== 0)

  if (firstIndex === -1) {
    return (
      <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={550}
        >
          <Typography>
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
    <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
      <Typography variant="h6">Evolução do Saldo Diário</Typography>
      <LineChart
        xAxis={[
          {
            data: datasFiltradas,
            scaleType: 'point',
            label: 'Dias',
          },
        ]}
        yAxis={[
          {
            valueFormatter: (value) => formatCurrency(value),
          },
        ]}
        series={[
          {
            data: saldosFiltrados,
            label: 'Saldo',
            showMark: false,
            color: '#265ef8ff',
            area: true,
          },
        ]}
        height={550}
        margin={{ left: 100, right: 30, top: 30, bottom: 50 }}
      />
    </Paper>
  )
}
