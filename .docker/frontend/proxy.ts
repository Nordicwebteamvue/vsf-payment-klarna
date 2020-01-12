import { serverHooks } from '@vue-storefront/core/server/hooks'
import proxy from 'http-proxy-middleware'

serverHooks.afterApplicationInitialized(({ app }) => {
  console.log('Init proxy')
  app.use(
    '/api',
    proxy({ target: 'http://api:8080', changeOrigin: true })
  );
})
