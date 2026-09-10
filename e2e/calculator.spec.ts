import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function openPage(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

test("선택한 계산기 하나만 표시하고 URL 기록을 탐색한다", async ({ page }) => {
  await openPage(page, "/?tool=bmi#calculators");

  await expect(page.getByRole("tab", { name: "BMI", exact: false })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  await expect(page.locator(".workspace-heading strong")).toHaveText("BMI");

  await page.getByRole("tab", { name: "시급·월급", exact: false }).click();
  await expect(page).toHaveURL(/\?tool=wage#calculators$/);
  await expect(page.locator(".workspace-heading strong")).toHaveText("시급·월급");

  await page.goBack();
  await expect(page).toHaveURL(/\?tool=bmi#calculators$/);
  await expect(page.locator(".workspace-heading strong")).toHaveText("BMI");
});

test("계산기를 전환해도 입력값을 유지한다", async ({ page }) => {
  await openPage(page, "/#calculators");

  const originalPrice = page.getByLabel("원래 가격");
  await originalPrice.fill("12345");
  await expect(originalPrice).toHaveValue("12,345");

  await page.getByRole("tab", { name: "BMI", exact: false }).click();
  await page.getByRole("tab", { name: "할인 계산", exact: false }).click();
  await expect(originalPrice).toHaveValue("12,345");
});

test("키보드로 계산기 탭을 이동한다", async ({ page }) => {
  await openPage(page, "/#calculators");

  const discountTab = page.getByRole("tab", { name: "할인 계산", exact: false });
  await discountTab.focus();
  await discountTab.press("ArrowRight");

  await expect(page.getByRole("tab", { name: "더치페이", exact: false })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page).toHaveURL(/\?tool=split#calculators$/);
});

test("모바일에서 페이지가 가로로 넘치지 않고 선택 탭을 보여준다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, "/#calculators");

  const unitTab = page.getByRole("tab", { name: "단위 변환", exact: false });
  await unitTab.click();
  await expect(unitTab).toHaveAttribute("aria-selected", "true");

  const layout = await page.evaluate(() => {
    const activeTab = document.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]',
    );
    const bounds = activeTab?.getBoundingClientRect();
    return {
      pageFits: document.documentElement.scrollWidth <= window.innerWidth,
      tabVisible: Boolean(
        bounds && bounds.left >= 0 && bounds.right <= window.innerWidth,
      ),
    };
  });

  expect(layout).toEqual({ pageFits: true, tabVisible: true });
});

test("선택한 테마를 새로고침 후에도 유지한다", async ({ page }) => {
  await openPage(page, "/");
  await page.evaluate(() => localStorage.setItem("inu-theme", "light"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "라이트·다크 모드 변경" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("자동 접근성 검사에서 중대한 위반이 없다", async ({ page }) => {
  await openPage(page, "/#calculators");
  await page.waitForTimeout(700);

  const lightResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(lightResults.violations).toEqual([]);

  await page.evaluate(() => localStorage.setItem("inu-theme", "dark"));
  await page.reload();
  const darkResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(darkResults.violations).toEqual([]);
});
