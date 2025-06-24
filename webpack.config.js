const path = require('path')

module.exports = {
  entry: {
    ContaBancariaDataGrid: './wwwroot/js/components/ContaBancariaDataGrid.jsx',
    LancamentosDataGrid: './wwwroot/js/components/LancamentosDataGrid.jsx',
    PessoasDataGrid: './wwwroot/js/components/PessoasDataGrid.jsx',
    PlanoContaDataGrid: './wwwroot/js/components/PlanoContaDataGrid.jsx',
    FormRegister: './wwwroot/js/components/FormRegister.jsx',
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
