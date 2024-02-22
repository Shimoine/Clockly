#!/bin/sh

while true; do
    echo "$etag_list"
    etag_list=`(bundle exec ruby exec.rb $etag_list)`
    sleep 60;
done
