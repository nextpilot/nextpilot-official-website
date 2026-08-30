---
name: git-push
description: 推送代码到远程。目标是 GitHub 时，严禁直接推 main/master，须先 rebase、建 feature 分支、自动创建 PR，测试通过后再合并。
---

# 推送代码

把本地已提交的改动推送到远程。

## GitHub 推送流程（严禁直接推 main/master）

1. `git fetch origin`
2. 先 rebase 到最新 main/master：`git rebase origin/main`（或 `origin/master`）
3. 创建 feature 分支：`git checkout -b feature/<描述>`
4. 推送 feature 分支：`git push -u origin feature/<描述>`
5. 自动创建 PR：`gh pr create --base main --head feature/<描述> --title "..." --body "..."`
6. CI/测试通过后自动合并：`gh pr merge <pr-url> --merge`（或 `--squash`）

## 步骤

1. 确认分支与状态：`git status`、`git branch --show-current`
2. 查看待推送的提交：`git log origin/<当前分支>..HEAD --oneline`
3. 确认这些提交已符合提交规范（Conventional Commits + `Signed-off-by` + 无 AI 署名）；不符合先处理再推

## 合并前需通过的测试

- 修改部分的文档格式化（如 prettier / markdownlint）
- VitePress 构建：`pnpm docs:build`
- Vue 自动化测试（如 vue-tsc 类型检查 / vitest）

## 约束

- **严禁直接推送到 GitHub 的 main/master**，必须走 feature 分支 + PR 流程
- 推送前确认待推送提交已符合提交规范
- 不 `--force`（除非用户明确要求）
- 合并 PR 前等待上述 CI/测试全部通过
