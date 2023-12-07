import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Use React Workers',
      social: {
        github: 'https://github.com/jpwallace22/use-react-workers',
      },
      sidebar: [
        {
          label: 'Hooks',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', link: '/hooks/example/' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
