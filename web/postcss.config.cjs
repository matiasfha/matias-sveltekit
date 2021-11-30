const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const nested = require('postcss-nested');
require('dotenv').config()

const mode = process.env.NODE_ENV;
const dev = mode === "development";

const config = {
	plugins: [
        //Some plugins, like postcss-nested, need to run before Tailwind,
        tailwindcss(),
        //But others, like autoprefixer, need to run after,
        autoprefixer(),
        nested(),
        !dev && cssnano({
			preset: "default",
		})
    ],
};

module.exports = config;