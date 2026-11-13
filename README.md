# ALLGA 온라인 학습 (A안)

올가학원 온라인 학습 홈페이지의 정적 사이트입니다. 빌드 없이 폴더 그대로 배포합니다.

- 인계 내용, 구조, 실행·배포 방법, 디자인 규칙: **HANDOFF.md**
- 로컬 확인: `npx vercel dev`
- 배포: 본인 Vercel 계정에서 `vercel deploy --prod` (Framework: Other, 빌드 없음)

## 오르샤 사이트 구성 (2026-11-13)

- 정적 사이트(빌드 없음). Vercel 배포 공개 주소: https://allga-online-ab-review.vercel.app/?skin=b
- 화면: 랜딩(`index.html`), 학습 프로그램(`programs/`), 학습 화면(`study/`), 고객센터(`support/`)
- B안(현재 디자인) 기능·스타일: `allga-switch.js`, `allga-b.css` (CSS는 `allga-switch.js` 안에서 `?v=` 버전을 붙여 불러옴 — 고칠 때 버전 숫자 올리기), 상단 내 상태 줄·학습 시간: `b-me.js`
- 학습 화면은 생성기로 만든다: `tools/study-generator/` 참고

### 로컬에서 보기
페이지가 `/_next/...` 경로를 쓰므로 `_n` 폴더를 `_next` 로 연결해야 한다(Vercel에선 `vercel.json` 이 처리).

```bash
ln -s _n _next && python3 -m http.server 4317
```
그다음 http://127.0.0.1:4317/?skin=b
