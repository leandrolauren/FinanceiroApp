import React from 'react'
import { Helmet } from 'react-helmet-async'

const Seo = ({
  title = 'FinanceiroApp - Gestão Financeira Pessoal',
  description = 'Sistema para gestão financeira pessoal, desenvolvido com ASP.NET Core MVC e React. Controle seus lançamentos, contas e analise seus dados com dashboards interativos.',
  keywords = 'gestão financeira, finanças pessoais, controle de gastos, orçamento, despesas, receitas, financeiroapp',
  author = 'Leandro Laurenzette',
  ogTitle = 'FinanceiroApp - Sua Gestão Financeira Simplificada',
  ogDescription = 'Controle suas finanças de forma fácil e visual. Cadastre lançamentos, analise gráficos e tome decisões mais inteligentes com o FinanceiroApp.',
  ogImage = '/js/components/sitemark.svg',
  ogUrl = 'https://financeiroapp-7e5a.onrender.com',
}) => {
  const absoluteOgImageUrl = new URL(ogImage, ogUrl).href

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={absoluteOgImageUrl} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={ogTitle} />
      <meta property="twitter:description" content={ogDescription} />
      <meta property="twitter:image" content={absoluteOgImageUrl} />
    </Helmet>
  )
}

export default Seo
