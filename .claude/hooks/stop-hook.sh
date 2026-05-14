#!/bin/bash
# Claude Code Stop 훅 - 작업 완료 알림

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

INPUT=$(cat)

if [ -f "$CLAUDE_PROJECT_DIR/.env" ]; then
    source "$CLAUDE_PROJECT_DIR/.env"
else
    echo "오류: .env 파일을 찾을 수 없습니다: $CLAUDE_PROJECT_DIR/.env" >&2
    exit 1
fi

if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "오류: SLACK_WEBHOOK_URL이 설정되지 않았습니다." >&2
    exit 1
fi

REASON=$(echo "$INPUT" | jq -r '.hook_event_name // "Stop"')
PROJECT_NAME=$(basename "$CLAUDE_PROJECT_DIR")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# jq → curl 직접 파이프 (변수 경유 없이 전송하여 인코딩 보존)
jq -n \
  --arg project "$PROJECT_NAME" \
  --arg reason "$REASON" \
  --arg time "$TIMESTAMP" \
  '{
    "username": "Claude Code",
    "icon_emoji": ":white_check_mark:",
    "text": ("<!here> :white_check_mark: *작업 완료 알림*\n\n프로젝트: " + $project + "\n상태: " + $reason + "\n시간: " + $time + "\n\nClaude Code 작업이 완료되었습니다.")
  }' \
| curl -s -X POST \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-binary @- \
  "$SLACK_WEBHOOK_URL" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Slack 알림 전송 완료" >&2
else
    echo "Slack 알림 전송 실패" >&2
    exit 1
fi
