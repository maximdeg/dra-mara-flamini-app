import type { Appointment } from "@/lib/appointments/appointment";
import type { DerivedStatus } from "@/lib/appointments/status";
import { CLINIC_INFO } from "@/lib/clinic/clinic-info";
import { formatPesos } from "@/lib/deposit/deposit";
import { Callout } from "@/components/ui/callout";
import {
  AlertTriangleIcon,
  ClockIcon,
  FileTextIcon,
  InfoIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import styles from "./appointment-info.module.css";

/**
 * The "what to do next" information on the confirmation page. The preparation
 * callouts (arrival, documentation, cancellation policy) and the seña transfer
 * box are shown only while the Appointment is Scheduled; the clinic contact
 * shows for every Status. All copy comes from the single clinic-info constant.
 */
export function AppointmentInfo({
  appointment,
  status,
}: {
  appointment: Appointment;
  status: DerivedStatus;
}) {
  const isScheduled = status === "scheduled";
  const { contacts, senaTransfer, arrivalLeadMinutes, documentation } =
    CLINIC_INFO;

  return (
    <div className={styles.sections}>
      {isScheduled && appointment.deposit && (
        <Callout
          tone="warning"
          icon={<InfoIcon />}
          title={`Seña: ${formatPesos(appointment.deposit.amount)}`}
        >
          <p>
            Para dejar la seña reservada, transferí el monto a los siguientes
            datos. La transferencia se realiza por fuera de la plataforma.
          </p>
          <dl className={styles.transfer}>
            <div className={styles.transferRow}>
              <dt>Alias</dt>
              <dd>{senaTransfer.alias}</dd>
            </div>
            <div className={styles.transferRow}>
              <dt>CBU</dt>
              <dd>{senaTransfer.cbu}</dd>
            </div>
          </dl>
        </Callout>
      )}

      {isScheduled && (
        <section className={styles.important}>
          <h2 className={styles.importantTitle}>Información importante</h2>

          <Callout
            tone="info"
            icon={<ClockIcon />}
            title={`Llegá ${arrivalLeadMinutes} minutos antes`}
          >
            <p>Para completar la documentación necesaria.</p>
          </Callout>

          <Callout
            tone="warning"
            icon={<FileTextIcon />}
            title="Documentación requerida"
          >
            <ul className={styles.list}>
              {documentation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Callout>

          <Callout
            tone="danger"
            icon={<AlertTriangleIcon />}
            title="Cancelación"
          >
            <p>
              Si necesitás cancelar, hacelo con al menos 24 horas de
              anticipación. Tené en cuenta que otro paciente puede necesitar ese
              turno y el tiempo del profesional.
            </p>
          </Callout>
        </section>
      )}

      <Callout tone="success" icon={<PhoneIcon />} title="Contacto">
        <p>
          Ante cualquier inconveniente o duda con tu turno, escribinos por
          WhatsApp:
        </p>
        <ul className={styles.contacts}>
          {contacts.map((contact) => (
            <li key={contact.name} className={styles.contactRow}>
              <span>{contact.name}</span>
              <span>{contact.phone}</span>
            </li>
          ))}
        </ul>
      </Callout>
    </div>
  );
}
