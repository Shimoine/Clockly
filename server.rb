require 'sinatra'
require 'sinatra/cross_origin'
require "sinatra/json"
require "json"
require "google-apis-calendar_v3"
require 'googleauth/stores/file_token_store'
require 'dotenv/load'
require 'net/http'
require 'uri'
require 'cgi'


DB_PATH = "./db/"

Dotenv.load

enable :cross_origin

set :public_folder, 'build'

def remove_code_blocks(text)
    return '' if text.nil?
    
    # ```xml または ``` で始まる行を削除（開始マーカー）
    text = text.gsub(/^```[a-z]*\s*$/m, '')
    
    # 単独の ``` 行を削除（終了マーカー）
    text = text.gsub(/^```\s*$/m, '')
    
    text
end

#####################################################
# ファイル入出力部
#####################################################

def file_load(key)
    begin
        File.read(DB_PATH + key)
    rescue
        nil
    end
end

def file_store(key, value)
    begin
        File.write("#{DB_PATH + key}", value)
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

get '/authorize' do
    return json @authorizer.get_authorization_url
end

get '/auth/google_oauth2/callback' do
    @authorizer.get_and_store_credentials_from_code(
        user_id: ENV['DEFAULT_USER'],
        code: params[:code]
    )
    redirect 'http://localhost:4567/settings'
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
end

get '/calendar/:id?' do
    events = []
    page_token = nil
    calendar_meta = {}

    begin
        response = @client.list_events(
            params["id"],
            single_events: true,
            max_results: 2500,
            show_deleted: true,
            page_token: page_token
        )

        # 初回のリクエストでカレンダーのメタ情報を保存 
        if page_token.nil?
            calendar_meta = {
                access_role: response.access_role,
                default_reminders: response.default_reminders,
                description: response.description,
                etag: response.etag,
                summary: response.summary
            }
        end

        events.concat(response.items.map(&:to_h))
        page_token = response.next_page_token
    end while page_token

    full_response = calendar_meta.merge({items: events}).to_json

    return full_response
end
get '/get_writable' do
    writable_list = @config["writable_calendar_id"]
    return json writable_list
end

post '/insert_event' do
    data = JSON.parse(request.body.read)
    calendar_id = data['calendar_id']
    event = data['event']
    puts event['start']['date']
    puts event['start']['date_time']
    puts "id: #{event['id']}"
    google_event = Google::Apis::CalendarV3::Event.new(
        # id: event['id'],
        summary: event['summary'],
        location: event['location'],
        description: event['description'],
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
    data = JSON.parse(request.body.read)
    calendar_id = data['calendar_id']
    event = data['event']
    
    google_event = Google::Apis::CalendarV3::Event.new(
        id: event['id'],
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
        @client.update_event(calendar_id, event['id'], google_event)
    end
end

post '/delete_event' do
    data = JSON.parse(request.body.read)
    calendar_id = data['calendar_id']
    event_id = data['event_id']
    if @config["writable_calendar_id"].include?(calendar_id)
        @client.delete_event(calendar_id, event_id)
    end
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
    program_deleted = false
    programs.each_with_index do |program, i|
        if program["id"] == delete_program_id
            programs.delete_at(i);
            program_deleted = true
        end
    end
    file_store("program-repository.json", programs.to_json)
    if program_deleted
        status 200
        { message: "削除に成功しました" }.to_json
    else
        status 404
        { error: "削除対象が見つかりませんでした" }.to_json
    end
end


#####################################################
# ライブラリ管理部
#####################################################

get '/get_library' do
    library = JSON.parse(file_load('library.json'))
    library.to_json
end

post '/create_library' do
    data = JSON.parse(request.body.read)
    library = JSON.parse(file_load('library.json'))

    if data["name"] && data["blockXml"]
        library["id"] << data["id"]
        library["name"] << data["name"]
        library["xml"] << data["blockXml"]
        file_store('library.json', library.to_json)
        status 201
        { message: "ライブラリが追加されました" }.to_json
    else
        status 400
        { error: "無効なデータです" }.to_json
    end
end

post '/delete_library' do
    data = JSON.parse(request.body.read)
    library = JSON.parse(file_load('library.json'))
    program_deleted = false
    library["id"].each_with_index do |id, i|
        if id == data
            library["id"].delete_at(i)
            library["name"].delete_at(i)
            library["xml"].delete_at(i)
            program_deleted = true
        end
    end
    file_store('library.json', library.to_json)
    if program_deleted
        status 200
        { message: "削除に成功しました" }.to_json
    else
        status 404
        { error: "削除対象が見つかりませんでした" }.to_json
    end
end

#####################################################
# AI補完機能
#####################################################

# 会話履歴をファイルから読み込む
def load_chat_history(session_id)
    history_file = "#{DB_PATH}chat-history.json"
    return [] unless File.exist?(history_file)
    
    begin
        content = File.read(history_file)
        return [] if content.strip.empty?
        
        all_histories = JSON.parse(content)
        all_histories[session_id] || []
    rescue => e
        STDERR.puts "Failed to load chat history: #{e.message}"
        []
    end
end

# 会話履歴をファイルに保存する
def save_chat_history(session_id, chat_history)
    history_file = "#{DB_PATH}chat-history.json"
    
    begin
        all_histories = {}
        if File.exist?(history_file)
            content = File.read(history_file)
            all_histories = JSON.parse(content) unless content.strip.empty?
        end
        
        all_histories[session_id] = chat_history
        File.write(history_file, JSON.pretty_generate(all_histories))
        STDERR.puts "Chat history saved for session: #{session_id}"
    rescue => e
        STDERR.puts "Failed to save chat history: #{e.message}"
    end
end

post '/gemini-completion' do
    content_type :json
    
    begin
        puts "Received request for Gemini completion"
        data = JSON.parse(request.body.read)
        current_workspace = data['currentWorkspace']
        xml_example = data['xmlExample']
        rule_name = data['ruleName']
        available_calendars = data['availableCalendars'] || []

        puts "Current Workspace: #{current_workspace}\n\n\n"
        puts "Rule Name: #{rule_name}\n\n\n"
        
        # Gemini APIへのリクエスト構築
        gemini_api_key = ENV['GEMINI_API_KEY']
        if gemini_api_key.nil? || gemini_api_key.empty?
            return { error: 'Gemini API key is not configured' }.to_json
        end
        
        # Gemini API URL
        uri = URI("https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=#{gemini_api_key}")
        
        # リクエストボディ
        request_body = {
            contents: [{
                parts: [{
                    text: "
【ブロックプログラミング補完ルール】

あなたはBlocklyを使ったカレンダー操作のブロックプログラミング補完AIです。以下のルールに従って、現在のワークスペースのブロックを分析し、完成させてください。

## ルール名
#{rule_name || '不明なルール'}

## 基本ルール
1. 現在のワークスペースの意図を理解し、不完全な部分を補完する
2. 利用可能なブロック定義から適切なブロックを選択する
3. カレンダー操作の論理的なフローを構築する
4. shadow blockや接続されていない値は適切なブロックで置き換える
5. ルール名に応じて適切な処理フローを構築する

## XMLの書き方例
下記のxml_exampleを参考にして、正しいXML構造とvalue name、field nameの書き方を確認してください。

## ブロックカテゴリ
- カレンダ: カレンダー変数の管理
- カレンダ操作: 予定の取得、挿入、更新、削除
- 抽出: フィルター、条件分岐、条件判定
- 加工: データの変換、写像処理
- 日付: 日付・時刻の指定
- 集計/表示: データの集計と出力

## 利用可能なカレンダー（この中からのみカレンダーブロックを選択してください）
#{available_calendars.map{|c| "- #{c['summary']} (id: #{c['id']})"}.join("\n")}

## 厳格な出力ルール
-  field name と value name は必ず XML 例にある通りにしてください。決して任意の field name，value name を生成しないでください。例えば calendarSummaryField, calendarIdField, TEXT などの新しい field name を作らないでください。
- カレンダーブロックは必ず次の正確な形式を使ってください（例）：

<block type=\"calendar\">\n  <field name=\"summary\">マイカレンダ</field>\n  <field name=\"id\">nomura.laboratory@gmail.com</field>\n</block>

- カレンダーブロックで使用する summary と id の値は、必ず利用可能なカレンダー一覧（available_calendars）にあるものを使ってください。存在しないカレンダー名や ID を勝手に生成しないこと。
- 出力は完成した Blockly XML のみとし、説明文や余分なメタデータは一切含めないでください。

## 出力形式
完成したBlockly XMLのみを返してください。説明文は不要です。

現在のワークスペース: \n#{current_workspace} \n
XML例（ブロックの書き方参考）:\n#{xml_example}"
                }]
            }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8192
            }
        }
        
        # HTTPリクエスト送信
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        
        request = Net::HTTP::Post.new(uri)
        request['Content-Type'] = 'application/json'
        request.body = request_body.to_json
        
        response = http.request(request)

        puts "Gemini API Response Code: #{response.code}"
        
        if response.code == '200'
            result = JSON.parse(response.body)
            
            if result['candidates'] && result['candidates'].length > 0
                completed_xml = result['candidates'][0]['content']['parts'][0]['text']
                
                # XMLタグで囲まれた部分を抽出
                xml_match = completed_xml.match(/<xml[^>]*>.*?<\/xml>/m)
                if xml_match
                    completed_xml = xml_match[0]
                end
                
                return { completedXml: completed_xml }.to_json
            else
                return { error: 'No completion generated' }.to_json
            end
        else
            puts "Gemini API Error: #{response.code} - #{response.body}"
            return { error: "Gemini API request failed: #{response.code}" }.to_json
        end
        
    rescue JSON::ParserError => e
        puts "JSON Parse Error: #{e.message}"
        return { error: 'Invalid JSON in request' }.to_json
    rescue => e
        puts "General Error: #{e.message}"
        puts e.backtrace
        return { error: "Internal server error: #{e.message}" }.to_json
    end
end

post '/gemini-ask' do
    request.body.rewind
    body = JSON.parse(request.body.read)
    prompt = body["userMessage"] or halt 400, "missing prompt"
    current_workspace = body["currentWorkspace"] || ""
    rule_name = body["ruleName"] || ""
    xml_example = body["xmlExample"] || ""
    available_calendars = body['availableCalendars'] || []
    session_id = body["sessionId"] || "default"

    api_key = ENV['GEMINI_API_KEY'] or halt 500, "GEMINI_API_KEY not set"

    # ファイルから会話履歴を読み込む
    chat_history = load_chat_history(session_id)

    system_instruction = {
        role: "system",
        parts: [
            {
                text: "あなたは Blockly を用いたシステム (Clockly) のプログラミングアシスタントです．以下のルールに”必ず”従って，送られてくる質問に答えてください．
### 基本ルール
- 決して任意の field name，value name を生成しないでください．
- 例えば calendarSummaryField, calendarIdField, TEXT などの新しい field name を作らないでください．
- カレンダーブロックは必ず次の正確な形式を使ってください（例）：

<block type=\"calendar\">
  <field name=\"summary\">マイカレンダ</field>
  <field name=\"id\">nomura.laboratory@gmail.com</field>
</block>

- カレンダーブロックで使用する summary と id の値は、必ず利用可能なカレンダー一覧にあるものを使ってください。存在しないカレンダー名や ID を勝手に生成しないこと
- 利用可能なブロックは「利用可能な XML 一覧」に記載されているもののみです．
- 出力は出力形式に”必ず”従って出力してください．
- 質問者の作成しようとしているプログラム名は「#{rule_name}」です．
- 質問者の現在のワークスペースは以下の通りです．
#{current_workspace}


### 出力形式 (重要・厳守)
- 回答は Blockly XML と解説文に分けて出力してください．
- Blockly XML は <xml xmlns=\"https://developers.google.com/blockly/xml\"> タグで始まり </xml> タグで終わる形式にしてください．
- **絶対に XML を ```xml、```、`` などのマークダウン記法で囲まないでください！**
- **XML はそのまま生のテキストとして、マークダウン記法なしで出力してください！**
- **コードブロック（```）は一切使用しないでください！**
- 解説文は Blockly XML の後に改行を2つ挟んで出力してください．

【正しい出力例】

ここに会話文が入ります．

<xml xmlns=\"https://developers.google.com/blockly/xml\">
  <block type=\"calendar\">
    <field name=\"summary\">マイカレンダ</field>
    <field name=\"id\">calendar@gmail.com</field>
  </block>
</xml>

ここに解説文が入ります．

【間違った出力例（絶対にこうしないこと）】

```xml
<xml xmlns=\"https://developers.google.com/blockly/xml\">
  ...
</xml>
```


- 解説文が不要な場合は，Blockly XML のみを出力してください．
- XML が不要な場合は，テキストのみを出力してください．


### 利用可能な XML 一覧
#{xml_example}
###

### 利用可能なカレンダー一覧
#{available_calendars.map{|c| "- #{c['summary']} (id: #{c['id']})"}.join("\n")}
###
"
            }
        ]
    }

    puts "System Instruction:\n"
    puts system_instruction[:parts][0][:text]

    # ストリーミング用のURI
    uri = URI("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:streamGenerateContent?alt=sse&key=#{api_key}")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 60
    http.read_timeout = 3600

    req = Net::HTTP::Post.new(uri.request_uri)
    req["Content-Type"] = "application/json"
    req["Accept"] = "text/event-stream"
    req["Connection"] = "keep-alive"
    
    request_body = {
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7
        }
    }
    
    # 会話履歴全体を送信
    contents = []
    chat_history.each do |msg|
        role = msg["role"] == "user" ? "user" : "model"
        contents << {
            role: role,
            parts: [{ text: msg["text"] }]
        }
    end
    # 現在のユーザーメッセージを追加
    contents << {
        role: "user",
        parts: [{ text: prompt }]
    }
    request_body[:contents] = contents
    request_body[:system_instruction] = system_instruction

    req.body = request_body.to_json

    content_type 'text/event-stream'
    headers 'Cache-Control' => 'no-cache', 'Connection' => 'keep-alive', 'X-Accel-Buffering' => 'no'

    # アシスタントの回答を蓄積する変数
    assistant_response = ""

    stream(:keep_open) do |out|
        buffer = ""

        begin
            http.request(req) do |resp|
                resp.read_body do |chunk|
                    chunk.each_line do |line|
                        line.chomp!
                        next if line.strip.empty?

                        payload = line.start_with?("data: ") ? line.sub(/^data: /, '') : line

                        if payload.strip == "[DONE]"
                            out << "data: [DONE]\n\n"
                            out.flush if out.respond_to?(:flush)
                            next
                        end

                        parsed = nil
                        begin
                            parsed = JSON.parse(payload)
                        rescue JSON::ParserError
                            buffer << payload
                            begin
                                parsed = JSON.parse(buffer)
                                buffer = ""
                            rescue JSON::ParserError
                                parsed = nil
                            end
                        end

                        if parsed
                            items = parsed.is_a?(Array) ? parsed : [parsed]
                            items.each do |obj|
                                content_parts = obj.dig('candidates',0,'content','parts') || []
                                text_full = content_parts.map{|p| p['text'].to_s}.join
                                next if text_full.to_s.strip.empty?
                                text_full = remove_code_blocks(text_full)
                                assistant_response += text_full
                                out << "data: #{text_full.to_json}\n\n"
                                out.flush if out.respond_to?(:flush)
                            end
                        end
                    end
                end
            end

            out << "data: [DONE]\n\n"
            out.flush if out.respond_to?(:flush)
            
            # ストリーミング終了後、会話履歴を更新して保存
            chat_history << { "role" => "user", "text" => prompt }
            chat_history << { "role" => "assistant", "text" => assistant_response }
            save_chat_history(session_id, chat_history)
        rescue => e
            out << "data: {\"error\": \"#{e.message}\"}\n\n"
            out.flush if out.respond_to?(:flush)
        ensure
            out.close
        end
    end
