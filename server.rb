require 'sinatra'
require 'sinatra/cross_origin'
require "sinatra/json"
require "json"

enable :cross_origin

#####################################################
# プログラム自動実行部
#####################################################

def auto_exec(calendar_id_list)
end


before do
    response.headers['Access-Control-Allow-Origin'] = '*'
end

get '/' do
    "Hello! This is Clockly server"
end

#####################################################
# カレンダ管理部
#####################################################

# カレンダの取得機能
get '/calendar_list' do
end

get '/calendar/:id?' do
end

# カレンダの更新機能
post 'create_calendar' do
end

post 'delete_calendar' do
end

post 'insert_event' do
end

post 'update_event' do
end

post 'delete_event' do
end

#####################################################
# プログラム管理部
#####################################################

# プログラムの取得機能
get 'programs/:id?' do
end

# プログラムリポジトリの更新機能
post 'create_program' do
end

post 'update_program' do
end

post 'delete_program' do
end
