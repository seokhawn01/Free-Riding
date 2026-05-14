#!/bin/bash
# PostToolUse (Edit|Write): 파일 변경 후 자동 포맷팅 + 검증

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

[ -z "$FILE_PATH" ] && exit 0

# 상대경로 → 절대경로 보정
if [[ "$FILE_PATH" != /* ]] && [[ "$FILE_PATH" != *:/* ]]; then
  FILE_PATH="$CLAUDE_PROJECT_DIR/$FILE_PATH"
fi

[ ! -f "$FILE_PATH" ] && exit 0

EXT="${FILE_PATH##*.}"

case "$EXT" in
  ts|tsx|js|jsx|mjs|cjs|json|css|html|yaml|yml|md)
    # package.json 이 있을 때만 prettier 실행
    if command -v npx &>/dev/null && [ -f "$CLAUDE_PROJECT_DIR/package.json" ]; then
      cd "$CLAUDE_PROJECT_DIR" && npx prettier --write "$FILE_PATH" 2>/dev/null
      echo "[post-format] prettier 완료: $FILE_PATH" >&2
    fi
    ;;

  sh|bash)
    # shellcheck 검증 → 문제 있으면 Claude에게 피드백
    if command -v shellcheck &>/dev/null; then
      ISSUES=$(shellcheck "$FILE_PATH" 2>&1)
      if [ -n "$ISSUES" ]; then
        jq -n --arg path "$FILE_PATH" --arg issues "$ISSUES" '{
          hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext: ("shellcheck 경고 발생 — 수정을 검토하세요.\n파일: " + $path + "\n\n" + $issues)
          }
        }'
        exit 0
      fi
    fi
    ;;

  py)
    if command -v black &>/dev/null; then
      black --quiet "$FILE_PATH" 2>/dev/null
      echo "[post-format] black 완료: $FILE_PATH" >&2
    fi
    ;;
esac

exit 0
