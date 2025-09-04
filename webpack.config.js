const path = require('path')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    entry: {
      main: './wwwroot/js/components/Layout/Main.jsx',
      Login: './wwwroot/js/components/Login/login-entry.jsx',
      FormRegister: './wwwroot/js/components/Usuario/form-entry.jsx',
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
          // Rule for your tailwind.css file which needs PostCSS
          test: /\.css$/i,
          include: path.resolve(__dirname, 'wwwroot/css'),
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          // Rule for other .css files (from libraries, etc.) that don't need PostCSS
          test: /\.css$/i,
          exclude: path.resolve(__dirname, 'wwwroot/css'),
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  }
}
