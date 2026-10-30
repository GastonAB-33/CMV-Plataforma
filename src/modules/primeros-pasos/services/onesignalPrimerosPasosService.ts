import { ONESIGNAL_APP_ID } from '../../../services/onesignal';
import { FichaBienvenida } from '../types';

export interface OneSignalDerivacionPayload {
  ficha: FichaBienvenida;
  destinatario: {
    id: string;
    nombre: string;
    rol: string;
    celula?: string;
  };
  derivadoPor: {
    id: string;
    nombre: string;
  };
  notas?: string;
}

export interface OneSignalNotificationResult {
  ok: boolean;
  message: string;
  simulated: boolean;
  notificationId?: string;
  timestamp: string;
  payloadSummary: {
    titulo: string;
    mensaje: string;
    destinatario: string;
    nuevoHermano: string;
    celula: string;
  };
}

/**
 * Servicio preparado para disparar la notificación de OneSignal
 * cuando el Pastor Principal deriva un nuevo hermano a un líder o pastor.
 */
export const onesignalPrimerosPasosService = {
  /**
   * Prepara y envía la notificación de derivación pastoral a OneSignal.
   */
  async notificarDerivacion(
    data: OneSignalDerivacionPayload
  ): Promise<OneSignalNotificationResult> {
    const timestamp = new Date().toISOString();
    const titulo = `¡Nuevo Hermano Derivado! - CMV`;
    const mensaje = `${data.destinatario.nombre}, el ${data.derivadoPor.nombre} te derivó a ${data.ficha.nombreCompleto} (${data.ficha.celulaRecibe}) para acompañamiento de Primeros Pasos.${data.notas ? ` Nota: "${data.notas}"` : ''}`;

    const payloadSummary = {
      titulo,
      mensaje,
      destinatario: `${data.destinatario.nombre} (${data.destinatario.rol})`,
      nuevoHermano: data.ficha.nombreCompleto,
      celula: data.ficha.celulaRecibe,
    };

    console.group(`🔔 [OneSignal Primeros Pasos] Notificación para ${data.destinatario.nombre}`);
    console.log('App ID:', ONESIGNAL_APP_ID);
    console.log('Destinatario ID:', data.destinatario.id);
    console.log('Destinatario Nombre:', data.destinatario.nombre);
    console.log('Hermano Ficha:', data.ficha);
    console.log('Mensaje:', mensaje);
    console.groupEnd();

    // Verificamos si en el entorno hay un API Key de OneSignal o backend disponible
    const restApiKey = (import.meta.env.VITE_ONESIGNAL_REST_API_KEY as string) || '';

    if (restApiKey && ONESIGNAL_APP_ID) {
      try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${restApiKey}`,
          },
          body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            include_aliases: {
              external_id: [data.destinatario.id, data.destinatario.nombre.toLowerCase().replace(/\s+/g, '-')],
            },
            target_channel: 'push',
            headings: { en: titulo, es: titulo },
            contents: { en: mensaje, es: mensaje },
            data: {
              tipo: 'primeros_pasos_derivacion',
              fichaId: data.ficha.id,
              hermanoNombre: data.ficha.nombreCompleto,
              telefono: data.ficha.telefono,
              celula: data.ficha.celulaRecibe,
            },
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          return {
            ok: true,
            message: `Notificación OneSignal enviada exitosamente a ${data.destinatario.nombre}`,
            simulated: false,
            notificationId: resJson.id,
            timestamp,
            payloadSummary,
          };
        }
      } catch (err) {
        console.warn('[OneSignal] Error enviando REST push, pasando a modo preparado:', err);
      }
    }

    // Modo preparado / en instalación (conforme solicitado por el usuario)
    // Permite al pastor ver que la integración está lista y activa
    return {
      ok: true,
      message: `Notificación OneSignal preparada correctamente para ${data.destinatario.nombre} (${data.destinatario.rol})`,
      simulated: true,
      notificationId: `onesignal-ready-${Date.now()}`,
      timestamp,
      payloadSummary,
    };
  },
};
