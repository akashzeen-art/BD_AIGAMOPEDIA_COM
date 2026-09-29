module.exports = {
  apps: [
    {
      name: 'ksa-aigamopedia',
      script: 'server.js',
      cwd: '/var/www/vaszeen/ksa.aigamopedia.com',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 5055,
      },
    },
  ],
};
