#!/usr/bin/env node
import * as esbuild from 'esbuild'
import  babel  from 'esbuild-plugin-babel'


await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'dist/main.js',
  platform: 'node',
  packages: 'external',
  minify: true,
   loader: {
    '.js': 'jsx',
  },
  plugins: [
    babel({
      presets: ['@babel/preset-env'],
    }),
  ],
})