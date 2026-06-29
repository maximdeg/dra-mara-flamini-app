import { notFound } from "next/navigation";
import { patientCanCancel } from "@/lib/appointments/cancellation";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { statusOf } from "@/lib/appointments/status";
import { getClinicInfoRepository } from "@/lib/clinic/get-clinic-info-repository";
import { AppointmentActions } from "./appointment-actions";
import { AppointmentDetails } from "./appointment-details";
import { AppointmentInfo } from "./appointment-info";
import { CancelAppointment } from "./cancel-appointment";
import styles from "./page.module.css";

// Rendered on demand: it reads an Appointment from the database by id.
export const dynamic = "force-dynamic";

export default async function CitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repository = await getAppointmentRepository();
  // The Appointment and the (editable) clinic copy are independent reads.
  const [appointment, clinicInfo] = await Promise.all([
    repository.findById(id),
    getClinicInfoRepository().then((r) => r.get()),
  ]);
  if (!appointment) {
    notFound();
  }

  const now = new Date();
  const status = statusOf(appointment, now);

  return (
    <div className={styles.page}>
      <AppointmentDetails appointment={appointment} status={status} />
      <AppointmentInfo
        appointment={appointment}
        status={status}
        clinicInfo={clinicInfo}
      />
      <CancelAppointment
        appointmentId={appointment.id}
        isScheduled={status === "scheduled"}
        withinWindow={patientCanCancel(appointment, now)}
      />
      <AppointmentActions />
    </div>
  );
}
