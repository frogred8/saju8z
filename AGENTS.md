# saju8z 라이브러리

- 브라우저·Node.js용 순수 만세력 계산 패키지다. 앱·성격 해석·모델·DB 코드는 형제 저장소 `../saju8za`가 소유한다.
- 공개 API는 `src/index.ts`, 저수준 호환 API는 `src/core.ts`다. 계산 규칙은 옮기기만 하고 임의 변경하지 않는다.
- `npm test`, `npm run lint`, `npm run typecheck`로 검증한다. `npm pack --dry-run`과 설치한 tarball의 ESM/CJS/타입/브라우저 검증을 포함한다.
- 런타임에 네트워크·Node 전용 모듈·현재 시각·사용자 환경 시간대를 참조하지 않는다.
- 스킬은 `skills/saju8z`에서 관리한다. `npm run pack:skill`로 공유 ZIP을 만든다.
- 필요할 때만 읽기 전용 에이전트 최대 2명을 `gpt-6.1-sol` / `low` / `fork_turns: "none"`으로 사용한다. 메인만 수정한다.
- npm 게시·원격 작업은 사용자 요청 범위에 한정한다. 현재 요청에는 GitHub 저장소 생성이 포함되며 npm registry publish는 포함되지 않는다.
