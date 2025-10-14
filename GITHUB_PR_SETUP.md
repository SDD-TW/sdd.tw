# GitHub PR 功能設定說明

## 環境變數設置

請在專案根目錄建立 `.env.local` 檔案，並加入以下環境變數：

```bash
# GitHub API Configuration
# 請在 https://github.com/settings/tokens 生成一個 Personal Access Token
# 需要的權限: repo (完整存取權限)
GITHUB_TOKEN=ghp_your_github_personal_access_token_here

# GitHub Repository Configuration
# 指定要查詢 PR 的 GitHub 倉庫
NEXT_PUBLIC_GITHUB_REPO_OWNER=your-organization-name
NEXT_PUBLIC_GITHUB_REPO_NAME=your-repository-name
```

## 如何生成 GitHub Personal Access Token

1. 訪問 https://github.com/settings/tokens
2. 點擊 "Generate new token" → "Generate new token (classic)"
3. 設定 Token 名稱（例如：sdd-official-web-pr-access）
4. 選擇權限：勾選 `repo` (完整的倉庫存取權限)
5. 點擊 "Generate token"
6. 複製生成的 token（注意：只會顯示一次）
7. 將 token 加入到 `.env.local` 檔案中

## 功能說明

- 在排行榜中點擊任何學員的行
- 會從右側滑出一個側邊欄
- 顯示該學員在指定倉庫中的所有 Pull Request
- 包含：
  - PR 標題、狀態、編號
  - PR 描述內容
  - 代碼變更統計（新增/刪除行數、修改檔案數）
  - 建立時間、合併時間
  - 所有 Review 評論

## 檔案結構

```
src/
├── lib/
│   └── github.ts                    # GitHub API 整合
├── app/
│   └── api/
│       └── github/
│           └── prs/
│               └── route.ts         # PR 資料 API 路由
└── components/
    ├── Leaderboard.tsx              # 排行榜元件（已更新）
    └── PRDetailsSlideOver.tsx       # PR 詳情側邊欄元件
```

