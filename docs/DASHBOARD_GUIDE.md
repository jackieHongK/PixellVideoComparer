# Dashboard Guide

## 목적

이 대시보드는 3개 에이전트를 하나의 보드에서 관리하기 위한 운영판입니다.

1. `Codex PIXELL`
2. `Codex Personal`
3. `Claude`

핵심은 누가 어떤 작업을 맡고 있는지, 그리고 그 작업이 실제로 실행되고 있는지를 한 화면에서 확인하는 것입니다.

## 에이전트 구분

### Codex PIXELL

- 회사용 Codex
- `team` 워크스페이스 세션을 추적
- 기본 런처: `agent-launchers\start-codex-pixell.cmd`
- 프로필 홈: `C:\Users\HJP\.codex-profiles\pixell`

### Codex Personal

- 개인용 Codex
- `plus` 워크스페이스 세션을 추적
- 기본 런처: `agent-launchers\start-codex-personal.cmd`
- 프로필 홈: `C:\Users\HJP\.codex-profiles\personal`

### Claude

- 디자인, 개발, QA, 릴리스 담당

## Codex 프로필 구조

Codex는 `CODEX_HOME` 기준으로 인증, 세션, 설정을 저장합니다.

이 대시보드는 두 Codex를 별도 프로필로 분리해서 다룹니다.

- PIXELL: `C:\Users\HJP\.codex-profiles\pixell`
- Personal: `C:\Users\HJP\.codex-profiles\personal`

이 구조를 쓰면 한 번 로그인한 프로필은 다음 세션에도 그대로 유지됩니다. 즉, 매번 2번 다시 로그인할 필요가 없습니다.

## 최초 1회 설정

기존 기본 `.codex`에서 프로필 폴더를 만들어 두려면 아래처럼 실행합니다.

```powershell
.\agent-launchers\bootstrap-codex-profile.ps1 -ProfileId pixell
.\agent-launchers\bootstrap-codex-profile.ps1 -ProfileId personal
```

그 다음 각 프로필에서 한 번만 로그인 상태를 맞추면 됩니다.

```powershell
$env:CODEX_HOME="$env:USERPROFILE\.codex-profiles\pixell"
codex login

$env:CODEX_HOME="$env:USERPROFILE\.codex-profiles\personal"
codex login
```

중요:

- 이 로그인은 매 세션마다 하는 작업이 아니라 프로필당 1회 초기화 작업입니다.
- 이후에는 각 런처가 자동으로 해당 `CODEX_HOME`을 잡고 실행합니다.

## 로그인 번거로움 줄이는 방법

실전 권장 방식은 아래입니다.

1. `pixell`, `personal` 프로필을 한 번만 세팅
2. 각각 한 번만 로그인
3. 이후에는 항상 전용 런처만 사용

즉, 앞으로는:

- PIXELL Codex 열기: `start-codex-pixell.cmd`
- Personal Codex 열기: `start-codex-personal.cmd`
- 전체 열기: `start-all.cmd`

이렇게만 쓰면 됩니다.

## 세션 재시작 시 중단 없이 이어가기

매번 새 로그인 대신 아래 흐름을 추천합니다.

### 최소 마찰 흐름

1. 대시보드 서버 실행
2. `start-codex-pixell.cmd`
3. `start-codex-personal.cmd`
4. `start-claude.cmd`

프로필 인증이 살아 있으면 바로 이어집니다.

### 세션 이어받기

Codex는 각 프로필의 세션 로그를 별도로 남기므로, 필요하면 각 창에서 최근 세션을 이어갈 수 있습니다.

예시:

```powershell
.\agent-launchers\resume-codex-pixell.cmd
```

```powershell
.\agent-launchers\resume-codex-personal.cmd
```

필요하면 직접 아래처럼 실행해도 됩니다.

```powershell
$env:CODEX_HOME="$env:USERPROFILE\.codex-profiles\pixell"
codex resume --last
```

```powershell
$env:CODEX_HOME="$env:USERPROFILE\.codex-profiles\personal"
codex resume --last
```

## 현재 세션 포함 방식

대시보드는 Codex 세션 로그의 `plan_type`과 프로필 홈을 보고 에이전트를 매칭합니다.

- `team`: `Codex PIXELL`
- `plus`: `Codex Personal`

즉, 지금 이 Pixell 작업 세션도 `team` 세션으로 기록되면 자동으로 `Codex PIXELL`에 표시됩니다.

## 칸반 흐름

보드는 4단계만 사용합니다.

1. `할 일`
2. `진행중`
3. `검토`
4. `완료`

## 의존성

- 태스크 생성 시 `선행 작업`을 여러 개 지정할 수 있습니다.
- 선행 작업이 모두 `완료`되기 전까지 후속 태스크는 실행되지 않습니다.

## 대기열과 슬롯

- 각 에이전트는 `parallelSlots` 기준으로 동시에 처리 가능한 수가 정해집니다.
- 슬롯이 비면 같은 에이전트 대기열의 태스크가 자동 실행됩니다.

## 런 히스토리

- 최근 실행 / QA 결과를 작업 탭에서 바로 확인할 수 있습니다.
- 성공, 실패, 취소 상태가 기록됩니다.
- 로그 파일이 있으면 `dashboard-data/runs/*.log` 경로를 바로 열 수 있습니다.

## 템플릿

신규 오더 폼 템플릿:

- `Codex PIXELL 전략`
- `Codex Personal 보조 리서치`
- `Claude 디자인/프론트`
- `Claude QA 검증`

## 실행 순서

권장:

1. `agent-launchers\dashboard.cmd`
2. `agent-launchers\start-codex-pixell.cmd`
3. `agent-launchers\start-codex-personal.cmd`
4. `agent-launchers\start-claude.cmd`

한 번에 다 띄우려면:

1. `agent-launchers\all.cmd`

## 더블체크 체크리스트

1. 운영 탭에 `Codex PIXELL`, `Codex Personal`, `Claude` 3개 카드가 보이는지 확인
2. PIXELL Codex가 `team` 세션으로 잡히는지 확인
3. Personal Codex가 `plus` 세션으로 잡히는지 확인
4. 신규 오더 템플릿에 Codex 2종과 Claude 템플릿이 보이는지 확인
5. 각 Codex 런처가 서로 다른 `CODEX_HOME`으로 뜨는지 확인
