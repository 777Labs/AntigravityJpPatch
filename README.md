# Google Antigravity 日本語化パッチ (antigravity-ja v2.0.0)

Google Antigravity（Electron ベース）の UI を自然かつ高速に日本語化する次世代ローカライゼーション Mod & パッチシステムです。

---

## ✨ 主な特徴

1. **モジュール分離・ゼロランタイム設計**
   - レンダラー側（DOM監視・テキスト置換）、メインプロセス側（辞書同期）、パッチャー（asar解析・再構築）、辞書データを完全に分離。
   - 外部ライブラリ不要で Node.js 標準機能のみでバンドル・実行可能。
2. **高速＆安全な asar パッチ適用**
   - `app.asar` を展開・再パックすることなく、Pickle ヘッダーの書き換えと末尾データ追加により、数秒で安全にパッチ適用。
   - 改ざん防止（Electron Fuse）チェック、SHA256 integrity 生成、検証パスを実施。
   - 自動バックアップとワンクリック復元機能を標準搭載。
3. **リアルタイム辞書同期**
   - ユーザー辞書（`%USERPROFILE%\.gemini\antigravity\i18n_dict.json`）をメインプロセスが監視し、編集するとアプリの再起動なしで即座に画面へ反映。
4. **未翻訳テキスト自動抽出（Extractor / Collector）**
   - 開発者モードを有効にすることで、画面上に英語のまま残っているテキストを自動収集し、辞書用 JSON 形式で出力。翻訳漏れの解消が容易。
5. **アップデート自動追従（Watcher）**
   - Antigravity 本体のアップデートで `app.asar` が差し替わった場合も、バックグラウンド見張り役が自動検知して即座にパッチを再適用。

---

## 📁 ディレクトリ構成

```text
antigravity-ja/
├── package.json              # プロジェクト設定・npm スクリプト
├── README.md                 # 本ドキュメント
├── src/
│   ├── renderer/             # レンダラー側（DOM監視・テキスト置換）
│   │   ├── index.js          # レンダラーエントリポイント
│   │   ├── observer.js       # MutationObserver（バッチ・デバウンス最適化）
│   │   ├── matcher.js        # 完全一致・正規表現ルールの判定ロジック
│   │   ├── filter.js         # コードブロック・会話・入力欄等の除外判定
│   │   └── collector.js      # 未翻訳テキスト自動収集（Debug/開発者用）
│   ├── main/                 # メインプロセス側（IPC・辞書監視）
│   │   ├── index.js          # main.js 注入エントリ
│   │   └── dict-watcher.js   # i18n_dict.json のリアルタイム監視・ブロードキャスト
│   ├── patcher/              # asar パッチ適用エンジン
│   │   ├── index.js          # パッチャー CLI エントリ
│   │   ├── asar-patcher.js   # Pickle ヘッダー解析＆安全な書き換え
│   │   ├── fuse-check.js     # Electron 改ざん防止（Fuse）チェック
│   │   └── backup.js         # 原本バックアップと復元
│   └── dictionaries/         # 日本語辞書データ（カテゴリ別）
│       ├── ui.json           # 共通UI（メニュー、ボタン、タブなど）
│       ├── settings.json     # 設定項目・説明文
│       ├── dialogs.json      # 承認ダイアログ・アラート・ツールチップ
│       └── patterns.js       # 動的パターン（数字等を含む正規表現ルール）
├── tools/                    # ビルド・補助スクリプト
│   ├── build.js              # 辞書マージ・バンドル生成スクリプト
│   ├── extract-dict.js       # 既存辞書データの移行・抽出スクリプト
│   └── validate-dict.js      # 辞書の構文・重複検証スクリプト
├── scripts/                  # ユーザー向けスクリプト
│   ├── install.bat           # ワンクリック適用バッチ
│   ├── uninstall.bat         # ワンクリック復元バッチ
│   └── watcher.ps1           # アップデート自動追従デーモン
└── dist/                     # 配布用成果物（ビルド生成物）
    ├── patcher.js
    ├── i18n_module.js
    └── main_hook.js
```

---

## 🚀 使い方

### 1. ビルド
```bash
# 辞書の構文検証
npm run validate

# 配布用成果物 (dist/) のビルド
npm run build
```

### 2. パッチの適用
- **Windows (ワンクリック)**: `scripts/install.bat` をダブルクリック
- **CLI**:
  ```bash
  npm run patch
  # または
  node dist/patcher.js
  ```

### 3. パッチの復元（アンインストール）
- **Windows (ワンクリック)**: `scripts/uninstall.bat` をダブルクリック
- **CLI**:
  ```bash
  npm run restore
  # または
  node dist/patcher.js --restore
  ```

### 4. 状態の確認
```bash
npm run status
# 出力例: [STATUS] Patched with version: v2.0.0 (Active)
```

---

## 🔍 未翻訳テキスト抽出モード（開発者向け）

画面に英語のまま残っている単語や文を自動で収集する機能です。

1. Antigravity 起動時または DevTools コンソールで以下を実行：
   ```js
   window.localStorage.setItem('agy_ja_collect', 'true');
   location.reload();
   ```
2. 画面をひととおり操作（設定画面を開く、メニューをクリックするなど）
3. コンソールで収集結果をエクスポート：
   ```js
   window.__AGY_JA__.exportUntranslated();
   ```
4. 出力された JSON を辞書（`src/dictionaries/ui.json` 等）に追加し、`npm run build` を実行して再適用します。

---

## 📝 辞書の編集・追加

- **静的辞書**: `src/dictionaries/` 内の各 JSON ファイルに `{"英語": "日本語"}` を追加し、`npm run validate && npm run build` を実行。
- **ユーザー個別辞書**: `%USERPROFILE%\.gemini\antigravity\i18n_dict.json` に直接追記すると、ビルドなしで即座にアプリに反映されます。

---

## 📄 ライセンス
MIT License
