import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo'

const VideoEmbed = ({ videoId, title }) => (
  <Box
    sx={{
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      overflow: 'hidden',
      maxWidth: '100%',
      background: '#000',
      borderRadius: 1,
      mb: 2,
    }}
  >
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  </Box>
)

const tutorialData = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos: Visão Geral',
    description:
      'Bem-vindo ao nosso sistema Financeiro! Este vídeo inicial mostra todas as funcionalidades disponiveis e como navegar entre elas.',
    videoId: 'HJwykelCBOA',
  },
  {
    id: 'cadastrando-pessoas',
    title: 'Cadastrando Pessoas e Empresas',
    description:
      'Aprenda a cadastrar clientes, fornecedores e outras entidades com as quais você transaciona. Manter esses dados organizados facilita muito na hora de fazer os lançamentos.',
    videoId: '5EymsUveeus',
  },
  {
    id: 'cadastrando-planos-de-contas',
    title: 'Cadastrando Planos de Contas',
    description:
      'Aprenda a cadastrar os Planos de Contas, a estrutura que organiza suas finanças, crie categorias como "Salário", "Aluguel" para classificar suas Receitas e Despesas e entender para onde seu dinheiro está indo.',
    videoId: '2Poc0zytaSo',
  },
  {
    id: 'realizando-lancamentos',
    title: 'Realizando Lançamentos de Receitas e Despesas',
    description:
      'O coração do sistema! Veja como é fácil e rápido registrar suas receitas e despesas, associando-as a pessoas, contas e planos de contas. Explicamos também a diferença entre data de competência e data de pagamento.',
    videoId: '2Poc0zytaSo',
  },
  {
    id: 'importacao-ofx',
    title: 'Importando Transações com Arquivos OFX',
    description:
      'Economize tempo importando extratos bancários no formato OFX. O sistema identifica as transações e você só precisa categorizá-las. Veja o passo a passo neste tutorial.',
    videoId: '2Poc0zytaSo',
  },
  {
    id: 'analisando-dashboard',
    title: 'Analisando seus Dados no Dashboard',
    description:
      'Descubra como usar os gráficos e indicadores do dashboard para ter uma visão clara da sua saúde financeira, identificar gargalos e tomar decisões mais inteligentes.',
    videoId: '2Poc0zytaSo',
  },
]

const Tutorial = () => {
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, backgroundColor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Central de Orientações e Tutoriais
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Preparamos uma série de vídeos curtos para te ajudar a aproveitar ao
          máximo todas as funcionalidades da plataforma. Se tiver qualquer
          dúvida, comece por aqui!
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          Ainda gravando na versão nova e separando por tópico.
        </Alert>

        {tutorialData.map((item) => (
          <Accordion
            key={item.id}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: 3,
              borderRadius: 1,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${item.id}-content`}
              id={`${item.id}-header`}
              sx={{
                backgroundColor: 'action.hover',
              }}
            >
              <OndemandVideoIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">{item.title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
              <Typography paragraph color="text.secondary">
                {item.description}
              </Typography>
              <VideoEmbed videoId={item.videoId} title={item.title} />
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            Ainda com dúvidas? Me mande um email - leandrolaurenzette@gmail.com.
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Tutorial
