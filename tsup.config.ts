import type { Options } from 'tsup'

import pkg from './package.json'
const isProduction = process.env.NODE_ENV === 'production'
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

const noExternal = [
  ...Object.keys(pkg.dependencies || {}),
]

export default <Options>{
  entryPoints: ['src/index.ts'],
  outDir: 'dist',
  target: 'node18', // needed for working ESM
  format: ['esm'],
  // splitting: false,
  sourcemap: true,
  clean: true,
  minify: isProduction,
  external: [...external, 'pg-native'],
  // noExternal,
  // skipNodeModulesBundle: true,
  dts: true,
}
