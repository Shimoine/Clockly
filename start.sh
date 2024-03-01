#!/bin/sh

echo -e "writable_calendar_id:\n-" > settings.yml

npm run build

bundle exec ruby server.rb &

./auto_exec.sh
