# INU 생활형 계산기

일상에서 자주 쓰는 계산 10가지를 하나의 반응형 웹 서비스로 모은 프로젝트입니다. 모든 계산은 브라우저 안에서만 수행되며 입력값을 저장하지 않습니다.

## 기능

- 할인, 더치페이, 단가 비교, 시급·월급
- 대출 상환, 예금 이자, 주유비, BMI
- 날짜 차이, 단위 변환
- 카드 확장 UI, 라이트·다크 모드, 모바일 반응형 레이아웃
- Pretendard + Montserrat 로컬 폰트, 그레인·글래스 질감, fade-up 모션, 라우트 skeleton UI

## 로컬 실행

Node.js 20.9 이상을 사용합니다.

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 검증

```bash
npm run check
```

위 명령은 ESLint, Vitest 계산식 테스트, Next.js production build를 순서대로 실행합니다.

## GitHub·Vercel 배포

1. GitHub에 빈 `calculators26_2_2` 저장소를 만듭니다.
2. 이 폴더의 Git 원격을 해당 저장소로 지정하고 `main` 브랜치를 push합니다.
3. Vercel에서 **Add New → Project**로 GitHub 저장소를 가져옵니다.
4. Framework Preset은 Next.js, Build Command와 Output Directory는 기본값을 유지한 뒤 배포합니다.

별도의 환경 변수는 필요하지 않습니다.

## 기술 구성

Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide Icons, Vitest
