const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "auto-ssl-backend",
      cwd: path.resolve(__dirname, "apps/backend"),
      script: "yarn",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      time: true,
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "4000"
      }
    }
  ]
};

