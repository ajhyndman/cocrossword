/** @type {import('@remix-run/dev').AppConfig} */
export default {
  // appDirectory: "app",
  assetsBuildDirectory: "public/dist",
  // ignoredRouteFiles: ["**/.*"],
  publicPath: "/dist/",
  // routes(defineRoutes) {
  //   return defineRoutes((route) => {
  //     route("/somewhere/cool/*", "catchall.tsx");
  //   });
  // },
  serverBuildPath: "dist/index.js",
};
