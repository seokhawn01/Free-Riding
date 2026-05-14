#!/bin/bash
# PreToolUse: 위험 Bash 명령어 차단 + 사용자 정의 권한 제어

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

[ -z "$COMMAND" ] && exit 0

deny() {
  local reason="$1"
  jq -n --arg reason "$reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

# 시스템 핵심 디렉토리 강제 삭제 차단
if echo "$COMMAND" | grep -qE 'rm\s+-[rRfF]+\s+(/|~/?$|/home|/usr|/etc|/var|/bin|/boot|/sys|/proc)'; then
  deny "위험: 시스템 디렉토리 대상 rm -rf 명령어가 차단되었습니다."
fi

# 와일드카드 강제 삭제 차단
if echo "$COMMAND" | grep -qE "rm\s+-[rRfF]+\s+\*|rm\s+-[rRfF]+\s+'?\*'?"; then
  deny "위험: 와일드카드 rm -rf 명령어가 차단되었습니다."
fi

# DB 스키마 삭제 차단 (대소문자 무관)
if echo "$COMMAND" | grep -qiE 'DROP\s+(TABLE|DATABASE|SCHEMA)\s+'; then
  deny "위험: DB 삭제 명령어(DROP TABLE/DATABASE)가 차단되었습니다."
fi

# Fork bomb 패턴 차단
if echo "$COMMAND" | grep -qE ':\(\)\s*\{.*:\s*&.*\}'; then
  deny "위험: Fork bomb 패턴이 차단되었습니다."
fi

# 디스크 덮어쓰기 차단
if echo "$COMMAND" | grep -qE 'dd\s+if=/dev/zero|dd\s+if=/dev/random|>\s*/dev/sd'; then
  deny "위험: 디스크 파괴 명령어가 차단되었습니다."
fi

exit 0
