"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CONSULT_TYPES,
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPES,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPES,
  VISIT_TYPE_LABELS,
  type ConsultType,
  type PracticeType,
  type VisitType,
} from "@/lib/appointments/visit-type";
import {
  coverageOptionsFor,
  type HealthInsurance,
} from "@/lib/coverage/coverage";
import {
  depositAmountFor,
  formatPesos,
  type SelfPayPricing,
} from "@/lib/deposit/deposit";
import { formatDateAR } from "@/lib/datetime/format";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import styles from "./page.module.css";

// Spanish messages for the server-side Booking Rejections.
const REJECTION_MESSAGES: Record<string, string> = {
  PhoneHasOpenAppointment:
    "Ya tenés una cita reservada con este teléfono. Cancelala antes de reservar otra.",
  SlotTaken: "Ese horario acaba de reservarse. Elegí otro.",
  OutsideBookingWindow: "Esa fecha no está disponible para reservar.",
  MissingConsultType: "Elegí el tipo de consulta.",
  MissingPracticeType: "Elegí el tipo de práctica.",
  InvalidCoverageForVisitType:
    "La cobertura no es válida para ese tipo de visita.",
  DepositNotAcknowledged: "Tenés que aceptar la seña para continuar.",
};
const FALLBACK_ERROR = "No se pudo agendar la cita.";

