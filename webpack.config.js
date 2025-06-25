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
    FormRegister: './wwwroot/js/components/Usuario/FormRegister.jsx',
    PessoaDeleteModal: './wwwroot/js/components/Pessoa/PessoaDeleteModal.jsx',
    ContaDeleteModal:
      './wwwroot/js/components/ContaBancaria/ContaDeleteModal.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'wwwroot/js/dist'),
    filename: '[name].bundle.js',
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
  mode: 'development',
}
