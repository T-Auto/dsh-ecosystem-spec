import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vendoredStd = path.join(root, 'vendor', 'dsh-std')
const runner = path.join(root, 'conformance', 'tests', 'run.js')
const requiredPackages = [
  '@dsh-std/core',
  '@dsh-std/manifest',
  '@dsh-std/command',
  '@dsh-std/storage',
  '@dsh-std/messages',
  '@dsh-std/presentation',
  '@dsh-std/workspace',
  '@dsh-std/lifecycle',
]

const options = new Set(process.argv.slice(2))
const knownOptions = new Set(['--no-build', '--prepare-standalone', '--standalone'])
for (const option of options) {
  if (!knownOptions.has(option)) throw new Error(`unknown option: ${option}`)
}

function run(command, args, environment = process.env) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: environment,
    stdio: 'inherit',
  })
  if (result.error !== undefined) throw result.error
  if (result.signal !== null) throw new Error(`${command} terminated by ${result.signal}`)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function installedStdAvailable() {
  return requiredPackages.every(packageName => {
    try {
      import.meta.resolve(packageName)
      return true
    } catch (error) {
      if (error?.code === 'ERR_MODULE_NOT_FOUND') return false
      throw error
    }
  })
}

function vendoredStdBuilt() {
  return requiredPackages.every(packageName => fs.existsSync(path.join(
    vendoredStd,
    'packages',
    packageName.slice('@dsh-std/'.length),
    'lib',
    'index.js',
  )))
}

function prepareVendoredStd() {
  run('git', ['submodule', 'update', '--init', '--recursive', 'vendor/dsh-std'])
  const environment = { ...process.env, CI: process.env.CI ?? 'true' }
  if (process.platform === 'win32') {
    const corepackPnpm = path.join(path.dirname(process.execPath), 'node_modules', 'corepack', 'dist', 'pnpm.js')
    if (!fs.existsSync(corepackPnpm)) {
      throw new Error(`Corepack pnpm entry point is unavailable: ${corepackPnpm}`)
    }
    run(process.execPath, [corepackPnpm, '--dir', 'vendor/dsh-std', 'install', '--frozen-lockfile'], environment)
    run(process.execPath, [corepackPnpm, '--dir', 'vendor/dsh-std', 'build'], environment)
    return
  }
  run('pnpm', ['--dir', 'vendor/dsh-std', 'install', '--frozen-lockfile'], environment)
  run('pnpm', ['--dir', 'vendor/dsh-std', 'build'], environment)
}

const prepareOnly = options.has('--prepare-standalone')
const forceStandalone = prepareOnly || options.has('--standalone')
const noBuild = options.has('--no-build')

if (!forceStandalone && installedStdAvailable()) {
  console.log('[conformance] using installed @dsh-std packages')
  run(process.execPath, [runner])
  process.exit(0)
}

if (!vendoredStdBuilt()) {
  if (noBuild) {
    throw new Error('no installed @dsh-std packages or built vendor/dsh-std fallback is available')
  }
  prepareVendoredStd()
} else if (forceStandalone && !noBuild) {
  prepareVendoredStd()
}

if (prepareOnly) process.exit(0)

console.log(`[conformance] using standalone dsh-std at ${vendoredStd}`)
run(process.execPath, [runner], {
  ...process.env,
  DSH_STD_ROOT: vendoredStd,
})
