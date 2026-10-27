<div align="center">

# 🤝 Team-Mate

### 팀 프로젝트를 더 명확하게, 협업을 더 간편하게

**팀 · 업무 · 일정 · 진행 현황을 한곳에서 관리하는 웹 기반 협업 플랫폼**

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

**2026학년도 2학기 캡스톤디자인 | 개발 진행 중**

</div>

---

## 📌 프로젝트 소개

**Team-Mate**는 여러 사람이 함께 진행하는 프로젝트에서 업무 담당자, 진행 상태, 일정과 팀 전체 현황을 쉽게 파악할 수 있도록 개발하는 웹 서비스입니다.

팀별로 독립된 협업 공간을 제공하고, 칸반 보드와 일정 관리 기능을 연결하여 팀원들이 현재 해야 할 일과 프로젝트 진행 상황을 공유할 수 있도록 구성했습니다.

### 개발 목표

- **업무 가시성 확보** — 누가 어떤 일을 맡았고 어디까지 진행했는지 확인
- **팀 단위 협업** — 팀원 및 역할 관리, 팀별 업무와 일정 통합
- **진행 상황 파악** — 업무 상태를 기반으로 진행률과 전체 현황 제공
- **사용 편의성** — 반응형 화면과 라이트/다크 테마 지원

## 🛠️ 기술 스택

| 영역 | 기술 | 활용 목적 |
| --- | --- | --- |
| Frontend | React, Vite, React Router | 화면 구성, 라우팅, 사용자 인터페이스 |
| Styling | CSS Modules | 컴포넌트별 스타일 관리 |
| Backend | Java 21, Spring Boot, Spring Web MVC | REST API 및 비즈니스 로직 |
| Security | Spring Security, JWT, BCrypt | 인증, 접근 제어, 비밀번호 보호 |
| Database | MySQL, Spring Data JPA | 데이터 저장 및 엔티티 관리 |
| Email | Gmail SMTP | 회원가입 및 비밀번호 변경 이메일 인증 |
| Tools | Git, GitHub, Postman | 형상 관리 및 API 테스트 |

## ✨ 주요 기능

### 🔐 회원 및 인증
- 회원가입 및 로그인
- Gmail 인증번호를 이용한 이메일 소유 확인
- JWT 기반 인증 및 보호된 API 접근
- 마이페이지에서 계정 정보 조회 및 이메일 인증 후 비밀번호 변경
- 비밀번호 변경 완료 후 현재 브라우저 로그아웃

### 👥 팀 관리
- 팀 생성, 조회, 수정, 삭제
- 팀원 추가 및 관리
- 팀 내 역할(OWNER / MEMBER) 구분
- 팀 완료 및 재개 처리

### 📋 업무 관리
- 팀별 업무 등록, 조회, 수정, 삭제
- 담당자 및 마감일 설정
- 칸반 보드를 통한 업무 상태 관리
- 업무 상태별 진행 현황 및 팀 진행률 확인

| 상태 | 화면 표시 | 의미 |
| --- | --- | --- |
| `BACKLOG` | 업무 대기 | 아직 착수하지 않은 업무 후보 |
| `TODO` | 할 일 | 진행 예정 업무 |
| `BLOCKED` | 보류 | 진행이 막히거나 보류된 업무 |
| `IN_PROGRESS` | 진행 중 | 현재 수행 중인 업무 |
| `REVIEW` | 검토 | 결과물 확인 단계 |
| `TESTING` | 테스트 | 테스트 단계 |
| `DONE` | 완료 | 완료된 업무 |

### 📅 일정 및 대시보드
- 팀별 일정 등록, 조회, 수정, 삭제
- 캘린더에서 팀 일정과 업무 마감일 확인
- 참여 중인 여러 팀의 업무·일정·진행률 통합 조회
- 최근 업무, 다가오는 일정, 팀별 진행률 표시
- 업무별 소속 팀 배지로 정보 구분

### 🎨 사용자 경험
- 라이트 / 다크 / 시스템 테마 선택
- 로그인 전 랜딩 페이지 제공
- 팀별 상세 화면 및 직관적인 탐색 구조

## 🏗️ 시스템 구성

```text
[사용자 브라우저]
       │
       ▼
React + Vite (Frontend)
       │  REST API / JWT
       ▼
Spring Boot (Backend)
       ├── Spring Security / JWT 인증
       ├── Controller → Service → Repository
       ├── Spring Data JPA ── MySQL
       └── Email Service ── Gmail SMTP
```

### 인증 처리 흐름

