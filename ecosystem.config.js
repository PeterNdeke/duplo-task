const A_GB_SIZE = 1024;

const SIZE_01 = A_GB_SIZE * 7;
const SIZE_02 = Number(process.env.APP_NODE_MEMORY_SIZE_GB);

const MEMORY_SIZE =
  SIZE_02 && typeof SIZE_02 === "number" && SIZE_02 > A_GB_SIZE
    ? SIZE_02
    : SIZE_01;

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "Server",
      script: "./dist/index.js",
      source_map_support: true,
      exec_mode: "cluster",
      instances: "duplo",
      node_args: [`--max-old-space-size=${MEMORY_SIZE}`],
    },
  ],
};
