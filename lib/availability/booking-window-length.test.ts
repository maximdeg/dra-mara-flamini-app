import { describe, expect, it } from "vitest";
import {
  BOOKING_WINDOW_LENGTH_LABELS,
  BOOKING_WINDOW_LENGTH_OPTIONS,
  DEFAULT_BOOKING_WINDOW_DAYS,
  sanitizeBookingWindowLength,
} from "./booking-window-length";
import { InMemoryBookingWindowLengthRepository } from "./in-memory-booking-window-length-repository";

describe("Booking Window length", () => {
  it("defaults to 30 days", () => {
    expect(DEFAULT_BOOKING_WINDOW_DAYS).toBe(30);
  });

  it("offers two weeks, then one to six months in half-month steps", () => {
    expect(BOOKING_WINDOW_LENGTH_OPTIONS).toEqual([
      14, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180,
    ]);
  });

  it("labels each option in weeks or months", () => {
    expect(BOOKING_WINDOW_LENGTH_LABELS[14]).toBe("2 semanas");
    expect(BOOKING_WINDOW_LENGTH_LABELS[30]).toBe("1 mes");
    expect(BOOKING_WINDOW_LENGTH_LABELS[45]).toBe("1 ½ meses");
    expect(BOOKING_WINDOW_LENGTH_LABELS[90]).toBe("3 meses");
    expect(BOOKING_WINDOW_LENGTH_LABELS[165]).toBe("5 ½ meses");
    expect(BOOKING_WINDOW_LENGTH_LABELS[180]).toBe("6 meses");
  });
});

describe("sanitizeBookingWindowLength", () => {
  it("keeps an offered length, including its string form", () => {
    expect(sanitizeBookingWindowLength(90)).toBe(90);
    expect(sanitizeBookingWindowLength("135")).toBe(135);
  });

  it("falls back to 30 for anything not offered", () => {
    expect(sanitizeBookingWindowLength(31)).toBe(30);
    expect(sanitizeBookingWindowLength(365)).toBe(30);
    expect(sanitizeBookingWindowLength("abc")).toBe(30);
    expect(sanitizeBookingWindowLength(undefined)).toBe(30);
  });
});

describe("BookingWindowLengthRepository (in-memory)", () => {
  it("returns the default until saved", async () => {
    expect(await new InMemoryBookingWindowLengthRepository().get()).toBe(30);
  });

  it("returns the saved length", async () => {
    const repository = new InMemoryBookingWindowLengthRepository();

    await repository.save(90);

    expect(await repository.get()).toBe(90);
  });
});
