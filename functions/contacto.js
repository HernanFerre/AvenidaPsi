export async function onRequestGet(context) {
  return Response.redirect(new URL("/", context.request.url), 302);
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const nombre = String(formData.get("nombre") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    const mensaje = String(formData.get("mensaje") || "").trim();

    if (!nombre || !email || !mensaje) {
      return new Response("Faltan datos obligatorios", { status: 400 });
    }

    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response("Falta configurar RESEND_API_KEY en Cloudflare Pages.", {
        status: 500,
      });
    }

    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Avenida Psi <onboarding@resend.dev>",
        to: ["lic.altobellidaniela@gmail.com"],
        reply_to: email,
        subject: "Nueva consulta desde Avenida Psi",
        text:
          `Nueva consulta desde la web de Avenida Psi:\n\n` +
          `Nombre: ${nombre}\n` +
          `Email: ${email}\n` +
          `Teléfono: ${telefono || "No informado"}\n\n` +
          `Mensaje:\n${mensaje}`,
      }),
    });

    const respuestaTexto = await respuesta.text();

    if (!respuesta.ok) {
      return new Response(`No se pudo enviar el mensaje.\n\nStatus Resend: ${respuesta.status}\n\nRespuesta:\n${respuestaTexto}`, {
        status: 500,
      });
    }

    return Response.redirect(new URL("/gracias.html", context.request.url), 303);
  } catch (error) {
    return new Response(`Error inesperado en contacto.js:\n\n${error.message}`, {
      status: 500,
    });
  }
}
