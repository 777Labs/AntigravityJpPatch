# Changelog

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
