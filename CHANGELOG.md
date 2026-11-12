# Changelog

## v2.31.2-r1

Google Antigravity（デスクトップ版）の画面UIおよびAI応答を包括的に日本語化するパッチツールです。

> **【注意】** 本ツールは Google 公式のツールではなく、非公式の有志製パッチ（Unofficial Patch）です。

- **対応バージョン**: **Google Antigravity v2.31.2 まで動作確認・対応済み**
- **配布形態**: ZIPアーカイブ配布（ソース非公開・スタンドアロン実行形式）

---

**■ 今回の更新内容 (v2.31.2-r1)**
- **全スラッシュコマンド（`/`）・組み込みスキル・`@` メンション・コマンドパレット説明文の完全日本語化**:
  - チャット入力欄の `/` メニュー（「+」→「アクション」）に表示される全システムコマンド（`/btw`, `/goal`, `/compact`, `/schedule`, `/browser`, `/browser-vision`, `/plan`, `/grill-me`, `/teamwork`, `/learn`, `/boost`, `/deepagent`, `/review-agent`）および全組み込みスキル（`/agy-customizations`, `/antigravity-guide`, `/automation`, `/generative_ui`, `/migrate-agent-settings`, `/migrate-workflows`, `/plugin`, `/swarm` 等）の説明文をすべて日本語化
  - `/g` や `/p` など文字を入力して絞り込み検索した際（ハイライト分割・先頭省略発生時）にも日本語の説明文が崩れず維持されるよう動的翻訳エンジンを強化
  - `@` メンションメニュー（「+」→「メンション」）の各カテゴリ・プラグイン説明文およびコマンドパレット／ショートカット定義内の全コマンドラベルを網羅的に日本語化
- **v2.31.1 新設・変更設定項目および初期ウェルカムメッセージの日本語化追加**:
  - **「設定」>「一般」タブ**:
    - **インターフェースレイアウト（Interface Layout）**: 「Knowledge Work」→「ナレッジワーク」、「Simplified interface for research, writing, and everyday tasks.」→「調査、執筆、日常業務向けのシンプルなインターフェース。」、「Software Engineering」→「ソフトウェアエンジニアリング」、「Full interface for coding, developer tools, and managing agents.」→「コーディング、開発ツール、エージェント管理向けのフル機能インターフェース。」
    - **権限・音声モード・詳細設定**: ローカル／リモート権限（「このコンピュータ」「リモート」）、Gemini Live 音声設定（「音声」「未設定」「変更」「Antigravity の音声を選択」等）、「新しい会話」ボタンの開始ワークスペース設定
  - **「設定」>「アプリケーション」>「詳細設定」**:
    - 「Automatic Check for Updates」→「更新プログラムを自動的に確認」およびその説明文、リモートコントロール詳細・WSL 連携項目を日本語化
  - **「設定」>「外観」>「詳細設定」**:
    - 「Chat Layout」→「チャットレイアウト」、幅オプション「Fill」→「最大幅」、「Markdown Artifact Width」→「Markdown アーティファクトの幅」、「Context and Quota Indicator」→「コンテキスト・利用枠インジケーター」、「Terminal Placement」→「ターミナルの配置」、「Accessibility」→「アクセシビリティ」、「Custom Context Menus」→「カスタムコンテキストメニュー」、「Screen Reader Mode」→「スクリーンリーダーモード」、フォントサイズ・カラーピッカー・コードプレビューを日本語化
  - **「設定」>「ブラウザ」タブ（および「ブラウザ操作ルール」編集サブ画面）**:
    - ヘッダー説明文、「Side Panel Preview」→「サイドパネルプレビュー」、「Enable Browser Tools」→「ブラウザツールを有効化」、「Browser Javascript Execution Policy」→「ブラウザ JavaScript 実行ポリシー」、「Browser Actuation Permissions」→「ブラウザ操作の権限」、「Execute URLs」→「URL の操作」、「Download files」→「ファイルのダウンロード」、権限選択肢「Ask」→「確認」等を日本語化
  - **「新しい会話」時の初期ウェルカムメッセージ（全6パターン）**:
    - ユーザー名あり／なしのローテーション挨拶メッセージ全パターン（「こんにちは、$1さん。今日は何を作りましょうか？」「おかえりなさい、$1さん。どこから再開しましょうか？」「こんにちは、$1さん。次は何をしましょうか？」等）およびホーム画面のヒントカードを日本語化
  - **「設定」>「アカウント」・「ショートカット」の追加項目**:
    - 「Remote Agents Data」→「リモートエージェントのデータ」、「Mute Voice Mic」→「音声マイクをミュート」、「Mute Voice Speaker」→「音声スピーカーをミュート」等を日本語化

---

