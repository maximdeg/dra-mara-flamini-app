import type { Appointment } from "@/lib/appointments/appointment";
import type { DerivedStatus } from "@/lib/appointments/status";
import type { ClinicInfo } from "@/lib/clinic/clinic-info";
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
 * shows for every Status. All copy comes from the persisted, Professional-
 * editable `clinicInfo`.
 */
export function AppointmentInfo({
  appointment,
  status,
  clinicInfo,
}: {
  appointment: Appointment;
  status: DerivedStatus;
  clinicInfo: ClinicInfo;
}) {
  const isScheduled = status === "scheduled";
  const { arrival, documentation, cancellation, contact, senaTransfer } =
    clinicInfo;

  return (
    <div className={styles.sections}>
      {isScheduled && appointment.deposit && (
        <Callout
          tone="warning"
          icon={<InfoIcon />}
          title={`${senaTransfer.title}: ${formatPesos(appointment.deposit.amount)}`}
        >
          <p>{senaTransfer.intro}</p>
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

          <Callout tone="info" icon={<ClockIcon />} title={arrival.title}>
            <p>{arrival.body}</p>
          </Callout>

          <Callout
            tone="warning"
            icon={<FileTextIcon />}
            title={documentation.title}
          >
            <ul className={styles.list}>
              {documentation.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Callout>

          <Callout
            tone="danger"
            icon={<AlertTriangleIcon />}
            title={cancellation.title}
          >
            <p>{cancellation.body}</p>
          </Callout>
        </section>
      )}

      <Callout tone="success" icon={<PhoneIcon />} title={contact.title}>
        <p>{contact.intro}</p>
        <ul className={styles.contacts}>
          {contact.contacts.map((entry) => (
            <li key={entry.name} className={styles.contactRow}>
              <span>{entry.name}</span>
              <span>{entry.phone}</span>
            </li>
          ))}
        </ul>
      </Callout>
    </div>
  );
}
