import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const title = "INU 생활형 계산기";
const description =
  "할인, 더치페이, 단가 비교, 시급·월급, 대출, 예금, 주유비, BMI, 날짜 차이, 단위 변환을 한곳에서 계산하세요.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title,
  description,
  applicationName: title,
  category: "utilities",
  keywords: [
    "생활 계산기",
    "할인 계산기",
    "더치페이 계산기",
    "대출 계산기",
    "예금 이자 계산기",
    "BMI 계산기",
    "단위 변환",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  appleWebApp: {
    capable: true,
    title: "INU CALC",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#111318" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('inu-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
