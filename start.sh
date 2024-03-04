#!/bin/sh

echo writable_calendar_id: > settings.yml
echo - >> settings.yml

npm run build

bundle exec ruby server.rb &

./auto_exec.sh
