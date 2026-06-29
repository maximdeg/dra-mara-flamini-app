"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { ClinicInfo } from "@/lib/clinic/clinic-info";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { saveClinicInfoAction } from "./actions";
import styles from "./clinic-info-editor.module.css";

/**
 * Edits the persisted confirmation-page copy. All boxes are edited together and
 * saved in one go; the documentation list and contacts support add/remove. Edit
 * state is local until saved, then handed to the server action (which is the
 * trust boundary — it sanitizes the input).
 */
export function ClinicInfoEditor({ initialInfo }: { initialInfo: ClinicInfo }) {
  const toast = useToast();
  const [info, setInfo] = useState(initialInfo);
  const [pending, startTransition] = useTransition();

  const { arrival, documentation, cancellation, contact, senaTransfer } = info;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await saveClinicInfoAction(info);
      toast.success("Información guardada.");
    });
  }

  function patch(next: Partial<ClinicInfo>) {
    setInfo((current) => ({ ...current, ...next }));
  }

  function setItem(index: number, value: string) {
    patch({
      documentation: {
        ...documentation,
        items: documentation.items.map((item, n) => (n === index ? value : item)),
      },
    });
  }

  function setContact(index: number, value: Partial<ClinicInfo["contact"]["contacts"][number]>) {
    patch({
      contact: {
        ...contact,
        contacts: contact.contacts.map((entry, n) =>
          n === index ? { ...entry, ...value } : entry,
        ),
      },
    });
  }

  return (
    <form className={styles.editor} onSubmit={save}>
      <Card>
        <h2 className={styles.sectionTitle}>Llegada</h2>
        <p className={styles.note}>
          La antelación (por ej. “15 minutos”) es parte del título.
        </p>
        <div className={styles.fields}>
          <Field label="Título de la llegada">
            <input
              value={arrival.title}
              onChange={(e) => patch({ arrival: { ...arrival, title: e.target.value } })}
            />
          </Field>
          <Field label="Nota de la llegada">
            <textarea
              rows={2}
              value={arrival.body}
              onChange={(e) => patch({ arrival: { ...arrival, body: e.target.value } })}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className={styles.sectionTitle}>Documentación requerida</h2>
        <div className={styles.fields}>
          <Field label="Título de la documentación">
            <input
              value={documentation.title}
              onChange={(e) =>
                patch({ documentation: { ...documentation, title: e.target.value } })
              }
            />
          </Field>
          <ul className={styles.list}>
            {documentation.items.map((item, index) => (
              <li key={index} className={styles.listRow}>
                <Field label={`Documento ${index + 1}`} className={styles.grow}>
                  <input value={item} onChange={(e) => setItem(index, e.target.value)} />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    patch({
                      documentation: {
                        ...documentation,
                        items: documentation.items.filter((_, n) => n !== index),
                      },
                    })
                  }
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="ghost"
            className={styles.addBtn}
            disabled={pending}
            onClick={() =>
              patch({ documentation: { ...documentation, items: [...documentation.items, ""] } })
            }
          >
            Agregar documento
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className={styles.sectionTitle}>Cancelación</h2>
        <div className={styles.fields}>
          <Field label="Título de la cancelación">
            <input
              value={cancellation.title}
              onChange={(e) =>
                patch({ cancellation: { ...cancellation, title: e.target.value } })
              }
            />
          </Field>
          <Field label="Política de cancelación">
            <textarea
              rows={3}
              value={cancellation.body}
              onChange={(e) =>
                patch({ cancellation: { ...cancellation, body: e.target.value } })
              }
            />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className={styles.sectionTitle}>Contacto</h2>
        <div className={styles.fields}>
          <Field label="Título del contacto">
            <input
              value={contact.title}
              onChange={(e) => patch({ contact: { ...contact, title: e.target.value } })}
            />
          </Field>
          <Field label="Introducción del contacto">
            <textarea
              rows={2}
              value={contact.intro}
              onChange={(e) => patch({ contact: { ...contact, intro: e.target.value } })}
            />
          </Field>
          <ul className={styles.list}>
            {contact.contacts.map((entry, index) => (
              <li key={index} className={styles.listRow}>
                <Field label="Nombre" className={styles.grow}>
                  <input
                    value={entry.name}
                    onChange={(e) => setContact(index, { name: e.target.value })}
                  />
                </Field>
                <Field label="Teléfono" className={styles.grow}>
                  <input
                    value={entry.phone}
                    onChange={(e) => setContact(index, { phone: e.target.value })}
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    patch({
                      contact: {
                        ...contact,
                        contacts: contact.contacts.filter((_, n) => n !== index),
                      },
                    })
                  }
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="ghost"
            className={styles.addBtn}
            disabled={pending}
            onClick={() =>
              patch({
                contact: { ...contact, contacts: [...contact.contacts, { name: "", phone: "" }] },
              })
            }
          >
            Agregar contacto
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className={styles.sectionTitle}>Seña (transferencia)</h2>
        <p className={styles.note}>
          El monto se muestra automáticamente según el turno; acá editás el resto.
        </p>
        <div className={styles.fields}>
          <Field label="Título de la seña">
            <input
              value={senaTransfer.title}
              onChange={(e) =>
                patch({ senaTransfer: { ...senaTransfer, title: e.target.value } })
              }
            />
          </Field>
          <Field label="Introducción de la seña">
            <textarea
              rows={2}
              value={senaTransfer.intro}
              onChange={(e) =>
                patch({ senaTransfer: { ...senaTransfer, intro: e.target.value } })
              }
            />
          </Field>
          <Field label="Alias">
            <input
              value={senaTransfer.alias}
              onChange={(e) =>
                patch({ senaTransfer: { ...senaTransfer, alias: e.target.value } })
              }
            />
          </Field>
          <Field label="CBU">
            <input
              value={senaTransfer.cbu}
              onChange={(e) =>
                patch({ senaTransfer: { ...senaTransfer, cbu: e.target.value } })
              }
            />
          </Field>
        </div>
      </Card>

      <Button type="submit" busy={pending} className={styles.save}>
        Guardar cambios
      </Button>
    </form>
  );
}
