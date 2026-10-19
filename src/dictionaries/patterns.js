// 動的正規表現マッチング・置換ルール群
module.exports = [
  // 作業のまとめ行：「Exploring 1 file, running 6 commands」など（数と名詞は元プログラムの RW 表どおり）
  { pattern: /^(Exploring|Explored|Editing|Edited) (\d+ [a-z]+(?:, \d+ [a-z]+)*?)(?:, (running|ran) (\d+) commands?)?$/,
    replace: (m, verb, counts, rv, rn) => {
      const N = { file: "ファイル", files: "ファイル", folder: "フォルダ", folders: "フォルダ", search: "検索", searches: "検索",
        command: "コマンド", commands: "コマンド", task: "タスク", tasks: "タスク", page: "ページ", pages: "ページ",
        browser: "ブラウザ", browsers: "ブラウザ", image: "画像", images: "画像", action: "アクション", actions: "アクション",
        artifact: "成果物", artifacts: "成果物" };
      const V = { Exploring: "探索中", Explored: "探索済み", Editing: "編集中", Edited: "編集済み", running: "実行中", ran: "実行済み" };
      const parts = counts.split(", ").map(c => { const [n, w] = c.split(" "); return N[w] ? `${N[w]}${n}件` : null; });
      if (parts.includes(null)) return m;
      let out = `${parts.join("・")}を${V[verb]}`;
      if (rv) out += `、コマンド${rn}件を${V[rv]}`;
      return out;
    } },
  { pattern: /^(Running|Ran) (\d+) commands?$/, replace: (m, v, n) => `コマンド${n}件を${v === "Running" ? "実行中" : "実行済み"}` },
  { pattern: /^Yes, and always allow '(.+)' (in this conversation|in this project|when not in a project|in this workspace)$/,
    replace: (m, w, where) => `はい、${{ "in this conversation": "この会話では", "in this project": "このプロジェクトでは", "when not in a project": "プロジェクト外では", "in this workspace": "このワークスペースでは" }[where]}「${w}」を常に許可する` },
  { pattern: /^Yes, and always allow '(.+)'$/, replace: (m, w) => `はい、今後は「${w}」を常に許可する` },
  { pattern: /^Agent needs permission to act on (.+)$/, replace: (m, w) => `エージェントが ${w} での操作の許可を求めています` },
  // エージェントが書いた説明文は英語のまま残し、問いの形だけ日本語にする
  { pattern: /^Allow (.+)\?$/, replace: (m, w) => `「${w}」を許可しますか？` },
  { pattern: /^Worked for (\d+)m(?:\s*(\d+)s)?$/, replace: (m, min, sec) => `${min}分${sec ? sec + '秒' : ''}作業` },
  { pattern: /^Thought for (\d+)s$/, replace: (m, sec) => `${sec}秒間思考` },
  { pattern: /^(\d+)\s+commands?$/, replace: (m, count) => `${count}件のコマンド` },
  { pattern: /^(\d+)\s+tool calls?$/, replace: (m, count) => `${count}件のツール呼び出し` },
  { pattern: /^Select model,\s*current:\s*(.+)$/, replace: (m, current) => `モデル選択 (現在: ${current})` },
  { pattern: /^Select project,\s*current:\s*(.+)$/, replace: (m, current) => `プロジェクト選択 (現在: ${current === "No Project" ? "プロジェクトなし" : current})` },
  { pattern: /^Show (\d+) breakdowns?$/, replace: (m, n) => `内訳を${n}件表示` },
  { pattern: /^Install (.+)$/, replace: (m, what) => `${what} をインストール` },
  { pattern: /^Mark all (\d+) conversations? as read$/, replace: (m, n) => `${n}件の会話をすべて既読にする` },
  { pattern: /^See (\d+) more$/, replace: (m, n) => `ほか${n}件を表示` },
  { pattern: /^Send feedback as (.+)$/, replace: (m, who) => `${who} としてフィードバックを送信` },
  { pattern: /^(\d+) excluded$/, replace: (m, n) => `${n}件を除外` },
  { pattern: /^(Rules|Skills|Mcp Tools): ([\d,]+) tokens$/, replace: (m, k, n) => `${{ Rules: "ルール", Skills: "スキル", "Mcp Tools": "MCP ツール" }[k]}: ${n} トークン` },
  { pattern: /^You have used some of your weekly limit, it will fully refresh in (.+)\.$/, replace: (m, t) => `今週の上限の一部を使いました。あと ${t.replace(/(\d+) days?/, "$1日").replace(/(\d+) hours?/, "$1時間").replace(/(\d+) minutes?/, "$1分").replace(/, /g, "")} で全回復します。` }
];
