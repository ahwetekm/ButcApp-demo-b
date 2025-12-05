module.exports = {
  apps: [{
    name: 'butcapp',
    script: '.next/standalone/server.js',
    cwd: '/var/www/butcapp',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: 'postgresql://username:password@localhost:5432/butcapp_db'
    },
    error_file: '/var/log/butcapp/error.log',
    out_file: '/var/log/butcapp/out.log',
    log_file: '/var/log/butcapp/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}