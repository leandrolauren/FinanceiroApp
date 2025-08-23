const path = require('path')

module.exports = {
  entry: {
    Main: './wwwroot/js/components/Layout/Main.jsx',
    ContaBancariaDataGrid:
      './wwwroot/js/components/ContaBancaria/ContaBancariaDataGrid.jsx',
    Lancamentos: './wwwroot/js/components/Lancamento/Lancamentos.jsx',
    LancamentosDataGrid:
      './wwwroot/js/components/Lancamento/LancamentosDataGrid.jsx',
    PessoasDataGrid: './wwwroot/js/components/Pessoa/PessoasDataGrid.jsx',
    PlanoContaDataGrid:
      './wwwroot/js/components/PlanoConta/PlanoContaDataGrid.jsx',
    PlanoContaDeleteModal:
      './wwwroot/js/components/PlanoConta/PlanoContaDeleteModal.jsx',
    FormRegister: './wwwroot/js/components/Usuario/FormRegister.jsx',
    PessoaDeleteModal: './wwwroot/js/components/Pessoa/PessoaDeleteModal.jsx',
    LancamentoDeleteModal:
      './wwwroot/js/components/Lancamento/LancamentoDeleteModal.jsx',
    Login: './wwwroot/js/components/Login/Login.jsx',
    ContaDeleteModal:
      './wwwroot/js/components/ContaBancaria/ContaDeleteModal.jsx',
    CreateContaForm:
      './wwwroot/js/components/ContaBancaria/CreateContaForm.jsx',
    EditContaForm: './wwwroot/js/components/ContaBancaria/EditContaForm.jsx',
    Notificacao: './wwwroot/js/components/Shared/Notificacao.jsx',
    EntradaeSaida: './wwwroot/js/components/Graficos/EntradaeSaida.jsx',
    HomePage: './wwwroot/js/components/Layout/HomePage.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'wwwroot/js/dist'),
    filename: '[name].bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
        },
      },
    },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@emotion/react': 'emotionReact',
    '@emotion/styled': 'emotionStyled',
  },
  mode: 'development',
}
