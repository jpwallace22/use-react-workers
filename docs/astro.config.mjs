import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://jpwallace22.github.io',
  integrations: [
    starlight({
      title: 'Use React Workers',
      customCss: ['./src/tailwind.css'],
      social: {
        github: 'https://github.com/jpwallace22/use-react-workers',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            {
              label: 'Overview',
              link: '/start/overview/',
            },
            {
              label: 'Installation',
              link: '/start/installation/',
            },
          ],
        },
        {
          label: 'Hooks',
          autogenerate: {
            directory: 'hooks',
          },
        },
      ],
    }),
    react(),
    tailwind(),
  ],
});