// Identification + Visit Type (with its required sub-type) + coverage + Deposit
// + Availability-driven date/time. The coverage picker shows the accepted
// Health Insurance list plus only the Self-Pay variant for the chosen Visit
// Type. Server-side Rejections are surfaced inline.
export default function AgendarVisitaPage() {
  const router = useRouter();

  const [insurances, setInsurances] = useState<HealthInsurance[]>([]);
  const [pricing, setPricing] = useState<SelfPayPricing | null>(null);
  const [visitType, setVisitType] = useState<VisitType | "">("");
  const [consultType, setConsultType] = useState<ConsultType | "">("");
  const [practiceType, setPracticeType] = useState<PracticeType | "">("");
  const [coverageValue, setCoverageValue] = useState("");
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);

  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data: { days: string[] }) => setDays(data.days))
      .catch(() => setError("No se pudo cargar la disponibilidad."));
    fetch("/api/health-insurances")
      .then((res) => res.json())
      .then((data: { insurances: HealthInsurance[] }) =>
        setInsurances(data.insurances),
      )
      .catch(() => setError("No se pudieron cargar las coberturas."));
    fetch("/api/self-pay-pricing")
      .then((res) => res.json())
      .then((data: { pricing: SelfPayPricing }) => setPricing(data.pricing))
      .catch(() => setError("No se pudo cargar el precio de la seña."));
  }, []);

  useEffect(() => {
    setTime("");
    if (!date) {
      setTimes([]);
      return;
    }
    fetch(`/api/available-times/${date}`)
      .then((res) => res.json())
      .then((data: { times: string[] }) => setTimes(data.times))
      .catch(() => setError("No se pudieron cargar los horarios."));
  }, [date]);

  // Changing the Visit Type resets its sub-type and coverage.
  useEffect(() => {
    setConsultType("");
    setPracticeType("");
    setCoverageValue("");
  }, [visitType]);

  const coverageOptions = useMemo(() => {
    if (!visitType) {
      return [];
    }
    // The Self-Pay option's price is the full price for its Visit Type variant.
    const selfPayPrice = pricing
      ? visitType === "Consultation"
        ? pricing.consultationFullPrice
        : pricing.practiceFullPrice
      : 0;
    return coverageOptionsFor(visitType, insurances, selfPayPrice);
  }, [visitType, insurances, pricing]);

  const selectedCoverage = useMemo(
    () => coverageOptions.find((o) => o.value === coverageValue)?.coverage,
    [coverageOptions, coverageValue],
  );

  const depositAmount = useMemo(() => {
    if (!visitType || !selectedCoverage || !pricing) {
      return null;
    }
    return depositAmountFor(
      {
        visitType,
        consultType: visitType === "Consultation" ? consultType || null : null,
        coverage: selectedCoverage,
      },
      pricing,
    );
  }, [visitType, consultType, selectedCoverage, pricing]);

  // A fresh selection must be acknowledged afresh.
  useEffect(() => {
    setDepositAcknowledged(false);
  }, [visitType, consultType, coverageValue]);

  const canSubmit =
    visitType !== "" &&
    coverageValue !== "" &&
    date !== "" &&
    time !== "" &&
    (visitType === "Consultation" ? consultType !== "" : practiceType !== "") &&
    (depositAmount === null || depositAcknowledged);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const selected = coverageOptions.find((o) => o.value === coverageValue);
    if (!visitType || !selected) {
      setError("Completá el tipo de visita y la cobertura.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const body = {
      patientFirstName: String(data.get("patientFirstName") ?? ""),
      patientLastName: String(data.get("patientLastName") ?? ""),
      patientPhone: String(data.get("patientPhone") ?? ""),
      patientEmail: String(data.get("patientEmail") ?? ""),
      visitType,
      consultType: visitType === "Consultation" ? consultType : null,
      practiceType: visitType === "Practice" ? practiceType : null,
      coverage: selected.coverage,
      depositAcknowledged: depositAmount !== null ? depositAcknowledged : false,
      date,
      time,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          rejection?: string;
        };
        const rejection = data.rejection;
        setError((rejection && REJECTION_MESSAGES[rejection]) || FALLBACK_ERROR);
        // The chosen slot was taken since the form loaded — refresh the list.
        if (rejection === "SlotTaken" && date) {
          fetch(`/api/available-times/${date}`)
            .then((r) => r.json())
            .then((d: { times: string[] }) => setTimes(d.times))
            .catch(() => {});
        }
        setSubmitting(false);
        return;
      }

      const { id } = (await res.json()) as { id: string };
      router.push(`/cita/${id}`);
    } catch {
      setError(FALLBACK_ERROR);
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Agendar una visita</h1>
        <p className={styles.subtitle}>
          Completá tus datos y elegí el día y horario que prefieras.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Card>
          <h2 className={styles.sectionTitle}>Tus datos</h2>
          <div className={styles.grid2}>
            <Field label="Nombre" required>
              <input name="patientFirstName" required />
            </Field>
            <Field label="Apellido" required>
              <input name="patientLastName" required />
            </Field>
            <Field label="Teléfono" required>
              <input name="patientPhone" required />
            </Field>
            <Field label="Email" required>
              <input name="patientEmail" type="email" required />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className={styles.sectionTitle}>Tu visita</h2>
          <div className={styles.fields}>
            <Field label="Tipo de visita" required>
              <select
                required
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as VisitType)}
              >
                <option value="">Elegí…</option>
                {VISIT_TYPES.map((vt) => (
                  <option key={vt} value={vt}>
                    {VISIT_TYPE_LABELS[vt]}
                  </option>
                ))}
              </select>
            </Field>

            {visitType === "Consultation" ? (
              <Field label="Tipo de consulta" required>
                <select
                  required
                  value={consultType}
                  onChange={(e) => setConsultType(e.target.value as ConsultType)}
                >
                  <option value="">Elegí…</option>
                  {CONSULT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {CONSULT_TYPE_LABELS[ct]}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            {visitType === "Practice" ? (
              <Field label="Tipo de práctica" required>
                <select
                  required
                  value={practiceType}
                  onChange={(e) =>
                    setPracticeType(e.target.value as PracticeType)
                  }
                >
                  <option value="">Elegí…</option>
                  {PRACTICE_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {PRACTICE_TYPE_LABELS[pt]}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            <Field label="Cobertura" required>
              <select
                required
                value={coverageValue}
                disabled={!visitType}
                onChange={(e) => setCoverageValue(e.target.value)}
              >
                <option value="">
                  {visitType ? "Elegí…" : "Elegí un tipo de visita primero"}
                </option>
                {coverageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.price > 0
                      ? `${option.label} (${formatPesos(option.price)})`
                      : option.label}
                  </option>
                ))}
              </select>
            </Field>

            {depositAmount !== null ? (
              <Alert variant="info" className={styles.deposit}>
                <p className={styles.depositAmount}>
                  Seña requerida: <strong>{formatPesos(depositAmount)}</strong>
                </p>
                <label className={styles.depositAck}>
                  <input
                    type="checkbox"
                    required
                    checked={depositAcknowledged}
                    onChange={(e) => setDepositAcknowledged(e.target.checked)}
                  />
                  <span>
                    Acepto abonar la seña (el pago se coordina fuera de la
                    plataforma).
                  </span>
                </label>
              </Alert>
            ) : null}
          </div>
        </Card>

        <Card>
          <h2 className={styles.sectionTitle}>Fecha y hora</h2>
          <div className={styles.grid2}>
            <Field label="Fecha" required>
              <select
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              >
                <option value="">Elegí una fecha…</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {formatDateAR(day)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Hora" required>
              <select
                required
                value={time}
                disabled={!date || times.length === 0}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">
                  {date ? "Elegí un horario…" : "Elegí una fecha primero"}
                </option>
                {times.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <div className={styles.actions}>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <Button
            type="submit"
            busy={submitting}
            disabled={!canSubmit}
            className={styles.submit}
          >
            {submitting ? "Agendando…" : "Agendar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
