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

### Install packages
+ Gem のインストール
  ```
  $ bundle install
  ```
+ package のインストール
  ```
  $ npm install
  ```

### Start Clockly
以下のコマンドを使用し，ClocklyのHTTPサーバを起動する．
  ```
  ./start.sh
  ```
sinatraサーバがlocalhostで起動する．
また，プログラムの自動実行スクリプトが実行される．
自動実行スクリプトは60秒ごとにカレンダの更新を確認を行う．

## Google Calendarとの連携
  
+ .envの内容は以下のようになっている．
  ```
  1 GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXXXXXX
  2 GOOGLE_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  3 GOOGLE_CALLBACK_URL=http://localhost:4567/auth/google_oauth2/callback
  4 TOKEN_STORE_PATH=./token_store.yml
  5 DEFAULT_USER=default_user
  ```

+ .envファイルにGoogleCalendarAPIのClient ID, Client secretをそれぞれ入力する．
+ Googleの認証
  1. ブラウザからClocklyにアクセス(デフォルトは4567番ポート)
  2. メニューバーから「Settings」をクリックして，設定画面に遷移し「Googleと認証」ボタンを押下
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

### プログラムの作成
1. メニューバーから「make rule」をクリックし，プログラム作成画面へ遷移
2. 「ルール名」の項目にプログラムに付ける名前を入力
3. 画面左側のツールボックスをクリックし，そこからブロックをドラッグアンドドロップで画面中央のワークスペースに配置し，ブロックを連結させプログラムを作成
4. 「ルールを作成」ボタンを押し，プログラムを保存

### プログラムの実行
誤動作防止のため，カレンダの書き換えの可否を設定できる．
書き換え不可のカレンダはプログラムが実行されても何も変更されない．

1. 設定画面の「書き換え可能なカレンダ一覧」から書き換えるカレンダにチェックを入れる
2. メニューバーから「list」をクリックし，プログラム一覧画面へ遷移
3. 即時実行の場合は，実行したいプログラムの「実行」ボタンを押下
4. 自動実行の場合は，自動実行を有効にしたいプログラムの「自動実行」にチェックを入れる

# Development
## Webページの開発
Webページの開発をする際には`src/`以下にはWebページのソースコードが置いてある．


### ビジュアルブロックの追加
ビジュアルプログラミングで用いるブロックは`src/Block.js`で定義されている．

