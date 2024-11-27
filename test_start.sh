#!/bin/sh

echo writable_calendar_id: > settings.yml
echo - >> settings.yml

npm run start

node server.js &

SERVER_PID=$!
sleep 1
xdg-open http://localhost:4567 &

./auto_exec.sh