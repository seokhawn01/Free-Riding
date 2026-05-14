#!/bin/bash
# PreToolUse / PostToolUse / PostToolUseFailure: 도구 사용 로그 (디버깅용)

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

INPUT=$(cat)

LOG_DIR="$CLAUDE_PROJECT_DIR/.claude/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date '+%Y-%m-%d').log"

TIMESTAMP=$(date '+%H:%M:%S')
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')
TOOL_NAME=$(echo "$INPUT"  | jq -r '.tool_name // "-"')

case "$HOOK_EVENT" in
  "PreToolUse")
    DETAIL=$(echo "$INPUT" | jq -r '
      if   .tool_input.command   then "CMD: "  + .tool_input.command[0:120]
      elif .tool_input.file_path then "FILE: " + .tool_input.file_path
      else ""
      end
    ' 2>/dev/null)
    ;;
  "PostToolUse")
    DURATION=$(echo "$INPUT" | jq -r '.duration_ms // "-"')
    DETAIL="${DURATION}ms"
    ;;
  "PostToolUseFailure")
    DETAIL=$(echo "$INPUT" | jq -r '"ERR: " + (.error // "unknown error")[0:120]' 2>/dev/null)
    ;;
  *)
    DETAIL=""
    ;;
esac

printf "[%s] %-22s %-14s %s\n" "$TIMESTAMP" "$HOOK_EVENT" "$TOOL_NAME" "$DETAIL" >> "$LOG_FILE"

exit 0
