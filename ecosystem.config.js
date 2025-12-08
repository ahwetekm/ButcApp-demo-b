module.exports = {
  apps: [
    {
      name: "butcapp",
<<<<<<< HEAD
      script: "pnpm",
=======
      script: "npm",
>>>>>>> 0453dd6990a09020ca629977727e6f4302b6f7f7
      args: "start",
      cwd: "/var/www/butcapp",
      instances: 1,
      exec_mode: "fork",
      env: {
        "NODE_ENV": "production",
        "PORT": 3001
      },
      env_production: {
        "NODE_ENV": "production",
        "PORT": 3001
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/pm2/butcapp-error.log",
      out_file: "/var/log/pm2/butcapp-out.log",
      log_file: "/var/log/pm2/butcapp-combined.log",
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "1G",
      watch: false,
      ignore_watch: [
        "node_modules",
        "logs",
<<<<<<< HEAD
        ".git",
        ".next"
=======
        ".git"
>>>>>>> 0453dd6990a09020ca629977727e6f4302b6f7f7
      ],
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
<<<<<<< HEAD
      listen_timeout: 10000,
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
=======
      listen_timeout: 10000
>>>>>>> 0453dd6990a09020ca629977727e6f4302b6f7f7
    }
  ],
  deploy: {
    production: {
      user: "root",
      host: ["your-server-ip"],
      ref: "origin/master",
      repo: "https://github.com/ButcApp/ButcApp-demo-b.git",
      path: "/var/www/butcapp",
      "pre-deploy-local": "",
      "post-deploy": "pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": ""
    }
  }
};