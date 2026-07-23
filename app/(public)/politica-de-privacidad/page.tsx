import type { Metadata } from "next";
import { Callout } from "@/components/ui/callout";
import {
  ContactCard,
  LegalPage,
  LegalSection,
  RightCard,
  RightsGrid,
} from "../_components/legal";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo tratamos tus datos personales en el servicio de confirmación de turnos vía WhatsApp, conforme a la Ley 25.326.",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      lead="Servicio de confirmación de turnos dermatológicos vía WhatsApp"
      meta={[
        { label: "Última actualización", value: "Julio 2026" },
        { label: "Marco legal", value: "Ley 25.326 Argentina" },
        { label: "Responsable", value: "[Completar con tus datos]" },
      ]}
    >
      <LegalSection number={1} title="Quiénes somos">
        <p>
          <strong>[Nombre del consultorio / profesional]</strong>, con domicilio
          en <strong>[dirección]</strong>, CUIT/CUIL <strong>[número]</strong>,
          es el responsable del tratamiento de los datos personales recolectados
          a través de nuestro servicio de confirmación de turnos dermatológicos
          mediante WhatsApp.
        </p>
        <p>
          Esta Política de Privacidad describe qué datos recopilamos, por qué los
          recopilamos, cómo los usamos y cuáles son tus derechos sobre ellos, en
          cumplimiento de la{" "}
          <strong>
            Ley 25.326 de Protección de Datos Personales
          </strong>{" "}
          de la República Argentina y su decreto reglamentario.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Qué datos recopilamos">
        <p>
          Para operar el servicio de confirmación de turnos, recopilamos
          únicamente los datos estrictamente necesarios:
        </p>
        <ul>
          <li>
            <strong>Nombre y apellido</strong> para identificarte como paciente.
          </li>
          <li>
            <strong>Número de teléfono (WhatsApp)</strong> para enviarte el
            mensaje de confirmación de turno.
          </li>
          <li>
            <strong>Fecha y hora del turno</strong> para incluirla en el mensaje
            de confirmación.
          </li>
          <li>
            <strong>Confirmación o cancelación del turno</strong> respuesta que
            nos envías a través de WhatsApp.
          </li>
        </ul>
        <Callout title="No recopilamos datos sensibles">
          <p>
            No recopilamos diagnósticos, historial clínico, resultados de
            estudios ni ningún otro dato de salud a través de este canal de
            mensajería.
          </p>
        </Callout>
      </LegalSection>

      <LegalSection number={3} title="Para qué usamos tus datos">
        <p>Tus datos se utilizan exclusivamente para los siguientes fines:</p>
        <ul>
          <li>
            <strong>Confirmación de turno</strong> enviarte un mensaje de
            WhatsApp recordando y confirmando la fecha, hora y lugar de tu
            consulta dermatológica.
          </li>
          <li>
            <strong>Gestión de cancelaciones o reprogramaciones</strong> procesar
            tu respuesta si confirmás, cancelás o solicitás un cambio de turno.
          </li>
          <li>
            <strong>Coordinación interna</strong> actualizar la agenda del
            consultorio según las respuestas recibidas.
          </li>
        </ul>
        <p>
          No utilizamos tus datos para fines de marketing, publicidad, ni los
          compartimos con terceros para fines comerciales.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Base legal del tratamiento">
        <p>
          El tratamiento de tus datos personales se realiza sobre la base de tu{" "}
          <strong>consentimiento explícito</strong>, otorgado al momento de
          agendar tu turno y proporcionar tu número de WhatsApp para recibir la
          confirmación.
        </p>
        <p>
          Podés revocar tu consentimiento en cualquier momento comunicándote con
          nosotros a través de los datos de contacto indicados al final de esta
          política. La revocación no afectará la validez del tratamiento
          realizado antes de tu solicitud.
        </p>
      </LegalSection>

      <LegalSection
        number={5}
        title="Uso de WhatsApp como canal de comunicación"
      >
        <p>
          Nuestro servicio utiliza la <strong>WhatsApp Business API</strong> de
          Meta Platforms, Inc. para el envío de mensajes. Al recibir mensajes de
          confirmación de turno a través de WhatsApp, tus datos también quedan
          sujetos a la{" "}
          <a
            href="https://www.whatsapp.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidad de WhatsApp
          </a>
          .
        </p>
        <p>
          Los mensajes se envían únicamente a los números que nos hayas
          proporcionado voluntariamente al registrar tu turno. No iniciamos
          conversaciones con personas que no hayan agendado una consulta.
        </p>
        <Callout title="Mensajes de plantilla aprobados">
          <p>
            Los mensajes de confirmación son plantillas previamente aprobadas por
            Meta. Solo recibirás mensajes relacionados con tu turno, nunca
            publicidad u otros contenidos no solicitados.
          </p>
        </Callout>
      </LegalSection>

      <LegalSection number={6} title="Compartición de datos con terceros">
        <p>Tus datos personales pueden ser compartidos únicamente con:</p>
        <ul>
          <li>
            <strong>Meta Platforms (WhatsApp)</strong> como proveedor de
            infraestructura de mensajería, en la medida necesaria para el envío
            del mensaje.
          </li>
          <li>
            <strong>Proveedor de servicios tecnológicos</strong> el sistema o
            aplicación web que gestiona el envío automatizado de los mensajes,
            sujeto a acuerdos de confidencialidad.
          </li>
        </ul>
        <p>
          No vendemos, alquilamos ni cedemos tus datos personales a terceros bajo
          ninguna circunstancia. Solo podremos divulgarlos si existiera una
          obligación legal o requerimiento judicial que nos lo exija.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Almacenamiento y retención de datos">
        <p>
          Los datos recopilados se almacenan en servidores con medidas de
          seguridad adecuadas. Conservamos tus datos de contacto por un período
          de <strong>hasta 2 (dos) años</strong> desde tu última consulta, o el
          plazo que establezca la normativa aplicable a la conservación de
          registros de atención médica en Argentina.
        </p>
        <p>
          Una vez cumplido dicho plazo, los datos son eliminados o anonimizados
          de forma segura.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Tus derechos como titular de datos">
        <p>
          De acuerdo con la Ley 25.326, tenés los siguientes derechos sobre tus
          datos personales:
        </p>
        <RightsGrid>
          <RightCard icon="🔍" title="Acceso">
            Conocer qué datos tenemos sobre vos y cómo los usamos.
          </RightCard>
          <RightCard icon="✏️" title="Rectificación">
            Corregir datos inexactos o incompletos.
          </RightCard>
          <RightCard icon="🗑️" title="Supresión">
            Solicitar la eliminación de tus datos personales.
          </RightCard>
          <RightCard icon="🚫" title="Oposición">
            Oponerte al tratamiento de tus datos en cualquier momento.
          </RightCard>
          <RightCard icon="📦" title="Portabilidad">
            Recibir tus datos en un formato legible y estructurado.
          </RightCard>
          <RightCard icon="↩️" title="Revocación">
            Retirar tu consentimiento sin que eso te perjudique.
          </RightCard>
        </RightsGrid>
        <p>
          Para ejercer cualquiera de estos derechos, comunicate con nosotros a
          través de los medios indicados en la sección de Contacto. Responderemos
          dentro de los <strong>10 días hábiles</strong> conforme a lo
          establecido por la ley.
        </p>
        <Callout title="Autoridad de Aplicación">
          <p>
            Si considerás que tus derechos no fueron correctamente atendidos,
            podés presentar una reclamación ante la{" "}
            <strong>
              Agencia de Acceso a la Información Pública (AAIP)
            </strong>{" "}
            en{" "}
            <a
              href="https://www.argentina.gob.ar/aaip"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.argentina.gob.ar/aaip
            </a>
            .
          </p>
        </Callout>
      </LegalSection>

      <LegalSection number={9} title="Seguridad de la información">
        <p>
          Implementamos medidas técnicas y organizativas razonables para proteger
          tus datos personales frente al acceso no autorizado, alteración,
          divulgación o destrucción. Estas medidas incluyen:
        </p>
        <ul>
          <li>
            Comunicaciones cifradas mediante HTTPS y los protocolos de cifrado
            end-to-end de WhatsApp.
          </li>
          <li>Acceso restringido a los datos únicamente al personal autorizado.</li>
          <li>
            Almacenamiento en servidores con autenticación y control de acceso.
          </li>
          <li>Revisión periódica de las prácticas de seguridad.</li>
        </ul>
      </LegalSection>

      <LegalSection number={10} title="Menores de edad">
        <p>
          Este servicio no está dirigido a menores de 13 años. Si el turno
          pertenece a un menor de edad, el consentimiento para el tratamiento de
          datos debe ser otorgado por su padre, madre o tutor legal, quien deberá
          proporcionar su propio número de contacto para recibir la confirmación.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Modificaciones a esta política">
        <p>
          Podemos actualizar esta Política de Privacidad en cualquier momento.
          Cuando lo hagamos, actualizaremos la fecha de "Última actualización"
          que figura al inicio de esta página. Si los cambios son significativos,
          te lo comunicaremos de forma adecuada.
        </p>
        <p>
          Te recomendamos revisar esta política periódicamente para mantenerte
          informado/a sobre cómo protegemos tu información.
        </p>
      </LegalSection>

      <ContactCard
        title="¿Preguntas sobre tu privacidad?"
        intro="Para ejercer tus derechos, revocar tu consentimiento o realizar cualquier consulta sobre el tratamiento de tus datos personales, podés comunicarte con nosotros:"
      >
        <li>
          📧 <strong>Email:</strong>{" "}
          <a href="mailto:privacidad@tudominio.com.ar">
            privacidad@[tudominio].com.ar
          </a>
        </li>
        <li>
          📍 <strong>Domicilio:</strong> [Dirección completa], Argentina
        </li>
        <li>
          ⏰ <strong>Horario:</strong> Lunes a viernes de 9:00 a 18:00 hs
        </li>
      </ContactCard>
    </LegalPage>
  );
}
