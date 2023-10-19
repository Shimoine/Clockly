# Clockly
Clocklyはユーザによるプログラミングを可能とするカレンダシステムである．ユーザはビジュアルプログラミングによって，カレンダの集計や一括コピーなどの操作ができる．また，Google Calendarなどの他のカレンダシステムと連携しデータのやり取りを可能とする．
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
# Installation and Setup
1. Clone code
`$ git clone git@github.com:kimura3104/Clockly.git`

# Usage
+ サーバの起動
`bundle exec ruby server.rb`
