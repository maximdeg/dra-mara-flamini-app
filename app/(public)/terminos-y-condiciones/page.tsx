import type { Metadata } from "next";
import { Callout } from "@/components/ui/callout";
import { ContactCard, LegalPage, LegalSection } from "../_components/legal";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos que regulan el servicio de confirmación de turnos dermatológicos vía WhatsApp.",
};

export default function TerminosYCondicionesPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      lead="Servicio de confirmación de turnos dermatológicos vía WhatsApp"
      meta={[
        { label: "Última actualización", value: "Julio 2026" },
        { label: "Jurisdicción", value: "República Argentina" },
        { label: "Aceptación", value: "Al agendar un turno" },
      ]}
    >
      <LegalSection number={1} title="Introducción y aceptación">
        <p>
          Estos Términos y Condiciones regulan el acceso y uso del servicio de
          confirmación automática de turnos dermatológicos mediante mensajería
          WhatsApp, operado por{" "}
          <strong> Dra. Mara Flamini Prida</strong>.
        </p>
        <p>
          Al proporcionar tu número de teléfono al momento de agendar un turno y
          recibir un mensaje de confirmación a través de WhatsApp, aceptás estos
          términos en su totalidad. Si no estás de acuerdo con alguno de ellos,
          no deberás proporcionar tu número ni utilizar este servicio.
        </p>
        <Callout title="Lectura recomendada">
          <p>
            Te recomendamos leer este documento junto con nuestra Política de
            Privacidad, que explica cómo tratamos tus datos personales de acuerdo
            con la Ley 25.326.
          </p>
        </Callout>
      </LegalSection>

      <LegalSection number={2} title="Descripción del servicio">
        <p>
          El Consultorio ofrece un sistema automatizado de confirmación de turnos
          que opera del siguiente modo:
        </p>
        <ul>
          <li>
            <strong>Agendamiento del turno</strong> el paciente o su
            representante agenda una consulta dermatológica y proporciona su
            número de WhatsApp.
          </li>
          <li>
            <strong>Envío del recordatorio</strong> el sistema envía
            automáticamente un mensaje de WhatsApp con la fecha, hora y ubicación
            de la consulta.
          </li>
          <li>
            <strong>Respuesta del paciente</strong> el paciente puede confirmar,
            cancelar o solicitar una reprogramación respondiendo al mensaje.
          </li>
          <li>
            <strong>Actualización de la agenda</strong> el Consultorio procesa la
            respuesta y actualiza la agenda médica según corresponda.
          </li>
        </ul>
        <p>
          Este servicio es exclusivamente de naturaleza administrativa.{" "}
          <strong>No constituye ni reemplaza la consulta médica</strong> ni
          implica ninguna relación de prestación de servicios de salud a través
          del canal de mensajería.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Condiciones de uso">
        <p>Al utilizar este servicio, el paciente se compromete a:</p>
        <ul>
          <li>
            Proporcionar un{" "}
            <strong>número de WhatsApp válido y activo</strong> al que tenga
            acceso personal.
          </li>
          <li>
            Responder al mensaje de confirmación con <strong>veracidad</strong>{" "}
            respecto a su intención de asistir, cancelar o reprogramar el turno.
          </li>
          <li>
            Comunicar la cancelación o reprogramación con un mínimo de{" "}
            <strong>24 horas de anticipación</strong> al turno pactado.
          </li>
          <li>
            No utilizar el canal de mensajería para{" "}
            <strong>consultas médicas</strong>, solicitud de diagnósticos,
            recetas o cualquier otro fin clínico.
          </li>
          <li>
            No compartir el número de contacto del servicio con terceros para
            fines distintos a la gestión de turnos.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        number={4}
        title="Consentimiento para recibir mensajes de WhatsApp"
      >
        <p>
          Al proporcionar tu número de teléfono celular al Consultorio, otorgás
          expresamente tu consentimiento para recibir mensajes de WhatsApp
          relacionados con la gestión de tus turnos. Este consentimiento incluye:
        </p>
        <ul>
          <li>
            Mensajes de <strong>confirmación</strong> previos a la consulta
            programada.
          </li>
          <li>
            Mensajes de <strong>recordatorio</strong> con antelación a la fecha
            del turno.
          </li>
          <li>
            Mensajes de <strong>seguimiento</strong> para reagendar turnos
            cancelados o ausencias.
          </li>
        </ul>
        <Callout title="Podés darte de baja en cualquier momento">
          <p>
            Si no deseás seguir recibiendo mensajes de WhatsApp, podés solicitarlo
            respondiendo "BAJA" a cualquier mensaje nuestro o contactándote
            directamente con el consultorio. Tu solicitud será procesada dentro de
            las 48 horas hábiles.
          </p>
        </Callout>
      </LegalSection>

      <LegalSection number={5} title="Uso de WhatsApp Business API y Meta">
        <p>
          El servicio opera mediante la{" "}
          <strong>WhatsApp Business API</strong> de Meta Platforms, Inc. Al
          recibir mensajes a través de este canal, el uso de la plataforma también
          queda sujeto a los{" "}
          <a
            href="https://www.whatsapp.com/legal/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
          >
            Términos de Servicio de WhatsApp
          </a>{" "}
          y a las políticas de Meta.
        </p>
        <p>
          El Consultorio no tiene control sobre el funcionamiento de la plataforma
          de WhatsApp ni puede garantizar la entrega de mensajes en caso de fallas
          técnicas del servicio de Meta, problemas de conectividad del dispositivo
          del paciente u otros factores ajenos al Consultorio.
        </p>
        <Callout tone="warning" title="Importante: no es un canal de urgencias">
          <p>
            WhatsApp no debe utilizarse para comunicar emergencias médicas. Ante
            cualquier urgencia, comunicate con el SAME (107) o dirigite a la
            guardia del hospital más cercano.
          </p>
        </Callout>
      </LegalSection>

      <LegalSection
        number={6}
        title="Cancelaciones, ausencias e incumplimientos"
      >
        <p>La gestión de turnos se rige por las siguientes condiciones:</p>
        <ul>
          <li>
            <strong>Cancelación con aviso previo:</strong> el paciente puede
            cancelar o reprogramar su turno hasta <strong>24 horas antes</strong>{" "}
            sin cargo alguno respondiendo al mensaje o llamando al consultorio.
          </li>
          <li>
            <strong>Ausencia sin aviso (inasistencia):</strong> la inasistencia
            reiterada sin comunicación previa podrá resultar en la suspensión
            temporal del servicio de agendamiento para el paciente.
          </li>
          <li>
            <strong>Confirmación sin asistencia:</strong> confirmar el turno y no
            asistir sin aviso previo puede afectar la prioridad en la asignación
            de futuros turnos.
          </li>
        </ul>
        <p>
          El Consultorio se reserva el derecho de modificar o cancelar un turno
          por razones de fuerza mayor, ausencia imprevista del profesional u otras
          circunstancias excepcionales, notificando al paciente con la mayor
          anticipación posible.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Limitación de responsabilidad">
        <p>El Consultorio no será responsable por:</p>
        <ul>
          <li>
            Fallas en la entrega de mensajes de WhatsApp por causas ajenas al
            Consultorio, incluyendo problemas técnicos de Meta Platforms, falta de
            conexión a internet o número de teléfono dado de baja.
          </li>
          <li>
            Daños derivados del incumplimiento por parte del paciente de estos
            Términos y Condiciones.
          </li>
          <li>
            Interpretaciones erróneas del contenido de los mensajes de
            confirmación por parte del paciente.
          </li>
          <li>
            Consecuencias derivadas de información incorrecta proporcionada por el
            paciente al momento de agendar el turno.
          </li>
        </ul>
        <p>
          La responsabilidad máxima del Consultorio en relación con el uso de este
          servicio se limita a la gestión administrativa del turno y no abarca
          ningún tipo de daño indirecto, incidental o consecuente.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Propiedad intelectual">
        <p>
          El contenido de los mensajes enviados por el Consultorio, incluyendo los
          textos, plantillas y diseño del servicio, son de propiedad exclusiva del
          Consultorio o de sus licenciantes y están protegidos por las leyes de
          propiedad intelectual vigentes en la República Argentina.
        </p>
        <p>
          Queda prohibida la reproducción, distribución o modificación de dicho
          contenido sin autorización expresa y por escrito del Consultorio.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Menores de edad">
        <p>
          En caso de que el turno pertenezca a un menor de edad, el padre, madre o
          tutor legal deberá proporcionar su propio número de WhatsApp para
          recibir la confirmación y aceptar estos Términos y Condiciones en
          representación del menor.
        </p>
        <p>
          El padre, madre o tutor legal será responsable de la asistencia del
          menor y del cumplimiento de las condiciones establecidas en este
          documento.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Modificaciones a los términos">
        <p>
          El Consultorio se reserva el derecho de modificar estos Términos y
          Condiciones en cualquier momento. Los cambios serán comunicados con
          anticipación razonable a través de la página web del Consultorio y/o
          mediante un mensaje informativo a los pacientes activos.
        </p>
        <p>
          El uso continuado del servicio de confirmación de turnos luego de la
          comunicación de cambios implicará la aceptación de los nuevos términos.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Ley aplicable y jurisdicción">
        <p>
          Estos Términos y Condiciones se rigen por las leyes de la{" "}
          <strong>República Argentina</strong>, incluyendo pero no limitado a:
        </p>
        <ul>
          <li>
            <strong>Ley 25.326</strong> de Protección de Datos Personales.
          </li>
          <li>
            <strong>Ley 24.240</strong> de Defensa del Consumidor y sus
            modificaciones.
          </li>
          <li>
            <strong>Ley 17.132</strong> y normativa del Ministerio de Salud
            aplicable al ejercicio de la medicina.
          </li>
          <li>
            <strong>Código Civil y Comercial de la Nación</strong> en lo que
            resulte aplicable.
          </li>
        </ul>
        <p>
          Cualquier controversia que pudiera surgir en relación con estos términos
          será sometida a la jurisdicción de los tribunales ordinarios de la
          Ciudad de <strong>[ciudad]</strong>, República Argentina, con renuncia
          expresa a cualquier otro fuero que pudiera corresponder.
        </p>
      </LegalSection>

      <ContactCard
        title="Consultas sobre estos términos"
        intro="Si tenés preguntas sobre estos Términos y Condiciones o sobre el funcionamiento del servicio, podés comunicarte con nosotros:"
      >
        <li>
          📧 <strong>Email:</strong>{" "}
          <a href="dramaraflamini@gmail.com">
            dramaraflamini@gmail.com
          </a>
        </li>
        <li>
          📍 <strong>Domicilio:</strong> Santiago Derqui 2617, Santa Fe Capital, Santa Fe, Argentina
        </li>
        <li>
          📞 <strong>Teléfono:</strong> +5491134286716
        </li>

      </ContactCard>
    </LegalPage>
  );
}
