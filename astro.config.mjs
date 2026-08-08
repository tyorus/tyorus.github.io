// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://tyorus.com',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  redirects: {
    '/about': '/resume',
    '/tutorials': '/blog',
    '/tutorials/install-ww3': '/blog/install-ww3',
    '/tutorials/multi-panel-plot-di-grads': '/blog/multi-panel-plot-di-grads',
    '/posts/ruang-lingkup-meteorologi': '/blog/ruang-lingkup-meteorologi',
    '/posts/transpor-uap-air': '/blog/transpor-uap-air',
    '/posts/budget-air-atmosfer': '/blog/budget-air-atmosfer',
    '/posts/moisture-flux-divergence': '/blog/moisture-flux-divergence',
    '/posts/why-does-convection-weaken-over-Sumatra-Island-in-an-active-phase-of-the-MJO':
      '/blog/why-does-convection-weaken-over-sumatra-island-in-an-active-phase-of-the-mjo',
    '/posts/multi-panel-plot-di-grads': '/blog/multi-panel-plot-di-grads',
    '/posts/uji-hipotesis': '/blog/uji-hipotesis',
    '/posts/cold-surge-cross-equatorial-northerly-surge':
      '/blog/cold-surge-cross-equatorial-northerly-surge',
    '/posts/visualisasi-uji-signifikansi-statistik-menggunakan-grads':
      '/blog/visualisasi-uji-signifikansi-statistik-menggunakan-grads',
    '/posts/install-ww3': '/blog/install-ww3',
    '/posts/estimating-upwelling-from-surface-wind':
      '/blog/estimating-upwelling-from-surface-wind',
    '/posts/awslabs-deaca01': '/blog/awslabs-deaca01',
  },
});
