import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function parseAllowedHosts(value) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = parseAllowedHosts(env.VITE_ALLOWED_HOSTS)

  return {
    plugins: [react()],
    server: allowedHosts.length ? { allowedHosts } : {}
  }
})