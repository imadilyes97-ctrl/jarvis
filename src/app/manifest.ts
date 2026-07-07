import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JARVIS — Interface',
    short_name: 'JARVIS',
    description: "Interface web de l'assistant JARVIS",
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
  }
}
