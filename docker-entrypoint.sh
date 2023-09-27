#! /bin/sh

cd /home/duplo

rm -rf node_modules

npm install
npm run build

pm2-runtime start ecosystem.config.js

tail -f /dev/null
