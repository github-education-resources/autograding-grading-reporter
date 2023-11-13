import * as esbuild from 'esbuild'
import * as path from 'path'

await esbuild.build({
  entryPoints: ['./src/main.js'],
  bundle: true,
  target: 'node',
  packages: 'external',
  outfile: path.resolve(__dirname, 'dist', 'main.js'),
  loader:{
    '.js' : 'babel',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [

  ],
})