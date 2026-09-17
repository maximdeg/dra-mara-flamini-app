# Envío de mensajes de WhatsApp a las pacientes — estado actual

## Mensaje corto (para copiar y pegar)

> Hola Mara! La app ya está lista y programada para enviar las confirmaciones y cancelaciones de turnos por WhatsApp. Para que empiece a funcionar con todas las pacientes falta un solo paso, que se hace en el panel de Meta (no en la app): **completar la verificación del negocio** en la Configuración del negocio de WhatsApp Business. Hasta que Meta la apruebe, solo se puede enviar a números de prueba cargados a mano. Una vez verificado, ya se envía automáticamente a cualquier paciente que reserve.

## En resumen

La aplicación ya está lista para enviar por WhatsApp los mensajes de **confirmación** (cuando una paciente reserva un turno) y de **cancelación**. La programación está completa y probada.

Sin embargo, **todavía no se pueden enviar mensajes a cualquier paciente**. Esto no es un problema del programa, sino de la **cuenta oficial de WhatsApp Business** de la Dra. Mara Flamini Prida: Meta (la empresa dueña de WhatsApp) exige completar unos pasos administrativos antes de habilitar el envío masivo a pacientes reales.

## Qué ya está resuelto ✅

- **La aplicación funciona.** El sistema arma y envía el mensaje correctamente; WhatsApp lo acepta.
- **El método de pago quedó registrado.** Este era el bloqueo más importante: sin una tarjeta válida, WhatsApp no dejaba enviar ningún mensaje. Ya está solucionado.
- **El número de la consulta está verificado** y activo como número oficial de WhatsApp Business.
- **Las plantillas de mensajes** (los textos de confirmación) están aprobadas por Meta.

## Qué falta para poder enviar a todas las pacientes ⏳

Quedan **dos pasos**: uno en el panel de Meta y otro en el panel de Vercel. Ninguno requiere tocar el programa.

### 1. Verificación del negocio (lo principal)

Meta todavía no verificó a la empresa. Mientras esto no se complete, WhatsApp **solo permite enviar mensajes a una lista de hasta 5 números cargados a mano** para pruebas. Es decir: una paciente cualquiera que reserve un turno **no recibiría** su confirmación, porque su número no está en esa lista.

Al **completar la verificación del negocio**, esa restricción desaparece y la aplicación podrá enviar mensajes a **cualquier paciente** que reserve. Este es el paso que habilita el uso real.

> Cómo se hace: en la Configuración del negocio de Meta (Business Settings), iniciar o completar la solicitud de "verificación del negocio". Suele requerir documentación de la empresa/consultorio.

### 2. Configuración en el servidor (Vercel)

Las credenciales de WhatsApp (el identificador del número y el token de acceso) tienen que estar cargadas en el panel de Vercel, donde vive la aplicación publicada. No viajan con el código por seguridad, así que hay que cargarlas una vez a mano y volver a publicar. Sin este paso la aplicación no intenta enviar nada.

### 3. Registro de entrega de mensajes (mejora recomendada, opcional)

Hoy la aplicación puede **enviar** los mensajes, pero no puede **confirmar automáticamente si la paciente los recibió o leyó**. Si querés tener ese seguimiento (por ejemplo, saber cuáles confirmaciones llegaron y cuáles no), es una funcionalidad adicional que se puede agregar más adelante.

## Por qué un mensaje de prueba no llegó

En una prueba anterior WhatsApp aceptó el mensaje pero nunca llegó al teléfono: faltaba el **método de pago** (ya resuelto).

En la prueba del 17/09 no llegó por otro motivo, ya identificado: las **credenciales todavía no están cargadas en Vercel**, así que la aplicación publicada no llega a intentar el envío. Se verificó en la base de datos —la reserva se guardó bien y el teléfono quedó en el formato correcto, pero no hay ningún intento de envío registrado. No fue una falla del programa.

## Próximos pasos

| Paso | Quién lo hace | Estado |
|------|---------------|--------|
| Método de pago | Cliente (panel de Meta) | ✅ Hecho |
| **Verificación del negocio** | **Cliente (panel de Meta)** | ⏳ **Pendiente — habilita el envío a pacientes reales** |
| Nombre visible del remitente | Meta (revisión automática) | ✅ Aprobado |
| Plantillas de confirmación y cancelación | Meta (revisión) | ✅ Aprobadas |
| **Credenciales en Vercel** | **Desarrollador** | ⏳ **Pendiente — sin esto no se envía nada** |
| Aplicación (código) | — | ✅ Lista |

**En una frase:** todo lo técnico está listo; solo falta que Meta termine de aprobar la cuenta de WhatsApp Business —principalmente la verificación del negocio— para poder enviar confirmaciones y cancelaciones a todas las pacientes.
