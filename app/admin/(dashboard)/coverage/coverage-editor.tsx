"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  addInsurance,
  editInsurance,
  removeInsurance,
  type HealthInsurance,
} from "@/lib/coverage/coverage";
import type { SelfPayPricing } from "@/lib/deposit/deposit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  addInsuranceAction,
  editInsuranceAction,
  removeInsuranceAction,
  saveSelfPayPricingAction,
  type InsuranceInput,
} from "./actions";
import styles from "./coverage-editor.module.css";

function toPrice(value: FormDataEntryValue | null): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function readInsurance(form: HTMLFormElement): InsuranceInput {
  const data = new FormData(form);
  return {
    name: String(data.get("name") ?? "").trim(),
    price: toPrice(data.get("price")),
    notes: String(data.get("notes") ?? "").trim(),
  };
}

export function CoverageEditor({
  initialInsurances,
  initialPricing,
}: {
  initialInsurances: HealthInsurance[];
  initialPricing: SelfPayPricing;
}) {
  const toast = useToast();
  const [insurances, setInsurances] = useState(initialInsurances);
  const [pricing, setPricing] = useState(initialPricing);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function savePricing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: SelfPayPricing = {
      consultationFullPrice: toPrice(data.get("consultationFullPrice")),
      practiceFullPrice: toPrice(data.get("practiceFullPrice")),
      firstVisitConsultationDeposit: toPrice(
        data.get("firstVisitConsultationDeposit"),
      ),
    };
    startTransition(async () => {
      await saveSelfPayPricingAction(next);
      setPricing(next);
      toast.success("Precios guardados.");
    });
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = readInsurance(form);
    if (!input.name) return;
    startTransition(async () => {
      await addInsuranceAction(input);
      setInsurances((list) => addInsurance(list, input));
      toast.success("Obra social agregada.");
      form.reset();
    });
  }

  function saveEdit(originalName: string, input: InsuranceInput) {
    if (!input.name) return;
    startTransition(async () => {
      await editInsuranceAction(originalName, input);
      setInsurances((list) => editInsurance(list, originalName, input));
      toast.success("Obra social actualizada.");
    });
  }

  function confirmDelete() {
    const name = toDelete;
    if (!name) return;
    startTransition(async () => {
      await removeInsuranceAction(name);
      setInsurances((list) => removeInsurance(list, name));
      setToDelete(null);
      toast.success("Obra social eliminada.");
    });
  }

  return (
    <div className={styles.editor}>
      <Card>
        <h2 className={styles.sectionTitle}>Particular (Self-Pay)</h2>
        <p className={styles.note}>
          Las dos variantes Particular son fijas: no se pueden renombrar ni
          eliminar, solo se editan sus precios.
        </p>
        <form onSubmit={savePricing} className={styles.pricingForm}>
          <Field label="Particular (Consulta) — precio">
            <input
              type="number"
              name="consultationFullPrice"
              min={0}
              defaultValue={pricing.consultationFullPrice}
            />
          </Field>
          <Field label="Practica Particular — precio (también es la seña)">
            <input
              type="number"
              name="practiceFullPrice"
              min={0}
              defaultValue={pricing.practiceFullPrice}
            />
          </Field>
          <Field label="Seña de primera consulta Particular">
            <input
              type="number"
              name="firstVisitConsultationDeposit"
              min={0}
              defaultValue={pricing.firstVisitConsultationDeposit}
            />
          </Field>
          <Button type="submit" busy={pending} className={styles.pricingSave}>
            Guardar precios
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className={styles.sectionTitle}>Obras sociales</h2>
        {insurances.length === 0 ? (
          <p className={styles.note}>No hay obras sociales cargadas.</p>
        ) : (
          <ul className={styles.list}>
            {insurances.map((insurance) => (
              <InsuranceRow
                key={insurance.name}
                insurance={insurance}
                pending={pending}
                onSave={saveEdit}
                onRequestDelete={setToDelete}
              />
            ))}
          </ul>
        )}

        <div className={styles.addBlock}>
          <h3 className={styles.addTitle}>Agregar obra social</h3>
          <form onSubmit={add} className={styles.row}>
            <Field label="Nombre" required className={styles.grow}>
              <input name="name" required />
            </Field>
            <Field label="Precio">
              <input type="number" name="price" min={0} defaultValue={0} />
            </Field>
            <Field label="Notas" className={styles.grow}>
              <input name="notes" />
            </Field>
            <Button type="submit" busy={pending} className={styles.rowSubmit}>
              Agregar
            </Button>
          </form>
        </div>
      </Card>

      <Dialog
        open={toDelete !== null}
        onClose={() => {
          if (!pending) setToDelete(null);
        }}
        title="¿Eliminar la obra social?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setToDelete(null)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button variant="destructive" busy={pending} onClick={confirmDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p>
          Se va a eliminar “{toDelete}”. Los pacientes ya no la verán como opción
          de cobertura.
        </p>
      </Dialog>
    </div>
  );
}

function InsuranceRow({
  insurance,
  pending,
  onSave,
  onRequestDelete,
}: {
  insurance: HealthInsurance;
  pending: boolean;
  onSave: (originalName: string, input: InsuranceInput) => void;
  onRequestDelete: (name: string) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(insurance.name, readInsurance(event.currentTarget));
  }

  return (
    <li className={styles.item}>
      <form onSubmit={handleSubmit} className={styles.row}>
        <Field label="Nombre" required className={styles.grow}>
          <input name="name" defaultValue={insurance.name} required />
        </Field>
        <Field label="Precio">
          <input
            type="number"
            name="price"
            min={0}
            defaultValue={insurance.price}
          />
        </Field>
        <Field label="Notas" className={styles.grow}>
          <input name="notes" defaultValue={insurance.notes} />
        </Field>
        <div className={styles.rowActions}>
          <Button type="submit" disabled={pending}>
            Guardar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onRequestDelete(insurance.name)}
            disabled={pending}
          >
            Quitar
          </Button>
        </div>
      </form>
    </li>
  );
}
