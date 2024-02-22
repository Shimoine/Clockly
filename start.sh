#!/bin/sh

npm run build

bundle exec ruby server.rb &

./auto_exec.sh
