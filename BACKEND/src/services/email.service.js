const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const EmailService = {
  enviarConfirmacionReserva: async ({ clienteNombre, clienteEmail, reservaId, habitacion, fechaInicio, fechaFin, montoTotal }) => {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail?.trim());
    if (!emailValido) {
      console.warn(`Correo inválido para cliente, no se enviará notificación: "${clienteEmail}"`);
      return false;
    }
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: clienteEmail,
        subject: `Confirmación de Reserva #${reservaId} - Hospedaje Digital`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="background-color: #1a73e8; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Hospedaje Digital</h1>
            </div>

            <div style="padding: 30px;">
              <h2 style="color: #333;">¡Reserva Confirmada!</h2>
              <p style="color: #555;">Hola <strong>${clienteNombre}</strong>, tu reserva ha sido registrada exitosamente.</p>

              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1a73e8; margin-top: 0;">Detalles de tu reserva</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #777; width: 40%;">Número de reserva:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold;">#${reservaId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #777;">Habitación:</td>
                    <td style="padding: 8px 0; color: #333;">${habitacion}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #777;">Fecha de entrada:</td>
                    <td style="padding: 8px 0; color: #333;">${new Date(fechaInicio).toLocaleDateString("es-CO", { dateStyle: "long" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #777;">Fecha de salida:</td>
                    <td style="padding: 8px 0; color: #333;">${new Date(fechaFin).toLocaleDateString("es-CO", { dateStyle: "long" })}</td>
                  </tr>
                  <tr style="border-top: 1px solid #ddd;">
                    <td style="padding: 12px 0 8px; color: #777; font-weight: bold;">Total a pagar:</td>
                    <td style="padding: 12px 0 8px; color: #1a73e8; font-weight: bold; font-size: 18px;">$${Number(montoTotal).toLocaleString("es-CO")}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #555;">Si tienes alguna pregunta sobre tu reserva, no dudes en contactarnos.</p>
              <p style="color: #555; margin-bottom: 0;">Gracias por elegirnos.</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">© 2026 Hospedaje Digital. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Error enviando correo de confirmación:", error);
        return false;
      }

      console.log(`Correo de confirmación enviado a ${clienteEmail} (ID: ${data.id})`);
      return true;
    } catch (err) {
      console.error("Error inesperado en EmailService:", err);
      return false;
    }
  },
};

module.exports = EmailService;