end

# 会話履歴を取得するエンドポイント
get '/chat-history/:session_id' do
    session_id = params[:session_id]
    history = load_chat_history(session_id)
    json history
end

# すべてのセッションIDを取得するエンドポイント
get '/chat-sessions' do
    history_file = "#{DB_PATH}chat-history.json"
    
    begin
        if File.exist?(history_file)
            content = File.read(history_file)
            return json [] if content.strip.empty?
            
            all_histories = JSON.parse(content)
            sessions = all_histories.map do |session_id, messages|
                first_user_message = messages.find { |m| m["role"] == "user" }
                {
                    id: session_id,
                    title: first_user_message ? first_user_message["text"].slice(0, 30) : "新しいチャット",
                    message_count: messages.length,
                    created_at: session_id.split('_')[1]&.to_i || 0
                }
            end
            json sessions.sort_by { |s| -s[:created_at] }
        else
            json []
        end
    rescue => e
        STDERR.puts "Failed to load chat sessions: #{e.message}"
        json []
    end
end

# 会話履歴を削除するエンドポイント
delete '/chat-history/:session_id' do
    session_id = params[:session_id]
    history_file = "#{DB_PATH}chat-history.json"
    
    begin
        if File.exist?(history_file)
            all_histories = JSON.parse(File.read(history_file))
            all_histories.delete(session_id)
            File.write(history_file, JSON.pretty_generate(all_histories))
        end
        status 200
        { message: "会話履歴を削除しました" }.to_json
    rescue => e
        status 500
        { error: "削除に失敗しました: #{e.message}" }.to_json
    end
end

#####################################################

get '/*' do
    content_type 'text/html'
    return File.read('./build/index.html')
end
