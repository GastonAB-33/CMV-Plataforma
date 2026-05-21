# Resumen Practico de Tablas (Supabase)

Este resumen es la "foto general" de donde se va a guardar cada tipo de dato cuando migremos a Supabase.

## 1) Datos base de congregacion

- `usuarios`: personas con acceso al sistema (pastor, lider, etc.).
- `celulas`: grupos/celulas de la congregacion.
- `hermanos`: ficha principal de cada hermano.
- `procesos`: etapa de seguimiento espiritual de cada hermano.
- `observaciones`: notas y comentarios sobre hermanos.
- `discipulado`: relacion y estado de discipulado.
- `eventos`: eventos y noticias para gestion/publicacion.
- `evento_participantes`: participantes vinculados a cada evento.
- `eddi_notas`: notas/examenes de EDDI por hermano.

## 2) Auditoria (historial de cambios)

- `audit_logs`: historial general de cambios.
  - Quien hizo el cambio.
  - Que modulo se toco.
  - Que registro se modifico.
  - Valor anterior y valor nuevo.
  - Fecha y hora del cambio.

## 3) Importacion masiva (planillas)

- `import_batches`: cabecera de cada importacion.
  - Quien subio el archivo.
  - Desde donde vino (Excel, Google Sheets, CSV).
  - Estado general del proceso.
  - Totales de filas validas/invalidas/procesadas.
- `import_rows`: detalle fila por fila.
  - Datos originales.
  - Datos mapeados al formato del sistema.
  - Resultado de validacion.
  - Error concreto si hay problema.
  - Si la fila crea, actualiza o se omite.

## 4) Modulos operativos (hoy en localStorage)

- `publicaciones_change_log`: historial de cambios del modulo de publicaciones/eventos.
- `ministerio_change_log`: historial de cambios de ministerios.
- `observaciones_servicio`: observaciones operativas de servicio.

- `adoracion_perfiles`: talentos/roles por hermano en adoracion.
- `adoracion_horarios`: grilla de horarios/asignaciones de adoracion.

- `multimedia_perfiles`: talentos/roles por hermano en multimedia.
- `multimedia_horarios`: grilla de horarios/asignaciones de multimedia.
- `multimedia_equipos`: novedades/observaciones de equipos multimedia.

- `misericordia_perfiles`: talentos/roles por hermano en misericordia.
- `misericordia_horarios`: grilla de salidas, zonas, equipos y mensajes.
- `misericordia_insumos`: altas/uso de insumos.
- `misericordia_mensajes_biblicos`: mensajes base para salidas.

## 5) Beneficio practico inmediato

Con este esquema:

- ya hay lugar para centralizar todo en una sola base;
- se puede importar por lotes sin arriesgar datos en vivo;
- y queda preparado el camino para que pastor/lider/hermano mayor carguen datos dia a dia con trazabilidad.