1. 사용자가 로그인 정보를 입력하면 프론트엔드에서 인증 API를 호출합니다.
2. 백엔드는 사용자 정보를 확인하고 비밀번호를 검증합니다.
3. 인증에 성공하면 JWT를 발급합니다.
4. 프론트엔드는 이후 보호된 API 요청에 JWT를 포함합니다.
5. Spring Security가 토큰을 검사하고 요청을 처리합니다.

> **보안 참고:** 현재 비밀번호 변경 후에는 브라우저에 저장된 토큰을 삭제하여 로그아웃합니다. 이미 발급된 다른 기기의 JWT까지 서버에서 즉시 폐기하는 기능은 추후 보완할 예정입니다.

### 대시보드 데이터 처리 흐름

```text
GET /api/teams
      │
      ▼
사용자가 참여한 팀 목록 조회
      │
      ├── GET /api/teams/{teamId}/tasks
      ├── GET /api/teams/{teamId}/tasks/progress
      └── GET /api/teams/{teamId}/schedules
      │
      ▼
팀별 응답을 프론트엔드에서 통합
      │
      ▼
전체 통계 · 최근 업무 · 팀 진행률 · 예정 일정 표시
```

기존의 **팀 단위 API를 재사용**하여 대시보드를 구성했습니다. 팀별 데이터 조회에 일부 실패하더라도 조회에 성공한 정보는 표시하고, 누락된 항목은 사용자에게 안내하도록 설계했습니다.

## 📁 프로젝트 구조

```text
Team-Mate/
├── frontend/            # React + Vite
│   └── src/
│       ├── pages/        # 화면별 페이지
│       ├── components/   # 공통 UI 컴포넌트
│       ├── context/      # 테마 등 전역 상태
│       └── styles/       # 공통 스타일
├── backend/             # Spring Boot
│   └── src/main/java/com/teammate/backend/
│       ├── auth/         # 인증
│       ├── user/         # 사용자
│       ├── team/         # 팀
│       ├── task/         # 업무
│       ├── schedule/     # 일정
│       └── email/        # 이메일 발송
└── README.md
```

> 위 구조는 주요 디렉터리를 이해하기 쉽도록 요약한 것입니다.

## 📸 주요 화면

스크린샷은 화면 구성이 안정화되는 대로 추가할 예정입니다.

| 랜딩 페이지 | 대시보드 |
| :---: | :---: |
| 추후 이미지 추가 | 추후 이미지 추가 |

| 팀 관리 | 칸반 보드 |
| :---: | :---: |
| 추후 이미지 추가 | 추후 이미지 추가 |

## 🚀 로컬 실행

### 준비 환경
- Java 21
- Node.js 및 npm
- MySQL
- Gmail SMTP 설정(이메일 인증 기능 사용 시)

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

기본 개발 서버 주소는 `http://localhost:5173`입니다.

### 백엔드

```bash
cd backend
./gradlew bootRun
```

Windows PowerShell에서는 다음 명령어를 사용할 수 있습니다.

```powershell
cd backend
.\gradlew.bat bootRun
```

기본 API 서버 주소는 `http://localhost:8080`입니다.

> MySQL 접속 정보, JWT 서명 키, SMTP 계정 등 **민감한 설정은 로컬 환경에서 별도로 구성**해야 합니다. 실제 비밀번호나 비밀키를 GitHub에 업로드하지 마세요. DB 포트 등 설정값은 개발 환경에 따라 달라질 수 있습니다.

## 🧭 개발 현황 및 향후 계획

**현재 구현된 주요 영역**
- [x] 개발 환경 및 MySQL 연동
- [x] JWT 로그인 / 회원가입 / 이메일 인증
- [x] 팀 및 팀원 관리
- [x] 업무 CRUD 및 칸반 상태 관리
- [x] 팀 일정 및 캘린더
- [x] 마이페이지 / 비밀번호 변경
- [x] 실데이터 기반 대시보드
- [x] 라이트·다크 테마

**향후 개선 방향**
- [ ] 사용성 및 반응형 UI 보완
- [ ] 예외 처리와 권한 검증 강화
- [ ] 자동화 테스트 확대
- [ ] 서버 측 토큰 무효화 등 보안 개선
- [ ] 배포 환경 구성 및 운영 점검
- [ ] 실제 서비스 화면 스크린샷 추가

---

<div align="center">

**Team-Mate — 함께하는 프로젝트, 더 쉬워지는 협업**

_Computer Engineering · Capstone Design · 2026_

</div>
