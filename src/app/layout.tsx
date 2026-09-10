import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "INU 생활형 계산기",
  description: "할인, 더치페이, 대출, 예금, BMI 등 생활에 필요한 계산 10가지를 한곳에서 사용하세요.",
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
