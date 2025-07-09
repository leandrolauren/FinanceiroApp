const path = require('path')

module.exports = {
  entry: {
    ContaBancariaDataGrid:
      './wwwroot/js/components/ContaBancaria/ContaBancariaDataGrid.jsx',
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
    ContaDeleteModal:
      './wwwroot/js/components/ContaBancaria/ContaDeleteModal.jsx',
    Notificacao: './wwwroot/js/components/Shared/Notificacao.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'wwwroot/js/dist'),
    filename: '[name].bundle.js',
    clean: true, // limpa arquivos antigos no build
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
