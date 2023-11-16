/** @type {import('@remix-pwa/dev').WorkerConfig} */
export default {
  // appDirectory: "app",
  assetsBuildDirectory: 'public/dist',
  ignoredRouteFiles: ['**/.*', '**/*.css'],
  publicPath: '/dist/',
  // routes(defineRoutes) {
  //   return defineRoutes((route) => {
  //     route("/somewhere/cool/*", "catchall.tsx");
  //   });
  // },
  browserNodeBuiltinsPolyfill: {
    modules: { buffer: true },
  },
  serverBuildPath: 'dist/index.js',
  workerBuildDirectory: './public/dist',

  // work around a bug with esm import resolution
  // see: https://github.com/remix-pwa/monorepo/issues/112
  serverDependenciesToBundle: [/@remix-pwa\/.*/],
};
