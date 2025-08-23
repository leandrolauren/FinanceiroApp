import * as React from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import { createRoot } from 'react-dom/client'

const despesas = [
  -4000, -3500, -5800, -4920, -1890, -12090, -3490, -14000, -3500, -12000,
  -2780, -1890,
]
const receitas = [
  24002, 13982, 9800, 3908, 4800, 3100, 4300, 6900, 13398, 9800, 3908, 3400,
]

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export default function EntradaeSaida() {
  return (
    <BarChart
      height={500}
      series={[
        { data: receitas, label: 'Receitas', color: '#4CAF50' },
        { data: despesas, label: 'Despesas', color: '#F44336' },
      ]}
      xAxis={[{ data: meses, scaleType: 'band', label: 'Mês' }]}
      yAxis={[
        {
          label: 'Valor (R$)',
          max: Math.max(...receitas, ...despesas) * 1.1,
        },
      ]}
      slotProps={{
        bar: { rx: 4 },
        legend: {
          direction: 'row',
          position: { vertical: 'top', horizontal: 'right' },
        },
      }}
    />
  )
}
