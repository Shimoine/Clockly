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
  .envは外部のカレンダシステムと連携する際に必要となるOAuthのClient IDとClient Secretを格納する．
  現在はGoogle Calendarとのみ連携可能であり，詳細は[Google Calendarとの連携](https://github.com/kimura3104/Clockly#google-calendar%E3%81%A8%E3%81%AE%E9%80%A3%E6%90%BA)で説明する．
  ```
  $ cp .env.example .env
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

# Development
## Webページの開発
Webページの開発をする際には`src/`以下にはWebページのソースコードが置いてある．


### ビジュアルブロックの追加
ビジュアルプログラミングで用いるブロックは`src/myblock.js`で定義されている．

