import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.resolve(dirname, '../.env'))
  } catch {
  }
}
