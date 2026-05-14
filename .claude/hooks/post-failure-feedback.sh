#!/bin/bash
# PostToolUseFailure: 도구 실패 시 Claude에게 구조화된 피드백 전달

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT"    | jq -r '.tool_name // "unknown"')
ERROR=$(echo "$INPUT"        | jq -r '.error // "알 수 없는 오류"')
COMMAND=$(echo "$INPUT"      | jq -r '.tool_input.command // .tool_input.file_path // ""')
IS_INTERRUPT=$(echo "$INPUT" | jq -r '.is_interrupt // false')
DURATION=$(echo "$INPUT"     | jq -r '.duration_ms // 0')

# 사용자가 직접 중단한 경우 피드백 생략
[ "$IS_INTERRUPT" = "true" ] && exit 0

# 오류 유형별 수정 제안
if echo "$ERROR" | grep -qi "permission denied\|access denied"; then
  ADVICE="파일/디렉토리 권한을 확인하세요. sudo가 필요할 수 있습니다."
elif echo "$ERROR" | grep -qi "command not found\|not found\|No such"; then
  ADVICE="명령어 또는 파일이 존재하지 않습니다. 경로와 설치 여부를 확인하세요."
elif echo "$ERROR" | grep -qi "syntax error\|parse error"; then
  ADVICE="명령어 문법을 확인하세요. 따옴표, 괄호 등 특수문자 이스케이프를 점검하세요."
elif echo "$ERROR" | grep -qi "timeout\|timed out"; then
  ADVICE="타임아웃 발생. 작업을 더 작은 단위로 분할하거나 timeout 값을 늘려보세요."
elif echo "$ERROR" | grep -qi "network\|connection\|ECONNREFUSED"; then
  ADVICE="네트워크 연결 문제입니다. 서버 상태 및 포트를 확인하세요."
elif echo "$ERROR" | grep -qi "ENOENT"; then
  ADVICE="파일 또는 디렉토리가 없습니다. 경로가 올바른지 확인하세요."
else
  ADVICE="오류 메시지를 분석하여 원인을 파악하고 대안을 시도하세요."
fi

jq -n \
  --arg tool     "$TOOL_NAME" \
  --arg cmd      "$COMMAND"   \
  --arg error    "$ERROR"     \
  --arg advice   "$ADVICE"    \
  --argjson dur  "$DURATION"  \
  '{
    hookSpecificOutput: {
      hookEventName: "PostToolUseFailure",
      additionalContext: (
        "=== 도구 실패 분석 ===\n"
        + "도구:       " + $tool  + "\n"
        + "명령/경로:  " + $cmd   + "\n"
        + "실행 시간:  " + ($dur | tostring) + "ms\n"
        + "오류 메시지: " + $error + "\n\n"
        + "[수정 제안] " + $advice
      )
    }
  }'

exit 0
