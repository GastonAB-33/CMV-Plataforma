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
};

