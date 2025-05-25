const { watch } = require('fs');
const path = require('path');

module.exports = {
	entry: './src/index.js', // or ./src/media-viewer.js if you're just testing
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'assets'), // Shopify will load from here
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader', 'postcss-loader'],
			},
		],
	},
	mode: 'development',
	watch: true,
};
