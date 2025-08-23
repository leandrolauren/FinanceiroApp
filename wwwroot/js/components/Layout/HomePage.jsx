import ReactDOM from 'react-dom/client'
import EntradaeSaida from '../Graficos/EntradaeSaida'

const HomePage = () => {
  return (
    <div class="text-center">
      <p>Sistema Financeiro projetado por Leandro 😎</p>

      <p>Apenas um Exemplo gráfico para implementar!</p>
      <EntradaeSaida />
    </div>
  )
}

const rootElement = document.getElementById('homepage-root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<HomePage />)
}

export default HomePage
