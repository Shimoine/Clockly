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

set :public_folder, 'build'

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
    @settings_file_path = "settings.yml"
    @config = YAML.load_file(@settings_file_path) if File.exist?(@settings_file_path)
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
    return json @authorizer.get_authorization_url
end

get '/auth/google_oauth2/callback' do
    @authorizer.get_and_store_credentials_from_code(
        user_id: ENV['DEFAULT_USER'],
        code: params[:code]
    )
    redirect 'http://localhost:3000/settings'
end

post '/writable' do
    data = JSON.parse(request.body.read)
    writable_list = @config["writable_calendar_id"]
    writable_list.delete(data['id'])
    writable_list << data['id'] if !writable_list.include?(data['id']) if data['status']
    @config["writable_calendar_id"] = writable_list
    YAML.dump(@config, File.open(@settings_file_path, 'w'))
end

#####################################################
# カレンダ管理部
#####################################################

# カレンダの取得機能
get '/calendar_list' do
    writable_calendar_list = @config["writable_calendar_id"]
    calendar_list = @client.list_calendar_lists().items.map do |calendar|
        {
            "summary" => calendar.summary,
            "id" => calendar.id,
            "writable" => writable_calendar_list.include?(calendar.id)
        }
    end
    return json calendar_list
    #puts @client.list_calendar_lists().items.map{|e| e.summary}
    #return json @client.list_calendar_lists().items#.map{|e| e.summary}
end

get '/calendar/:id?' do
    puts @client.list_events(params["id"], single_events: true)
    return @client.list_events(params["id"], single_events: true).to_h.to_json
end

# カレンダの更新機能
post '/create_calendar' do
end

post '/delete_calendar' do
end

post '/insert_event' do
    data = JSON.parse(request.body.read)
    calendar_id = data['calendar_id']
    event = data['event']
    puts event['start']['date']
    puts event['start']['date_time']
    google_event = Google::Apis::CalendarV3::Event.new(
        summary: event['summary'],
        location: event['location'],
        start: {
            date: event['start']['date'],
            date_time: event['start']['date_time']
        },
        end: {
            date: event['end']['date'],
            date_time: event['end']['date_time']
        }
    )
    if @config["writable_calendar_id"].include?(calendar_id)
        @client.insert_event(calendar_id, google_event)
    end
end

post '/update_event' do
end

post '/delete_event' do
    data = JSON.parse(request.body.read)
    calendar_id = data['calendar_id']
    event_id = data['event_id']
    @client.delete_event(calendar_id, event_id)
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
        "calendar_id_list" => data['calendar_id_list'],
        "enable_auto" => "#{data['enable_auto']}",
    }
    programs << program
    file_store("program-repository.json", programs.to_json)
end

post '/update_program' do
    data = JSON.parse(request.body.read)
    updated_program = {
        "id" => "#{data['id']}",
        "name" => "#{data['name']}",
        "block" => "#{data['blockXml']}",
        "code" => "#{data['jsCode']}",
        "rbcode" => "#{data['rbCode']}",
        "calendar_id_list" => data['calendar_id_list'],
        "enable_auto" => "#{data['enable_auto']}",
    }
    #return nil if programs = file_load("program-repository.json")
    programs = file_load("program-repository.json")
    programs = JSON.parse(programs)
    programs.each_with_index do |program, i|
        if program["id"] == updated_program["id"]
            programs.delete_at(i);
        end
    end
    programs << updated_program
    file_store("program-repository.json", programs.to_json)
end

post '/delete_program' do
    data = JSON.parse(request.body.read)
    delete_program_id = data['id']
    puts delete_program_id
    return nil unless programs = file_load("program-repository.json")
    programs = JSON.parse(programs)
    programs.each_with_index do |program, i|
        if program["id"] == delete_program_id
            programs.delete_at(i);
        end
    end
    file_store("program-repository.json", programs.to_json)
end

get '/*' do
    content_type 'text/html'
    return File.read('./build/index.html')
end
