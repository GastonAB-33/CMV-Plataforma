# Guia Practica: Importacion Masiva

Esta guia describe como deberia funcionar la carga de planillas en la practica para evitar errores y mantener control.

## Flujo recomendado (simple)

1. Subir archivo (`Excel`, `Google Sheets` o `CSV`).
2. Elegir que modulo se quiere cargar (`hermanos`, `eventos`, etc.).
3. Revisar mapeo de columnas en pantalla.
4. Correr validacion antes de guardar.
5. Ver resultado:
   - filas listas para crear,
   - filas para actualizar,
   - filas con error.
6. Confirmar importacion.
7. Ejecutar guardado en base.
8. Descargar o ver reporte final.

## Como se minimizan errores

- No se guarda nada directo sin pre-validacion.
- Cada fila queda registrada con su estado en `import_rows`.
- Si una fila falla, no rompe todo el lote.
- El proceso deja trazabilidad de quien subio y cuando (`import_batches` + `audit_logs`).

## Reglas practicas sugeridas

- `Hermanos`:
  - requeridos: nombres, apellidos;
  - validar celular/correo duplicado cuando exista;
  - si no existe celula, marcar error para correccion.
- `Eventos`:
  - requeridos: titulo, tipo de contenido;
  - si es evento, validar fecha.
- `Observaciones`:
  - requeridos: hermano, comentario, fecha.

## Operacion diaria por rol (vision de producto)

- `Pastor`: alta y actualizacion completa en su red, con aprobacion de cambios sensibles.
- `Lider`: alta y seguimiento operativo de su celula.
- `Hermano mayor`: carga observaciones y avances de acompanamiento.

Todos los cambios quedan en historial de auditoria para seguimiento real.

## Resultado esperado

Cuando este flujo se conecte a interfaz:

- la planilla sirve para carga inicial o cargas grandes;
- el dia a dia se hace dentro del sistema;
- y todo queda centralizado y trazable en Supabase.

