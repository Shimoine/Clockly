#!/bin/sh

echo writable_calendar_id: > settings.yml
echo - >> settings.yml

npm run build

bundle exec ruby server.rb &

SERVER_PID=$!
sleep 1
xdg-open http://localhost:4567 &
nodemon &

./auto_exec.sh
