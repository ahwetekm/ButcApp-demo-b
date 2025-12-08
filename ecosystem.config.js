{
  "apps": [
    {
      "name": "butcapp",
      "script": "npm",
      "args": "start",
      "cwd": "/var/www/butcapp",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "error_file": "/var/log/pm2/butcapp-error.log",
      "out_file": "/var/log/pm2/butcapp-out.log",
      "log_file": "/var/log/pm2/butcapp-combined.log",
      "time": true,
      "autorestart": true,
      "max_restarts": 10,
      "min_uptime": "10s",
      "max_memory_restart": "1G",
      "watch": false,
      "ignore_watch": [
        "node_modules",
        "logs",
        ".git"
      ],
      "restart_delay": 4000,
      "kill_timeout": 5000,
      "wait_ready": true,
      "listen_timeout": 10000
    }
  ],
  "deploy": {
    "production": {
      "user": "root",
      "host": ["your-server-ip"],
      "ref": "origin/master",
      "repo": "https://github.com/ButcApp/ButcApp-demo-b.git",
      "path": "/var/www/butcapp",
      "pre-deploy-local": "",
      "post-deploy": "pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": ""
    }
  }
}