**■ 適用方法（インストール）**
1. Google Antigravity を完全に終了します。
2. 配布用 ZIP アーカイブを展開（解凍）します。
3. フォルダ内にある **`install.bat`** をダブルクリックして実行します。
4. 適用完了メッセージが表示されたら、Google Antigravity を起動してください。

---

**■ 解除方法（アンインストール・復元）**
1. Google Antigravity を完全に終了します。
2. フォルダ内にある **`uninstall.bat`** をダブルクリックして実行します。
3. 初回適用時に作成された原本バックアップから、公式の純正状態（英語）へ安全に完全復元されます。

---

**■ 注意事項**
- **本体アップデート時の再適用**:
  Google Antigravity 本体がアップデートされた場合、パッチが上書きされて英語表示に戻ります。その際は、Antigravity を終了して再度手動で **`install.bat`** を実行して適用し直してください。

## v2.31.1-r1

Google Antigravity（デスクトップ版）の画面UIおよびAI応答を包括的に日本語化するパッチツールです。

> **【注意】** 本ツールは Google 公式のツールではなく、非公式の有志製パッチ（Unofficial Patch）です。

- **対応バージョン**: **Google Antigravity v2.31.1 まで動作確認・対応済み**
- **配布形態**: ZIPアーカイブ配布（ソース非公開・スタンドアロン実行形式）

---

**■ 今回の更新内容 (v2.31.1-r1)**
- **Antigravity v2.31.1 でのパッチ適用／復元エラー（「起動中」安全ガード停止）の修正**:
  - v2.31.1 よりウィンドウを閉じた後もバックグラウンドに残留する場合があるサイドカープロセス（`Antigravity.exe`）および Antigravity 配下の `language_server.exe` を安全に検出・終了・解放待機できるようプロセスガードを強化
  - インストーラー／アンインストーラー（`install.bat` / `uninstall.bat`）の確認プロンプトを `[Y/n]`（Enter のみでも自動終了）に改善し、手動終了選択後もバックグラウンドプロセスが残っている場合は安全にクリーンアップして続行するよう修正
- **v2.31.1 内部ロジック誤置換の防止とシステムトレイ日本語化**:
  - `beyondcorpPac.js`・`cablev2.js`・`guestWebMcpController.js`・`wcvZOrderController.js`・`utils.js` 等の内部通信／プロトコル／キー制御ファイルを静的文字列置換から保護し、動作不具合を防止
  - 新設されたシステムトレイ（`tray.js` / `main.js`）における動的エージェント数表示（「実行中のエージェントはありません」「○ 個のエージェントが実行中」）および「終了」（Quit）メニューを日本語化

---

**■ 適用方法（インストール）**
1. Google Antigravity を完全に終了します。
2. 配布用 ZIP アーカイブを展開（解凍）します。
3. フォルダ内にある **`install.bat`** をダブルクリックして実行します。
4. 適用完了メッセージが表示されたら、Google Antigravity を起動してください。

---

**■ 解除方法（アンインストール・復元）**
1. Google Antigravity を完全に終了します。
2. フォルダ内にある **`uninstall.bat`** をダブルクリックして実行します。
3. 初回適用時に作成された原本バックアップから、公式の純正状態（英語）へ安全に完全復元されます。

---

**■ 注意事項**
- **本体アップデート時の再適用**:
  Google Antigravity 本体がアップデートされた場合、パッチが上書きされて英語表示に戻ります。その際は、Antigravity を終了して再度手動で **`install.bat`** を実行して適用し直してください。

## v2.29.0

Google Antigravity（デスクトップ版）の画面UIおよびAI応答を包括的に日本語化するパッチツールです。

> **【注意】** 本ツールは Google 公式のツールではなく、非公式の有志製パッチ（Unofficial Patch）です。

- **対応バージョン**: **Google Antigravity v2.29.0 まで動作確認・対応済み**
- **配布形態**: ZIPアーカイブ配布（ソース非公開・スタンドアロン実行形式）

---

