---
name: git-push
description: 推送代码到远程。先判断 remote（GitHub 或 Gitee）：GitHub 走 feature 分支 + PR，Gitee 直接 push 当前分支。
---

# 推送代码

把本地已提交的改动推送到远程。先判断 remote，再走对应流程。

## 1. 判断远程

`git remote get-url origin`：

- 含 `github.com` → 走 **GitHub 流程**（feature 分支 + PR，严禁直接推 main/master）
- 含 `gitee.com` → 走 **Gitee 流程**（直接 push 当前分支）
- 其他 → 先问用户怎么推

## 2. 推送前检查（两种流程通用）

1. `git status`、`git branch --show-current` 确认分支与状态
2. `git log origin/<当前分支>..HEAD --oneline` 查看待推送提交（为空则说明已同步，无需推送）
3. 确认提交已符合规范（Conventional Commits + `Signed-off-by` + 无 AI 署名）；不符合先处理再推

## 3a. GitHub 流程（严禁直接推 main/master）

1. `git fetch origin`
2. rebase 到最新：`git rebase origin/main`（或 `origin/master`）
3. 建 feature 分支：`git checkout -b feature/<描述>`
4. 推送：`git push -u origin feature/<描述>`
5. 建 PR：`gh pr create --base main --head feature/<描述> --title "..." --body "..."`
6. 测试通过后合并：`gh pr merge <pr-url> --merge`（或 `--squash`）

## 3b. Gitee 流程

1. `git fetch origin`
2. 若远端超前（`git status -sb` 显示 `behind`）：先 `git rebase origin/<当前分支>`，解决冲突后再继续
3. `git push origin <当前分支>`

## 4. 合并前需通过的测试（GitHub PR）

- 修改部分的文档格式化（如 prettier / markdownlint）
- VitePress 构建：`pnpm docs:build`
- Vue 自动化测试（如 vue-tsc 类型检查 / vitest）

## 5. 约束

- GitHub 严禁直接推 main/master，必须走 feature 分支 + PR；Gitee 直接推当前分支
- 推送前确认提交已符合规范
- 不 `--force`（除非用户明确要求）
- GitHub 合并 PR 前等待上述 CI/测试全部通过
