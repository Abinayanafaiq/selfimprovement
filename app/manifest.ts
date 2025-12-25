import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SelfImprovement App',
    short_name: 'SelfImprovement',
    description: 'Grow your habits, grow yourself.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFBF7',
    theme_color: '#FDFBF7',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
