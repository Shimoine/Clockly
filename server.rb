require 'sinatra'
require 'sinatra/cross_origin'
require "sinatra/json"
require "json"
require "google-apis-calendar_v3"
require 'googleauth/stores/file_token_store'
require 'dotenv/load'

#@db_path = config["db_path"]
Dotenv.load

enable :cross_origin

def file_load(key)
    settings_file_path = "settings.yml"
    config = YAML.load_file(settings_file_path) if File.exist?(settings_file_path)
    db_path = config["db_path"]
    begin
        File.read(db_path + key)
    rescue
        nil
    end
end

def file_store(key, value)
    settings_file_path = "settings.yml"
    config = YAML.load_file(settings_file_path) if File.exist?(settings_file_path)
    db_path = config["db_path"]
    begin
        File.write("#{db_path + key}", value)
    rescue
        nil
    end
end

def get_calendar
end

def insert_event
end

#####################################################
# プログラム自動実行部
#####################################################

def auto_exec(calendar_id_list)
end


before do
    response.headers['Access-Control-Allow-Origin'] = '*'
    settings_file_path = "settings.yml"
    #config = YAML.load_file(settings_file_path) if File.exist?(settings_file_path)
    #@db_path = config["db_path"]

    @client = Google::Apis::CalendarV3::CalendarService.new
    @authorizer = Google::Auth::UserAuthorizer.new(
        Google::Auth::ClientId.new(ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET']), 
        Google::Apis::CalendarV3::AUTH_CALENDAR, 
        Google::Auth::Stores::FileTokenStore.new(file: ENV['TOKEN_STORE_PATH']), 
        ENV['GOOGLE_CALLBACK_URL']
    )
    @client.client_options.application_name = "Clockly"
    @client.authorization = @authorizer.get_credentials(ENV['DEFAULT_USER'])
end

get '/' do
    "Hello! This is Clockly server"
end

get '/authorize' do
    #credentials = authorizer.get_credentials(<email)
    #@client.authorization = authorizer.credentials(config.default_user)
    puts @authorizer.get_authorization_url
    return json @authorizer.get_authorization_url
end

get '/auth/google_oauth2/callback' do
    @authorizer.get_and_store_credentials_from_code(
        user_id: ENV['DEFAULT_USER'],
        code: params[:code]
    )
    redirect 'http://localhost:3000/settings'
end

#####################################################
# カレンダ管理部
#####################################################

# カレンダの取得機能
get '/calendar_list' do
    puts @client.list_calendar_lists().items.map{|e| e.summary}
    return json @client.list_calendar_lists().items#.map{|e| e.summary}
end

get '/calendar/:id?' do
end

# カレンダの更新機能
post '/create_calendar' do
end

post '/delete_calendar' do
end

post '/insert_event' do
end

post '/update_event' do
end

post '/delete_event' do
end

#####################################################
# プログラム管理部
#####################################################

# プログラムの取得機能
get '/programs/:id?' do
    programs = JSON.parse(file_load("program-repository.json"))
    return json programs if !params["id"]
    programs.each do |program|
        return json program if program["id"] == params["id"]
    end
end

# プログラムリポジトリの更新機能
post '/create_program' do
    data = JSON.parse(request.body.read)
    programs = []
    programs = JSON.parse(file_load("program-repository.json")) if file_load("program-repository.json")
    program = {
        "id" => "#{data['id']}",
        "name" => "#{data['name']}",
        "block" => "#{data['blockXml']}",
        "code" => "#{data['jsCode']}",
        "rbcode" => "#{data['rbCode']}",
    }
    programs << program
    file_store("program-repository.json", programs.to_json)
end

post '/update_program' do
    data = JSON.parse(request.body.read)
    updated_program = {
        "id" => "#{data['id']}",
        "name" => "#{data['name']}",
        "block" => "#{data['block']}",
        "code" => "#{data['code']}",
    }
    return nil if programs = file_load("program-repository.json")
    programs = JSON.parse(programs)
    programs.each_with_index do |program, i|
        if program["id"] == updated_program["id"]
            programs.delete_at(i);
        end
    end
    programs << program
    file_store("program-repository.json", programs.to_json)
end

post '/delete_program' do
    data = JSON.parse(request.body.read)
    delete_program_id = data['id']
    return nil if programs = file_load("program-repository.json")
    programs = JSON.parse(programs)
    programs.each_with_index do |program, i|
        if program["id"] == delete_program_id
            programs.delete_at(i);
        end
    end
end
