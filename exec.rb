require "google-apis-calendar_v3"
require 'googleauth/stores/file_token_store'
require 'dotenv/load'

@client = Google::Apis::CalendarV3::CalendarService.new
@authorizer = Google::Auth::UserAuthorizer.new(
    Google::Auth::ClientId.new(ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET']), 
    Google::Apis::CalendarV3::AUTH_CALENDAR, 
    Google::Auth::Stores::FileTokenStore.new(file: ENV['TOKEN_STORE_PATH']), 
    ENV['GOOGLE_CALLBACK_URL']
)
@client.client_options.application_name = "Clockly"
@client.authorization = @authorizer.get_credentials(ENV['DEFAULT_USER'])

settings_file_path = "settings.yml"
config = YAML.load_file(settings_file_path) if File.exist?(settings_file_path)
db_path = config["db_path"]
programs = JSON.parse(File.read(db_path + "program-repository.json"))

programs.each do |program|
    if program['enable_auto']
        code = program['ruby_code']
        full_code = 'if updated(' + program['calendar_id_list'] + ')\n' + code + '\nend'
        #eval(full_code)
    end
end

def updated(calendar_id_list, etag_list)
    calendar_id_list.each do |calendar_id|
        events = @client.list_events(calendar_id, single_events: true)
        puts events.etag
        return true if !etag_list.include?(events.etag)
    end
    return false
end

def get_events(calendar_id)
    min = DateTime.new(Date.today.year.to_i, 1, 1).to_s
    events = @client.list_events(calendar_id, single_events: true)
    return events
end

def insert_event(event, calendar_id)
    google_event = Google::Apis::CalendarV3::Event.new({
        id: event.id,
        summary: event.summary,
        start: event.dump.start,
        end: event.dump.end,
        sequence: event.sequence
    })
    events = client.list_events(calendar_id, single_events: true)
    event_id_list = events.items.map{|e| e.id}
    if event_id_list.include?(google_event.id)
        @client.update_event(calendar_id, google_event.id, google_event)
    else
        @client.insert_event(calendar_id, google_event)
    end
end
