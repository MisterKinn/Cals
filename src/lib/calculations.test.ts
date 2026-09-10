import { describe, expect, it } from "vitest";
import {
  calculateBmi,
  calculateDateDifference,
  calculateDeposit,
  calculateDiscount,
  calculateFuelCost,
  calculateLoan,
  calculateSplitBill,
  calculateUnitPrice,
  calculateWage,
  convertUnit,
} from "./calculations";

describe("daily-life calculations", () => {
  it("calculates a discount with an additional coupon", () => {
    expect(calculateDiscount(100_000, 20, 5_000)).toEqual({
      finalPrice: 75_000,
      saved: 25_000,
    });
  });

  it("splits a bill including an extra percentage", () => {
    expect(calculateSplitBill(60_000, 3, 10).perPerson).toBeCloseTo(22_000);
  });

  it("normalizes a unit price", () => {
    expect(calculateUnitPrice(9_000, 300, 100)).toBe(3_000);
  });

  it("estimates a monthly wage", () => {
    expect(calculateWage(10_000, 8, 5, 0).gross).toBeCloseTo(1_738_000);
  });

  it("handles a zero-interest installment loan", () => {
    expect(calculateLoan(1_200_000, 0, 12).monthlyPayment).toBe(100_000);
  });

  it("applies the default Korean interest tax rate", () => {
    expect(calculateDeposit(1_000_000, 5, 12).netInterest).toBeCloseTo(42_300);
  });

  it("estimates fuel usage and cost", () => {
    expect(calculateFuelCost(120, 12, 1_700)).toEqual({
      liters: 10,
      cost: 17_000,
    });
  });

  it("classifies BMI using Korean adult cutoffs", () => {
    expect(calculateBmi(60, 170).category).toBe("정상");
  });

  it("calculates calendar-day difference", () => {
    expect(calculateDateDifference("2026-09-01", "2026-09-10")).toBe(9);
  });

  it("converts common everyday units", () => {
    expect(convertUnit("pyeong-m2", 10)).toBeCloseTo(33.05785);
  });
});
