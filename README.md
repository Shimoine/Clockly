# Clockly
Clocklyはユーザによるプログラミングを可能とするカレンダシステムである．
ユーザはビジュアルプログラミングによって，カレンダの集計や一括コピーなどの操作ができる．
また，Google Calendarなどの他のカレンダシステムと連携しデータのやり取りを可能とする．

Clocklyは以下の機能を持つ．
+ プログラムの作成

  Google Blocklyを用いたビジュアルプログラミングによってカレンダ操作をプログラミングできる．
+ プログラムの即時実行

  ブラウザからユーザが作成したプログラムを実行できる．
+ プログラムの自動実行

  カレンダの更新を契機にプログラムを自動で実行できる．

# Requirements
+ node 18.16.0
+ npm 9.5.1
+ Ruby 2.7.0
+ bundler 2.2.17

# Setup
### Clone Clockly
  GitHubよりClocklyのリポジトリをcloneする．
  ```
  $ git clone git@github.com:kimura3104/Clockly.git
  ```

### Setup config files

  以下のコマンドを使用し，.env.exampleから.envをコピーする．
  .envはGoogleCalendarAPIを使用するためのClient IDとClient Secretを格納する．
  ```
  $ cp .env.example .env
  ```

  以下のコマンドを使用し，settings.yml.exampleからsettings.ymlをコピーする．
  settings.ymlにはプログラムの自動実行を行うプログラムのリスト(auto_exec_program)およびプログラムで書き換え可能なカレンダのリスト(writable_calendar_id)が格納されている．
  ```
  $ cp settings.yml.example settings.yml
  ```

### Start Clockly
以下のコマンドを使用し，ClocklyのHTTPサーバを起動する．
  ```
  bundle exec ruby server.rb
  ```

## Google Calendarとの連携
  
+ .envの内容は以下のようになっている．
  ```
  1 GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXXXXXX
  2 GOOGLE_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  ```

+ .envファイルにGoogleCalendarAPIのClient ID, Client secretをそれぞれ入力する．
+ Googleの認証
  1. ブラウザからClocklyにアクセス(デフォルトは4567番ポート)
  2. Settingsページに遷移し，「Googleと認証」ボタンを押下
  3. Googleの認証画面が表示されるので連携するアカウントのメールアドレスを入力

# Usage

Clocklyを利用することで，プログラムの作成，プログラムの閲覧，カレンダの閲覧をブラウザから行える．
Clocklyは以下の画面をもつ．

  | PATH        | SUMMARY                                                                                           |
  |-------------|---------------------------------------------------------------------------------------------------|
  | /           | TOP画面                                                                                           |
  | /calendar   | カレンダ閲覧画面(ClocklyのカレンダDBに保存されている予定をカレンダ形式で表示)                     |
  | /list       | プログラム一覧画面    この画面からプログラムの即時実行およびプログラムの自動実行を行える． |
  | /make       | プログラム作成画面    この画面からビジュアルプログラミングによるプログラムの作成を行える．        |
  | /settings   | 設定画面                                                                                   |
