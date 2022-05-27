const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const nested = require('postcss-nested');
require('dotenv').config()

const mode = process.env.NODE_ENV;


const config = {
  plugins: [
    nested(),
    //Some plugins, like postcss-nested, need to run before Tailwind,
    tailwindcss(),
    //But others, like autoprefixer, need to run after,
    autoprefixer(),
  ],
};

if (mode === 'production') {
  config.plugins.push(cssnano())
}

module.exports = config;