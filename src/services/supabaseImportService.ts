import { canonicalizeCellName, normalizeCellKey } from './cellNormalization';
import { getSupabaseClient } from './supabaseClient';

export interface ImportBatchInput {
  modulo: string;
  sourceType: 'csv' | 'excel' | 'google_sheets';
  sourceName: string;
  uploadedByUserId?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ImportRowInput {
  batchId: string;
  rowNumber: number;
  rawData: Record<string, string>;
  mappedData: Record<string, string | null>;
  validationStatus: 'valid' | 'invalid';
  validationErrors: string[];
  action: 'create' | 'skip';
  targetEntity: 'hermano';
}

type ImportMappedBrother = {
  nombres?: string | null;
  apellidos?: string | null;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  celula?: string | null;
  estado_proceso?: string | null;
  fecha_ingreso?: string | null;
};

type ImportRowRecord = {
  id: string;
  mapped_data: ImportMappedBrother | null;
  validation_status: 'pending' | 'valid' | 'invalid';
  action: 'create' | 'update' | 'skip' | null;
  target_entity_id: string | null;
};

export interface ImportProcessResult {
  ok: boolean;
  processedRows: number;
  skippedRows: number;
  failedRows: number;
  error?: string;
}

const normalize = (value?: string | null): string =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeProcess = (value?: string | null): string | null => {
  const normalized = normalize(value);
  if (!normalized) {
    return null;
  }
  if (normalized === 'altar') {
    return 'Altar';
  }
  if (normalized === 'grupo') {
    return 'Grupo';
  }
  if (normalized === 'experiencia') {
    return 'Experiencia';
  }
  if (normalized === 'eddi') {
    return 'EDDI';
  }
  if (normalized === 'discipulo') {
    return 'Discípulo';
  }
  return value?.trim() || null;
};

const emptyToNull = (value?: string | null): string | null => {
  const clean = value?.trim() ?? '';
  return clean.length > 0 ? clean : null;
};

export const supabaseImportService = {
  async createBatch(input: ImportBatchInput): Promise<{ ok: boolean; id?: string; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const { data, error } = await client
      .from('import_batches')
      .insert({
        modulo: input.modulo,
        source_type: input.sourceType,
        source_name: input.sourceName,
        uploaded_by_user_id: input.uploadedByUserId ?? null,
        status: 'validated',
        total_rows: input.totalRows,
        valid_rows: input.validRows,
        invalid_rows: input.invalidRows,
        processed_rows: 0,
      })
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'No se pudo crear el lote.' };
    }

    return { ok: true, id: data.id };
  },

  async insertRows(rows: ImportRowInput[]): Promise<{ ok: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    if (rows.length === 0) {
      return { ok: true };
    }

    const payload = rows.map((row) => ({
      batch_id: row.batchId,
      row_number: row.rowNumber,
      raw_data: row.rawData,
      mapped_data: row.mappedData,
      action: row.action,
      validation_status: row.validationStatus,
      validation_errors: row.validationErrors,
      target_entity: row.targetEntity,
      target_entity_id: null,
    }));

    const { error } = await client.from('import_rows').insert(payload);
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  },

  async processBatch(batchId: string): Promise<ImportProcessResult> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: false,
        processedRows: 0,
        skippedRows: 0,
        failedRows: 0,
        error: 'Supabase no configurado.',
      };
    }

    const { data: rows, error: rowsError } = await client
      .from('import_rows')
      .select('id,mapped_data,validation_status,action,target_entity_id')
      .eq('batch_id', batchId)
      .order('row_number', { ascending: true });

    if (rowsError || !rows) {
      return {
        ok: false,
        processedRows: 0,
        skippedRows: 0,
        failedRows: 0,
        error: rowsError?.message ?? 'No se pudieron leer las filas del lote.',
      };
    }

    let processedRows = 0;
    let skippedRows = 0;
    let failedRows = 0;

    const getOrCreateCell = async (cellName: string): Promise<string> => {
      const canonicalName = canonicalizeCellName(cellName);
      const { data: existingCells, error: existingCellError } = await client
        .from('celulas')
        .select('id,nombre,activa');

      if (existingCellError) {
        throw new Error(existingCellError.message);
      }

      const existingCell = (existingCells ?? []).find((cell) =>
        normalizeCellKey(canonicalizeCellName(cell.nombre)) === normalizeCellKey(canonicalName) && cell.activa !== false
      );

      if (existingCell?.id) {
        return existingCell.id as string;
      }

      const { data: createdCell, error: createdCellError } = await client
        .from('celulas')
        .insert({
          nombre: canonicalName,
          lider_id: null,
          descripcion: null,
          activa: true,
        })
        .select('id')
        .single();

      if (createdCellError || !createdCell?.id) {
        throw new Error(createdCellError?.message ?? 'No se pudo crear la célula.');
      }

      return createdCell.id as string;
    };

    for (const row of rows as ImportRowRecord[]) {
      if (row.target_entity_id) {
        skippedRows += 1;
        continue;
      }

      if (row.validation_status !== 'valid' || row.action !== 'create') {
        skippedRows += 1;
        continue;
      }

      const mapped = row.mapped_data ?? {};
      const nombres = emptyToNull(mapped.nombres);
      const apellidos = emptyToNull(mapped.apellidos);
      const celula = emptyToNull(mapped.celula);

      if (!nombres || !apellidos || !celula) {
        failedRows += 1;
        await client
          .from('import_rows')
          .update({
            validation_status: 'invalid',
            validation_errors: ['Faltan nombres, apellidos o célula al procesar.'],
            action: 'skip',
          })
          .eq('id', row.id);
        continue;
      }

      try {
        const cellId = await getOrCreateCell(celula);
        const { data: createdBrother, error: createdBrotherError } = await client
          .from('hermanos')
          .insert({
            nombres,
            apellidos,
            telefono: emptyToNull(mapped.telefono),
            fecha_nacimiento: emptyToNull(mapped.fecha_nacimiento),
            celula_id: cellId,
            estado: normalizeProcess(mapped.estado_proceso),
            fecha_ingreso: emptyToNull(mapped.fecha_ingreso),
          })
          .select('id')
          .single();

        if (createdBrotherError || !createdBrother?.id) {
          throw new Error(createdBrotherError?.message ?? 'No se pudo crear el hermano.');
        }

        const { error: updateRowError } = await client
          .from('import_rows')
          .update({
            target_entity_id: createdBrother.id,
          })
          .eq('id', row.id);

        if (updateRowError) {
          throw new Error(updateRowError.message);
        }

        processedRows += 1;
      } catch (error) {
        failedRows += 1;
        await client
          .from('import_rows')
          .update({
            validation_status: 'invalid',
            validation_errors: [error instanceof Error ? error.message : 'Error desconocido al procesar.'],
            action: 'skip',
          })
          .eq('id', row.id);
      }
    }

    const finalStatus = failedRows > 0 ? 'failed' : 'processed';
    const { error: batchUpdateError } = await client
      .from('import_batches')
      .update({
        status: finalStatus,
        processed_rows: processedRows + skippedRows,
      })
      .eq('id', batchId);

    if (batchUpdateError) {
      return {
        ok: false,
        processedRows,
        skippedRows,
        failedRows,
        error: batchUpdateError.message,
      };
    }

    return {
      ok: failedRows === 0,
      processedRows,
      skippedRows,
      failedRows,
      error: failedRows > 0 ? 'Algunas filas no pudieron procesarse.' : undefined,
    };
  },
};
