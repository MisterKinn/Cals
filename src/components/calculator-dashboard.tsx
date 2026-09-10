"use client";

import {
    Banknote,
    CalendarDays,
    CarFront,
    Check,
    ChevronDown,
    CircleDollarSign,
    Coins,
    Copy,
    HeartPulse,
    Moon,
    Percent,
    RotateCcw,
    Ruler,
    Scale,
    Sun,
    UsersRound,
    type LucideIcon,
} from "lucide-react";
import {
    useEffect,
    useState,
    useSyncExternalStore,
    type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    calculateBmi,
    calculateDateDifference,
    calculateDeposit,
    calculateDiscount,
    calculateFuelCost,
    calculateLoan,
    calculateSplitBill,
    calculateUnitComparison,
    calculateWage,
    convertUnit,
    type ConversionType,
} from "@/lib/calculations";

const won = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
});
const decimal = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

type Field = {
    key: string;
    label: string;
    initial: number | string;
    suffix?: string;
    type?: "number" | "date" | "select";
    min?: number;
    max?: number;
    step?: number;
    options?: { value: string; label: string }[];
};

type Values = Record<string, number | string>;
type Result = { primary: string; detail: string; notice?: string };
type CalculatorDefinition = {
    id: string;
    title: string;
    description: string;
    tag: string;
    icon: LucideIcon;
    fields: Field[];
    formula: string;
    calculate: (values: Values) => Result;
};

