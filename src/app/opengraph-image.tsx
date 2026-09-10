import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "INU 생활형 계산기 — 생활의 숫자를 빠르고 정확하게";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pretendard = readFile(
  join(
    process.cwd(),
    "node_modules/pretendard/dist/web/static/woff/Pretendard-Bold.woff",
  ),
);

export default async function OpenGraphImage() {
  const font = await pretendard;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "2px solid #6e8cff",
          background: "#111318",
          color: "#f0efe9",
          fontFamily: "Pretendard",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 54,
                height: 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                background: "#2457ff",
                color: "white",
                fontSize: 34,
              }}
            >
              I
            </div>
            <div style={{ fontSize: 25, letterSpacing: "0.12em" }}>
              INU CALC
            </div>
          </div>
          <div style={{ color: "#91a6ff", fontSize: 20 }}>
            10 EVERYDAY TOOLS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 72, letterSpacing: "-0.04em" }}>
            생활의 숫자를
          </div>
          <div style={{ color: "#a5a7ad", fontSize: 72, letterSpacing: "-0.04em" }}>
            빠르고 정확하게.
          </div>
        </div>

        <div
          style={{
            paddingTop: 24,
            display: "flex",
            gap: 26,
            borderTop: "1px solid #494c54",
            color: "#a5a7ad",
            fontSize: 19,
          }}
        >
          <span>할인</span>
          <span>더치페이</span>
          <span>금융</span>
          <span>건강</span>
          <span>날짜</span>
          <span>단위 변환</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pretendard",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
