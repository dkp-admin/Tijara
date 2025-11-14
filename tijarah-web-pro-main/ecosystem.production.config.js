module.exports = {
  apps: [
    {
      name: 'tijarah-web-prod',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
        NEXT_PUBLIC_APP_ENV: 'production',
        NEXT_PUBLIC_FRONTEND_URL: 'https://app.tijarah360.com'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3004,
        NEXT_PUBLIC_APP_ENV: 'production',
        NEXT_PUBLIC_FRONTEND_URL: 'https://app.tijarah360.com'
      }
    }
  ]
};