**■ 今回の更新内容 (v2.29.0)**
- **Antigravity v2.29.0 対応**:
  - **「設定」>「一般」タブの日本語化追加**:
    - **内蔵ブラウザ（Built-in Browser）セクション**: 「Built-in Browser」→「内蔵ブラウザ」、「Configure link opening and built-in browser preferences.」→「リンクの開き方および内蔵ブラウザの設定を管理します。」、「Open Links In」→「リンクを開く場所」、「External Browser」→「外部ブラウザ」、「Download Location」→「ダウンロード先」、「Folder where files downloaded in the built-in browser are saved.」→「内蔵ブラウザでダウンロードしたファイルが保存されるフォルダ。」、「Change…」→「変更…」、「Browsing History」→「閲覧履歴」、「Browser Subagent」→「ブラウザサブエージェント」等
    - **音声モード（Voice mode）セクション**: 「Voice mode」→「音声モード」、「Microphone」→「マイク」、「Input device for voice mode and dictation.」→「音声モードおよびディクテーション用の入力デバイス。」、「System default」→「システム既定」
    - **効果音・通知**: 音量操作の aria-label（「Chime volume」→「チャイム音量」）
  - **「設定」>「外観」タブの日本語化追加**:
    - **チャット表示詳細度**: 「Chat」→「チャット」、「Conversation Steps」→「会話の実行ステップ」、「Choose how much detail is shown during a conversation.」→「会話中に表示する詳細レベルを選択します。」、「Verbose」→「詳細表示」
    - **フォント**: 「Font」→「フォント」
  - **「設定」>「ショートカット」タブの日本語化追加**:
    - **検索**: 検索入力欄（「Search shortcuts...」→「ショートカットを検索...」）
    - **キーバインド項目名**: 「Reopen Closed Tab」→「閉じたタブを再度開く」、「Move Conversation Up」→「会話を上に移動」、「Move Conversation Down」→「会話を下に移動」、「Previous Side Panel Tab」→「前のサイドパネルタブ」、「Next Side Panel Tab」→「次のサイドパネルタブ」、「Toggle Side Panel」→「サイドパネルの切り替え」、「Toggle Maximize Side Panel」→「サイドパネルの最大化を切り替え」
    - **ショートカットボタン aria-label の動的日本語化**: 「$2 のショートカット: $1」「$2 のショートカット $1 を削除」「$1 のショートカットを追加」に対応
- **辞書エントリの拡充**: 計727エントリへ拡張

---

**■ 適用方法（インストール）**
1. Google Antigravity を完全に終了します。
2. 配布用 ZIP アーカイブを展開（解凍）します。
3. フォルダ内にある **`install.bat`** をダブルクリックして実行します。
4. 適用完了メッセージが表示されたら、Google Antigravity を起動してください。

---

**■ 解除方法（アンインストール・復元）**
1. Google Antigravity を完全に終了します。
2. フォルダ内にある **`uninstall.bat`** をダブルクリックして実行します。
3. 初回適用時に作成された原本バックアップから、公式の純正状態（英語）へ安全に完全復元されます。

---

**■ 注意事項**
- **本体アップデート時の再適用**:
  Google Antigravity 本体がアップデートされた場合、パッチが上書きされて英語表示に戻ります。その際は、Antigravity を終了して再度手動で **`install.bat`** を実行して適用し直してください。

## v2.28.2-r2

Google Antigravity（デスクトップ版）の画面UIおよびAI応答を包括的に日本語化するパッチツールです。

> **【注意】** 本ツールは Google 公式のツールではなく、非公式の有志製パッチ（Unofficial Patch）です。

- **対応バージョン**: **Google Antigravity v2.28.2 まで動作確認・対応済み**
- **配布形態**: ZIPアーカイブ配布（ソース非公開・スタンドアロン実行形式）

---

**■ 今回の更新内容 (v2.28.2-r2)**
- **モデル選択「View Usage」の日本語化**: モデル選択メニュー一番下の「View Usage」を「利用状況」に日本語化
- **モデル利用状況フライアウトの日本語化**:
  - 各種利用枠（「Weekly limit」→「週間利用枠」、「5h limit」→「5時間利用枠」等）を日本語化
  - 残量パーセント表示（「68% left」→「残り 68%」、「100% left」→「残り 100%」等）の動的変換に対応
  - リセット日時表示（「Resets in 2d 10h」→「2日10時間後にリセット」等）の動的変換に対応
- **上部メニューの多言語化対応**: 新設された「Workspace」トップメニューを「ワークスペース」にローカライズ
- **権限プリセット対応**: 設定画面およびチャットバーの「Permission Preset」を「権限プリセット」にローカライズ

---

**■ 適用方法（インストール）**
1. Google Antigravity を完全に終了します。
2. 配布用 ZIP アーカイブを展開（解凍）します。
3. フォルダ内にある **`install.bat`** をダブルクリックして実行します。
4. 適用完了メッセージが表示されたら、Google Antigravity を起動してください。

---

**■ 解除方法（アンインストール・復元）**
1. Google Antigravity を完全に終了します。
2. フォルダ内にある **`uninstall.bat`** をダブルクリックして実行します。
3. 初回適用時に作成された原本バックアップから、公式の純正状態（英語）へ安全に完全復元されます。

---

**■ 注意事項**
- **本体アップデート時の再適用**:
  Google Antigravity 本体がアップデートされた場合、パッチが上書きされて英語表示に戻ります。その際は、Antigravity を終了して再度手動で **`install.bat`** を実行して適用し直してください。

## v2.28.2-r1
- 初回リリース