function parseNumericValue(value: number | string) {
    const parsed = Number(String(value).replaceAll(",", ""));
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function formatNumericInput(value: string, allowNegative = false) {
    const withoutCommas = value.replaceAll(",", "");
    if (withoutCommas.trim() === "") return "";
    if (allowNegative && withoutCommas.trim() === "-") return "-";
    const negative = allowNegative && withoutCommas.trimStart().startsWith("-");
    const unsigned = withoutCommas.replaceAll("-", "").replace(/[^\d.]/g, "");
    const dotIndex = unsigned.indexOf(".");
    const hasDecimal = dotIndex >= 0;
    const integer = (hasDecimal ? unsigned.slice(0, dotIndex) : unsigned) || "0";
    const fraction = hasDecimal
        ? unsigned.slice(dotIndex + 1).replaceAll(".", "")
        : "";
    const grouped = integer.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${negative ? "-" : ""}${grouped}${hasDecimal ? `.${fraction}` : ""}`;
}

const num = (values: Values, key: string) =>
    parseNumericValue(values[key]) || 0;

function getMinimum(field: Field, definition: CalculatorDefinition, values: Values) {
    if (field.min !== undefined) return field.min;
    if (definition.id === "convert" && values.conversion === "c-f") return -273.15;
    return 0;
}

function createInitialValues(definition: CalculatorDefinition): Values {
    return Object.fromEntries(
        definition.fields.map((field) => [
            field.key,
            field.type === "date" || field.type === "select"
                ? field.initial
                : formatNumericInput(String(field.initial), Number(field.initial) < 0),
        ]),
    );
}

const calculators: CalculatorDefinition[] = [
    {
        id: "discount",
        title: "할인 계산",
        description: "할인율과 쿠폰을 한 번에",
        tag: "쇼핑",
        icon: Percent,
        fields: [
            { key: "price", label: "원래 가격", initial: 89000, suffix: "원" },
            { key: "rate", label: "할인율", initial: 20, suffix: "%", max: 100 },
            { key: "coupon", label: "쿠폰 금액", initial: 5000, suffix: "원" },
        ],
        formula: "최종가 = 원가 - (원가 × 할인율) - 쿠폰",
        calculate: (v) => {
            const result = calculateDiscount(
                num(v, "price"),
                num(v, "rate"),
                num(v, "coupon"),
            );
            return {
                primary: won.format(result.finalPrice),
                detail: `총 ${won.format(result.saved)} 절약해요.`,
            };
        },
    },
    {
        id: "split",
        title: "더치페이",
        description: "여러 명이 깔끔하게 나누기",
        tag: "약속",
        icon: UsersRound,
        fields: [
            { key: "amount", label: "총 금액", initial: 72000, suffix: "원" },
            { key: "people", label: "인원", initial: 4, suffix: "명", min: 1 },
            { key: "extra", label: "추가 비율", initial: 0, suffix: "%" },
        ],
        formula: "1인당 금액 = 총액 × (1 + 추가 비율) ÷ 인원",
        calculate: (v) => {
            const result = calculateSplitBill(
                num(v, "amount"),
                num(v, "people"),
                num(v, "extra"),
            );
            return {
                primary: `${won.format(result.perPerson)} / 1인`,
                detail: `추가금 포함 총액은 ${won.format(result.total)}이에요.`,
            };
        },
    },
    {
        id: "unit-price",
        title: "단가 비교",
        description: "용량이 달라도 가성비 비교",
        tag: "장보기",
        icon: Scale,
        fields: [
            {
                key: "priceA",
                label: "상품 A 가격",
                initial: 12900,
                suffix: "원",
            },
            {
                key: "quantityA",
                label: "상품 A 용량·수량",
                initial: 500,
                suffix: "g/ml/개",
                min: 0.01,
            },
            {
                key: "priceB",
                label: "상품 B 가격",
                initial: 10900,
                suffix: "원",
            },
            {
                key: "quantityB",
                label: "상품 B 용량·수량",
                initial: 450,
                suffix: "g/ml/개",
                min: 0.01,
            },
            {
                key: "base",
                label: "비교 단위",
                initial: 100,
                suffix: "단위",
                min: 1,
            },
        ],
        formula: "각 상품 단가 = 가격 ÷ 용량 × 비교 단위",
        calculate: (v) => {
            const base = num(v, "base");
            const result = calculateUnitComparison(
                num(v, "priceA"),
                num(v, "quantityA"),
                num(v, "priceB"),
                num(v, "quantityB"),
                base,
            );
            const primary =
                result.cheaper === "same"
                    ? "두 상품의 단가가 같아요."
                    : `상품 ${result.cheaper}가 더 저렴해요.`;
            return {
                primary,
                detail: `A ${won.format(result.unitPriceA)} · B ${won.format(result.unitPriceB)} / ${decimal.format(base)}단위 · 차이 ${won.format(result.difference)}`,
            };
        },
    },
    {
        id: "wage",
        title: "시급·월급",
        description: "이번 달 알바비 미리 보기",
        tag: "일",
        icon: Banknote,
        fields: [
            { key: "hourly", label: "시급", initial: 10500, suffix: "원" },
            {
                key: "hours",
                label: "하루 근무",
                initial: 6,
                suffix: "시간",
                step: 0.5,
            },
            { key: "days", label: "주당 근무", initial: 4, suffix: "일" },
            {
                key: "deduction",
                label: "공제율",
                initial: 3.3,
                suffix: "%",
                step: 0.1,
                max: 100,
            },
        ],
        formula: "월 근무시간 = 일 근무 × 주 근무일 × 평균 4.345주",
        calculate: (v) => {
            const result = calculateWage(
                num(v, "hourly"),
                num(v, "hours"),
                num(v, "days"),
                num(v, "deduction"),
            );
            return {
                primary: `예상 실수령액 ${won.format(result.net)}`,
                detail: `세전 ${won.format(result.gross)} · 약 ${decimal.format(result.monthlyHours)}시간`,
            };
        },
    },
    {
        id: "loan",
        title: "대출 상환",
        description: "원리금균등 월 부담 계산",
        tag: "금융",
        icon: CircleDollarSign,
        fields: [
            {
                key: "principal",
                label: "대출 원금",
                initial: 10000000,
                suffix: "원",
            },
            {
                key: "rate",
                label: "연 금리",
                initial: 4.5,
                suffix: "%",
                step: 0.1,
            },
            {
                key: "months",
                label: "상환 기간",
                initial: 24,
                suffix: "개월",
                min: 1,
            },
        ],
        formula: "월 상환액 = P × r(1+r)ⁿ ÷ ((1+r)ⁿ-1)",
        calculate: (v) => {
            const result = calculateLoan(
                num(v, "principal"),
                num(v, "rate"),
                num(v, "months"),
            );
            return {
                primary: `월 ${won.format(result.monthlyPayment)}`,
                detail: `총 이자 ${won.format(result.totalInterest)} · 원리금균등상환`,
            };
        },
    },
    {
        id: "deposit",
        title: "예금 이자",
        description: "세후 만기 수령액 확인",
        tag: "저축",
        icon: Coins,
        fields: [
            {
                key: "principal",
                label: "예치금",
                initial: 5000000,
                suffix: "원",
            },
            {
                key: "rate",
                label: "연 금리",
                initial: 3.5,
                suffix: "%",
                step: 0.1,
            },
            {
                key: "months",
                label: "예치 기간",
                initial: 12,
                suffix: "개월",
                min: 1,
            },
        ],
        formula: "세후 이자 = 원금 × 연이율 × 기간 × (1-15.4%)",
        calculate: (v) => {
            const result = calculateDeposit(
                num(v, "principal"),
                num(v, "rate"),
                num(v, "months"),
            );
            return {
                primary: `만기 ${won.format(result.maturityAmount)}`,
                detail: `세후 이자 ${won.format(result.netInterest)} · 일반과세 15.4% 기준`,
            };
        },
    },
    {
        id: "fuel",
        title: "주유비",
        description: "거리와 연비로 이동비 예상",
        tag: "이동",
        icon: CarFront,
        fields: [
            {
                key: "distance",
                label: "총 이동거리",
                initial: 180,
                suffix: "km",
            },
            {
                key: "efficiency",
                label: "평균 연비",
                initial: 12.5,
                suffix: "km/L",
                step: 0.1,
                min: 0.1,
            },
            { key: "price", label: "리터당 유가", initial: 1680, suffix: "원" },
        ],
        formula: "주유비 = 이동거리 ÷ 연비 × 리터당 유가",
        calculate: (v) => {
            const result = calculateFuelCost(
                num(v, "distance"),
                num(v, "efficiency"),
                num(v, "price"),
            );
            return {
                primary: `예상 주유비 ${won.format(result.cost)}`,
                detail: `필요 연료는 약 ${decimal.format(result.liters)}L예요.`,
            };
        },
    },
    {
        id: "bmi",
        title: "BMI",
        description: "키와 체중으로 체질량지수 확인",
        tag: "건강",
        icon: HeartPulse,
        fields: [
            {
                key: "height",
                label: "키",
                initial: 170,
                suffix: "cm",
                step: 0.1,
                min: 1,
            },
            {
                key: "weight",
                label: "체중",
                initial: 65,
                suffix: "kg",
                step: 0.1,
            },
        ],
        formula: "BMI = 체중(kg) ÷ 키(m)²",
        calculate: (v) => {
            const result = calculateBmi(num(v, "weight"), num(v, "height"));
            return {
                primary: `BMI ${decimal.format(result.bmi)}`,
                detail: `성인 기준 ${result.category} 범위예요.`,
                notice: "건강 판단이 아닌 일반적인 참고용 결과입니다.",
            };
        },
    },
    {
        id: "date",
        title: "날짜 차이",
        description: "개강·시험·여행까지 며칠?",
        tag: "일정",
        icon: CalendarDays,
        fields: [
            {
                key: "start",
                label: "시작일",
                initial: "2026-09-01",
                type: "date",
            },
            {
                key: "end",
                label: "마지막일",
                initial: "2026-12-15",
                type: "date",
            },
        ],
        formula: "날짜 차이 = |마지막일 - 시작일|",
        calculate: (v) => ({
            primary: `${decimal.format(calculateDateDifference(String(v.start), String(v.end)))}일 차이`,
            detail: "시작일 다음 날부터 마지막일까지의 날짜 차이예요.",
        }),
    },
    {
        id: "convert",
        title: "단위 변환",
        description: "평·마일·온도·무게를 빠르게",
        tag: "변환",
        icon: Ruler,
        fields: [
            {
                key: "conversion",
                label: "변환 유형",
                initial: "pyeong-m2",
                type: "select",
                options: [
                    { value: "pyeong-m2", label: "평 → 제곱미터" },
                    { value: "km-mi", label: "킬로미터 → 마일" },
                    { value: "c-f", label: "섭씨 → 화씨" },
                    { value: "kg-lb", label: "킬로그램 → 파운드" },
                ],
            },
            { key: "value", label: "변환할 값", initial: 10, step: 0.1 },
        ],
        formula: "변환 유형에 따른 표준 환산계수를 적용",
        calculate: (v) => {
            const type = String(v.conversion) as ConversionType;
            const units: Record<ConversionType, [string, string]> = {
                "km-mi": ["km", "mi"],
                "pyeong-m2": ["평", "m²"],
                "c-f": ["℃", "℉"],
                "kg-lb": ["kg", "lb"],
            };
            const [from, to] = units[type];
            return {
                primary: `${decimal.format(convertUnit(type, num(v, "value")))} ${to}`,
                detail: `${decimal.format(num(v, "value"))} ${from}의 변환 결과예요.`,
            };
        },
    },
];

const defaultTool = calculators[0].id;
const toolChangeEvent = "calculator-tool-change";

function getToolFromUrl() {
    const requestedTool = new URLSearchParams(window.location.search).get("tool");
    return calculators.some((item) => item.id === requestedTool)
        ? requestedTool!
        : defaultTool;
}

function subscribeToToolUrl(onStoreChange: () => void) {
    window.addEventListener("popstate", onStoreChange);
    window.addEventListener(toolChangeEvent, onStoreChange);
    return () => {
        window.removeEventListener("popstate", onStoreChange);
        window.removeEventListener(toolChangeEvent, onStoreChange);
    };
}

function setToolUrl(id: string) {
    if (getToolFromUrl() === id) return;

    const url = new URL(window.location.href);
    if (id === defaultTool) url.searchParams.delete("tool");
    else url.searchParams.set("tool", id);
    window.history.pushState(null, "", url);
    window.dispatchEvent(new Event(toolChangeEvent));
}

function CalculatorPanel({ definition }: { definition: CalculatorDefinition }) {
    const [values, setValues] = useState<Values>(() =>
        createInitialValues(definition),
    );
    const [copyStatus, setCopyStatus] = useState<
        "idle" | "copied" | "failed"
    >("idle");
    const errors = Object.fromEntries(
        definition.fields.map((field) => {
            const value = values[field.key];
            let error: string | undefined;

            if (field.type === "date" && !String(value).trim()) {
                error = "날짜를 선택해 주세요.";
            } else if (field.type !== "date" && field.type !== "select") {
                const parsed = parseNumericValue(value);
                const minimum = getMinimum(field, definition, values);
                if (!Number.isFinite(parsed)) {
                    error = "값을 입력해 주세요.";
                } else if (parsed < minimum) {
                    error = `${decimal.format(minimum)} 이상 입력해 주세요.`;
                } else if (field.max !== undefined && parsed > field.max) {
                    error = `${decimal.format(field.max)} 이하로 입력해 주세요.`;
                }
            }

            return [field.key, error];
        }),
    ) as Record<string, string | undefined>;
    const hasErrors = Object.values(errors).some(Boolean);
    const result = hasErrors ? null : definition.calculate(values);

    function resetValues() {
        setValues(createInitialValues(definition));
        setCopyStatus("idle");
    }

    async function copyResult() {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(
                `${definition.title}: ${result.primary}\n${result.detail}`,
            );
            setCopyStatus("copied");
            window.setTimeout(() => setCopyStatus("idle"), 1800);
        } catch {
            setCopyStatus("failed");
        }
    }

    return (
        <form
            className="calculator-body"
            onSubmit={(event) => {
                event.preventDefault();
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }}
        >
            <div className="fields-grid">
                {definition.fields.map((field) => {
                    const id = `${definition.id}-${field.key}`;
                    const errorId = `${id}-error`;
                    const error = errors[field.key];
                    return (
                        <div
                            className={
                                field.type === "select"
                                    ? "field-group full-field"
                                    : "field-group"
                            }
                            key={field.key}
                        >
                            <Label htmlFor={id}>{field.label}</Label>
                            {field.type === "select" ? (
                                <select
                                    id={id}
                                    value={values[field.key]}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            [field.key]: event.target.value,
                                        }))
                                    }
                                >
                                    {field.options?.map((option) => (
                                        <option
                                            value={option.value}
                                            key={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="field-wrap">
                                    <Input
                                        id={id}
                                        type={field.type === "date" ? "date" : "text"}
                                        inputMode={
                                            field.type === "date"
                                                ? undefined
                                                : "decimal"
                                        }
                                        enterKeyHint="done"
                                        value={values[field.key]}
                                        aria-invalid={Boolean(error)}
                                        aria-describedby={
                                            error ? errorId : undefined
                                        }
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                [field.key]:
                                                    field.type === "date"
                                                        ? event.target.value
                                                        : formatNumericInput(
                                                              event.target.value,
                                                              getMinimum(
                                                                  field,
                                                                  definition,
                                                                  current,
                                                              ) < 0,
                                                          ),
                                            }))
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                event.currentTarget.blur();
                                            }
                                        }}
                                    />
                                    {field.suffix && (
                                        <span>{field.suffix}</span>
                                    )}
                                </div>
                            )}
                            {error && (
                                <p className="field-error" id={errorId}>
                                    {error}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
            {result ? (
                <div className="result-box" aria-live="polite">
                    <span>계산 결과</span>
                    <strong>{result.primary}</strong>
                    <p>{result.detail}</p>
                </div>
            ) : (
                <div className="result-box result-disabled" aria-live="polite">
                    <span>입력 확인</span>
                    <strong>값을 확인해 주세요.</strong>
                    <p>표시된 항목을 수정하면 결과가 바로 나타납니다.</p>
                </div>
            )}
            <p className="formula">공식 · {definition.formula}</p>
            {result?.notice && <p className="notice">※ {result.notice}</p>}
            <div className="panel-actions">
                <Button
                    className="action-button"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetValues}
                >
                    <RotateCcw /> 초기화
                </Button>
                <Button
                    className="action-button"
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!result}
                    onClick={copyResult}
                >
                    {copyStatus === "copied" ? <Check /> : <Copy />}
                    {copyStatus === "copied"
                        ? "복사됨"
                        : copyStatus === "failed"
                          ? "복사 실패"
                          : "결과 복사"}
                </Button>
            </div>
        </form>
    );
}

function ThemeToggle() {
    function toggleTheme() {
        const root = document.documentElement;
        const isDark = root.classList.toggle("dark");
        localStorage.setItem("inu-theme", isDark ? "dark" : "light");
    }

    return (
        <Button
            className="theme-toggle"
            variant="outline"
            size="icon-lg"
            onClick={toggleTheme}
            aria-label="라이트·다크 모드 변경"
        >
            <Sun className="sun-icon" />
            <Moon className="moon-icon" />
        </Button>
    );
}

function CalculatorWorkspace({ activeTool }: { activeTool: string }) {
    const activeIndex = calculators.findIndex((item) => item.id === activeTool);
    const activeCalculator = calculators[activeIndex] ?? calculators[0];
    const Icon = activeCalculator.icon;

    return (
        <article className="calculator-workspace reveal-card">
            <header className="workspace-heading">
                <span className="card-index">
                    {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="icon-box">
                    <Icon />
                </span>
                <span className="card-heading">
                    <span className="tag">{activeCalculator.tag}</span>
                    <strong>{activeCalculator.title}</strong>
                    <span>{activeCalculator.description}</span>
                </span>
            </header>
            {calculators.map((item) => (
                <div
                    className="workspace-panel"
                    id={`${item.id}-panel`}
                    key={item.id}
                    role="tabpanel"
                    aria-labelledby={`${item.id}-tab`}
                    hidden={activeTool !== item.id}
                >
                    <CalculatorPanel definition={item} />
                </div>
            ))}
        </article>
    );
}

export function CalculatorDashboard() {
    const activeTool = useSyncExternalStore(
        subscribeToToolUrl,
        getToolFromUrl,
        () => defaultTool,
    );

    useEffect(() => {
        document.getElementById(`${activeTool}-tab`)?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [activeTool]);

    function selectTool(id: string) {
        setToolUrl(id);
    }

    function handleTabKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % calculators.length;
        else if (event.key === "ArrowLeft") {
            nextIndex = (index - 1 + calculators.length) % calculators.length;
        } else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = calculators.length - 1;
        else return;

        event.preventDefault();
        const nextTab = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]',
        )[nextIndex];
        nextTab?.focus();
        selectTool(calculators[nextIndex].id);
    }

    return (
        <div className="site-shell">
            <header className="topbar">
                <a
                    className="brand"
                    href="#top"
                    aria-label="INU CALC · 생활형 계산기 홈"
                >
                    <span className="brand-mark" aria-hidden="true">
                        I
                    </span>
                    <span>
                        INU <b>CALC</b>
                    </span>
                </a>
                <ThemeToggle />
            </header>

            <main id="top">
                <section className="hero" aria-labelledby="main-title">
                    <p className="eyebrow">01 / EVERYDAY UTILITIES</p>
                    <h1 id="main-title">
                        INU <span>생활형 계산기</span>
                    </h1>
                    <p className="hero-copy">
                        복잡한 숫자는 여기 두세요.
                        <br />
                        생활에 필요한 계산을 빠르고 가볍게.
                    </p>
                    <a className="hero-cta" href="#calculators">
                        계산 시작하기 <ChevronDown />
                    </a>
                    <div className="hero-stats" aria-label="서비스 특징">
                        <div>
                            <strong>10</strong>
                            <span>생활 계산기</span>
                        </div>
                        <div>
                            <strong>0</strong>
                            <span>로그인·저장</span>
                        </div>
                        <div>
                            <strong>100%</strong>
                            <span>무료 사용</span>
                        </div>
                    </div>
                </section>

                <section
                    className="calculator-section"
                    id="calculators"
                    aria-labelledby="calculator-title"
                >
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">SMART TOOLS</p>
                            <h2 id="calculator-title">
                                필요한 계산을
                                <br />
                                <span>바로 시작하세요.</span>
                            </h2>
                        </div>
                        <p>
                            위에서 계산기를 선택하고,
                            <br />
                            값을 입력하면 즉시 결과가 나와요.
                        </p>
                    </div>
                    <nav
                        className="tool-index"
                        aria-label="계산기 선택"
                        role="tablist"
                    >
                        {calculators.map((item, index) => (
                            <button
                                key={item.id}
                                id={`${item.id}-tab`}
                                type="button"
                                role="tab"
                                aria-controls={`${item.id}-panel`}
                                aria-selected={activeTool === item.id}
                                data-active={activeTool === item.id}
                                tabIndex={activeTool === item.id ? 0 : -1}
                                onClick={() => selectTool(item.id)}
                                onKeyDown={(event) =>
                                    handleTabKeyDown(event, index)
                                }
                            >
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                {item.title}
                            </button>
                        ))}
                    </nav>
                    <CalculatorWorkspace activeTool={activeTool} />
                </section>
            </main>

            <footer>
                <div className="footer-brand">
                    <span className="brand-mark" aria-hidden="true">
                        I
                    </span>
                    <span>INU 생활형 계산기</span>
                </div>
                <p>Copyright INU 생활형 계산기 by kinn</p>
                <p className="footer-note">
                    계산 결과는 참고용이며, 실제 계약·세금·건강 판단은 전문
                    기준을 확인해 주세요.
                </p>
            </footer>
        </div>
    );
}
