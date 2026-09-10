export const clampAtZero = (value: number) => Math.max(0, value);

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number,
  coupon: number,
) {
  const discount = originalPrice * (clampAtZero(discountPercent) / 100);
  const finalPrice = clampAtZero(originalPrice - discount - clampAtZero(coupon));

  return { finalPrice, saved: clampAtZero(originalPrice - finalPrice) };
}

export function calculateSplitBill(
  amount: number,
  people: number,
  extraPercent: number,
) {
  const headcount = Math.max(1, Math.floor(people));
  const total = clampAtZero(amount) * (1 + clampAtZero(extraPercent) / 100);

  return { total, perPerson: total / headcount, headcount };
}

export function calculateUnitPrice(price: number, quantity: number, base = 100) {
  if (quantity <= 0) return 0;
  return (clampAtZero(price) / quantity) * base;
}

export function calculateUnitComparison(
  priceA: number,
  quantityA: number,
  priceB: number,
  quantityB: number,
  base = 100,
) {
  if (quantityA <= 0 || quantityB <= 0 || base <= 0) {
    return { unitPriceA: 0, unitPriceB: 0, difference: 0, cheaper: "invalid" as const };
  }

  const unitPriceA = calculateUnitPrice(priceA, quantityA, base);
  const unitPriceB = calculateUnitPrice(priceB, quantityB, base);
  const difference = Math.abs(unitPriceA - unitPriceB);
  const cheaper =
    difference < 0.005 ? "same" : unitPriceA < unitPriceB ? "A" : "B";

  return { unitPriceA, unitPriceB, difference, cheaper };
}

export function calculateWage(
  hourlyWage: number,
  hoursPerDay: number,
  daysPerWeek: number,
  deductionPercent: number,
) {
  const monthlyHours =
    clampAtZero(hoursPerDay) * clampAtZero(daysPerWeek) * 4.345;
  const gross = clampAtZero(hourlyWage) * monthlyHours;
  const net = gross * (1 - Math.min(100, clampAtZero(deductionPercent)) / 100);

  return { monthlyHours, gross, net };
}

export function calculateLoan(
  principal: number,
  annualRate: number,
  months: number,
) {
  const safePrincipal = clampAtZero(principal);
  const term = Math.max(1, Math.floor(months));
  const monthlyRate = clampAtZero(annualRate) / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? safePrincipal / term
      : (safePrincipal * monthlyRate * (1 + monthlyRate) ** term) /
        ((1 + monthlyRate) ** term - 1);
  const totalPayment = monthlyPayment * term;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest: clampAtZero(totalPayment - safePrincipal),
  };
}

export function calculateDeposit(
  principal: number,
  annualRate: number,
  months: number,
  taxRate = 15.4,
) {
  const safePrincipal = clampAtZero(principal);
  const grossInterest =
    safePrincipal * (clampAtZero(annualRate) / 100) * (clampAtZero(months) / 12);
  const tax = grossInterest * (clampAtZero(taxRate) / 100);

  return {
    grossInterest,
    tax,
    netInterest: grossInterest - tax,
    maturityAmount: safePrincipal + grossInterest - tax,
  };
}

export function calculateFuelCost(
  distance: number,
  efficiency: number,
  pricePerLiter: number,
) {
  if (efficiency <= 0) return { liters: 0, cost: 0 };
  const liters = clampAtZero(distance) / efficiency;
  return { liters, cost: liters * clampAtZero(pricePerLiter) };
}

export function calculateBmi(weightKg: number, heightCm: number) {
  if (heightCm <= 0) return { bmi: 0, category: "—" };
  const bmi = clampAtZero(weightKg) / (heightCm / 100) ** 2;
  const category =
    bmi < 18.5
      ? "저체중"
      : bmi < 23
        ? "정상"
        : bmi < 25
          ? "비만 전단계"
          : bmi < 30
            ? "1단계 비만"
            : "2단계 이상 비만";

  return { bmi, category };
}

export function calculateDateDifference(start: string, end: string) {
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 0;
  return Math.abs(Math.round((endTime - startTime) / 86_400_000));
}

export type ConversionType = "km-mi" | "pyeong-m2" | "c-f" | "kg-lb";

export function convertUnit(type: ConversionType, value: number) {
  switch (type) {
    case "km-mi":
      return value * 0.621371;
    case "pyeong-m2":
      return value * 3.305785;
    case "c-f":
      return (value * 9) / 5 + 32;
    case "kg-lb":
      return value * 2.204623;
  }
}
