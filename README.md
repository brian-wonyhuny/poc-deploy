# 누리 PoC 배포

GitHub Pages 기반 PoC 프로토타입 저장소.

## 배포 URL
https://brian-wonyhuny.github.io/poc-deploy/

## 구조
```
poc-deploy/
├── index.html        ← PoC 목록 페이지
└── projects/
    └── {프로젝트명}/  ← 각 PoC
        └── index.html
```

## 새 PoC 추가 방법
1. `projects/{프로젝트명}/` 폴더 생성
2. HTML 작성
3. git push → GitHub Pages 자동 배포
