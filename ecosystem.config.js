module.exports = {
  apps: [
    {
      name: 'ct-aoai-gpt-chat-demo',
      script: './node_modules/next/dist/bin/next',
      args: `start -p ${process.env.PORT || 3000}`,
      watch: false,
      autorestart: true,
    },
  ],
};
