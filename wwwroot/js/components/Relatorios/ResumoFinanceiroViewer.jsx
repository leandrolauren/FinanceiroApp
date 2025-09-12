import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Button } from '@heroui/react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const KpiCard = ({ title, value, color, lancamentos, onToggle }) => {
  return (
    <Paper
      elevation={3}
      sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}
      onClick={onToggle}
    >
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold" color={color}>
        {formatCurrency(value)}
      </Typography>
      <Typography variant="caption">
        ({lancamentos.length} lançamentos)
      </Typography>
    </Paper>
  )
}

const LancamentosTable = ({ lancamentos }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Descrição</TableCell>
          <TableCell>Pessoa</TableCell>
          <TableCell>Categoria</TableCell>
          <TableCell align="right">Valor</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lancamentos.map((l) => (
          <TableRow key={l.Id}>
            <TableCell>{l.Descricao}</TableCell>
            <TableCell>{l.Pessoa?.Nome}</TableCell>
            <TableCell>{l.PlanoContas?.Descricao}</TableCell>
            <TableCell align="right">{formatCurrency(l.Valor)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const ResumoFinanceiroViewer = ({ reportData, onBack }) => {
  const [expanded, setExpanded] = useState(false)

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const { NomeUsuario, DataInicio, DataFim, StatusFiltro, Kpis, Lancamentos } =
    reportData

  const lancamentosReceita = (Lancamentos || []).filter(
    (l) => l.Tipo === 'Receita',
  )
  const lancamentosDespesa = (Lancamentos || []).filter(
    (l) => l.Tipo === 'Despesa',
  )

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="light"
        onPress={onBack}
        startContent={<ArrowBackIcon />}
        className="mb-4"
      >
        Voltar para Relatórios
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Resumo Financeiro
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Período: {new Date(DataInicio).toLocaleDateString()} a{' '}
          {new Date(DataFim).toLocaleDateString()} | Status: {StatusFiltro}
        </Typography>
      </Paper>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <KpiCard
            title="Total Receitas"
            value={Kpis?.TotalReceitas || 0}
            color="success.main"
            lancamentos={lancamentosReceita}
            onToggle={handleChange('receitas')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KpiCard
            title="Total Despesas"
            value={Kpis?.TotalDespesas || 0}
            color="error.main"
            lancamentos={lancamentosDespesa}
            onToggle={handleChange('despesas')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KpiCard
            title="Saldo"
            value={Kpis?.Saldo || 0}
            color={Kpis?.Saldo >= 0 ? 'text.primary' : 'error.main'}
            lancamentos={Lancamentos || []}
            onToggle={handleChange('saldo')}
          />
        </Grid>
      </Grid>

      <Accordion
        expanded={expanded === 'receitas'}
        onChange={handleChange('receitas')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Detalhamento de Receitas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {lancamentosReceita.length > 0 ? (
            <LancamentosTable lancamentos={lancamentosReceita} />
          ) : (
            <Typography>Nenhuma receita no período.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'despesas'}
        onChange={handleChange('despesas')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Detalhamento de Despesas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {lancamentosDespesa.length > 0 ? (
            <LancamentosTable lancamentos={lancamentosDespesa} />
          ) : (
            <Typography>Nenhuma despesa no período.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'saldo'}
        onChange={handleChange('saldo')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Todos os Lançamentos do Período</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {(Lancamentos || []).length > 0 ? (
            <LancamentosTable lancamentos={Lancamentos} />
          ) : (
            <Typography>Nenhum lançamento no período.</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default ResumoFinanceiroViewer
