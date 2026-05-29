import { ChangeEvent, useMemo, useState } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { supabaseImportService } from '../../services/supabaseImportService';

type TargetField =
  | 'nombres'
  | 'apellidos'
  | 'telefono'
  | 'fecha_nacimiento'
  | 'celula'
  | 'estado_proceso'
  | 'fecha_ingreso';

type MappedRow = {
  rowNumber: number;
  raw: Record<string, string>;
  mapped: Record<TargetField, string | null>;
  errors: string[];
};

const REQUIRED_FIELDS: TargetField[] = ['nombres', 'apellidos', 'celula'];

const TARGET_FIELDS: Array<{ key: TargetField; label: string; required?: boolean }> = [
  { key: 'nombres', label: 'Nombres', required: true },
  { key: 'apellidos', label: 'Apellidos', required: true },
  { key: 'telefono', label: 'Telefono' },
  { key: 'fecha_nacimiento', label: 'Fecha nacimiento' },
  { key: 'celula', label: 'Celula', required: true },
  { key: 'estado_proceso', label: 'Estado proceso' },
  { key: 'fecha_ingreso', label: 'Fecha ingreso' },
];

const PROCESS_VALUES = ['altar', 'grupo', 'experiencia', 'eddi', 'discipulo'];
const PROCESS_LABELS = ['Altar', 'Grupo', 'Experiencia', 'EDDI', 'Discípulo'];

const TEMPLATE_DOWNLOAD_PATH = '/plantilla_importador_hermanos.xls';

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const parseCsv = (content: string): { headers: string[]; rows: string[][] } => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const split = (line: string) => {
    const cells: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const nextChar = line[index + 1];

      if (char === '"' && insideQuotes && nextChar === '"') {
        current += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }

      if (char === delimiter && !insideQuotes) {
        cells.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    cells.push(current.trim());
    return cells;
  };
  const headers = split(lines[0]);
  const rows = lines.slice(1).map(split);
  return { headers, rows };
};

const parseSpreadsheetRows = (table: unknown[][]): { headers: string[]; rows: string[][] } => {
  const normalized = table
    .map((row) =>
      row.map((cell) => {
        if (cell === null || cell === undefined) {
          return '';
        }
        return String(cell).trim();
      }),
    )
    .filter((row) => row.some((cell) => cell.length > 0));

  if (normalized.length === 0) {
    return { headers: [], rows: [] };
  }

  return {
    headers: normalized[0],
    rows: normalized.slice(1),
  };
};

const parseXlsx = async (file: File): Promise<{ headers: string[]; rows: string[][] }> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;

  if (!firstSheet) {
    return { headers: [], rows: [] };
  }

  const table = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  }) as unknown[][];

  return parseSpreadsheetRows(table);
};

export const ImportadorPage = () => {
  const { user } = useAuth();
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<TargetField, string>>({
    nombres: '',
    apellidos: '',
    telefono: '',
    fecha_nacimiento: '',
    celula: '',
    estado_proceso: '',
    fecha_ingreso: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const lowerFileName = file.name.toLowerCase();
    if (!lowerFileName.endsWith('.csv') && !lowerFileName.endsWith('.xls') && !lowerFileName.endsWith('.xlsx')) {
      setToast({ text: 'Por ahora el importador acepta archivos CSV, XLS o XLSX.', type: 'error' });
      return;
    }

    const parsed = lowerFileName.endsWith('.xlsx')
      ? await parseXlsx(file)
      : parseCsv(await file.text());
    if (parsed.headers.length === 0) {
      setToast({ text: 'El archivo no tiene cabecera o está vacío.', type: 'error' });
      return;
    }

    const mappedRows = parsed.rows.map((row) =>
      parsed.headers.reduce((acc, header, index) => {
        acc[header] = row[index] ?? '';
        return acc;
      }, {} as Record<string, string>),
    );

    setFileName(file.name);
    setHeaders(parsed.headers);
    setRows(mappedRows);

    const nextMapping = { ...mapping };
    for (const field of TARGET_FIELDS) {
      const guessedHeader = parsed.headers.find((header) => normalize(header).includes(normalize(field.key)));
      nextMapping[field.key] = guessedHeader ?? '';
    }
    setMapping(nextMapping);
  };

  const mappedRows = useMemo<MappedRow[]>(() => {
    return rows.map((raw, index) => {
      const mapped = TARGET_FIELDS.reduce((acc, field) => {
        const sourceHeader = mapping[field.key];
        acc[field.key] = sourceHeader ? (raw[sourceHeader] ?? '').trim() : null;
        return acc;
      }, {} as Record<TargetField, string | null>);

      const errors: string[] = [];
      for (const requiredField of REQUIRED_FIELDS) {
        if (!mapped[requiredField]) {
          errors.push(`Falta ${requiredField}`);
        }
      }

      if (mapped.estado_proceso) {
        const value = normalize(mapped.estado_proceso);
        if (!PROCESS_VALUES.includes(value)) {
          errors.push('estado_proceso inválido');
        }
      }

      if (mapped.fecha_nacimiento && Number.isNaN(Date.parse(`${mapped.fecha_nacimiento}T00:00:00`))) {
        errors.push('fecha_nacimiento invalida');
      }

      return {
        rowNumber: index + 1,
        raw,
        mapped,
        errors,
      };
    });
  }, [rows, mapping]);

  const validRows = mappedRows.filter((row) => row.errors.length === 0);
  const invalidRows = mappedRows.filter((row) => row.errors.length > 0);

  const onConfirmImport = async () => {
    if (mappedRows.length === 0) {
      setToast({ text: 'Primero carga un archivo.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    const sourceType = fileName.toLowerCase().endsWith('.csv') ? 'csv' : 'excel';
    const batch = await supabaseImportService.createBatch({
      modulo: 'hermanos',
      sourceType,
      sourceName: fileName || 'plantilla_importador_hermanos.xls',
      uploadedByUserId: user.id,
      totalRows: mappedRows.length,
      validRows: validRows.length,
      invalidRows: invalidRows.length,
    });

    if (!batch.ok || !batch.id) {
      setIsProcessing(false);
      setToast({ text: batch.error ?? 'No se pudo crear el lote de importación.', type: 'error' });
      return;
    }

    const rowsResult = await supabaseImportService.insertRows(
      mappedRows.map((row) => ({
        batchId: batch.id as string,
        rowNumber: row.rowNumber,
        rawData: row.raw,
        mappedData: row.mapped,
        validationStatus: row.errors.length === 0 ? 'valid' : 'invalid',
        validationErrors: row.errors,
        action: row.errors.length === 0 ? 'create' : 'skip',
        targetEntity: 'hermano',
      })),
    );

    if (!rowsResult.ok) {
      setIsProcessing(false);
      setToast({ text: rowsResult.error ?? 'No se pudieron guardar las filas.', type: 'error' });
      return;
    }

    const processResult = await supabaseImportService.processBatch(batch.id);
    setIsProcessing(false);
    if (!processResult.ok) {
      setToast({
        text: processResult.error ?? `Importacion parcial. Creados: ${processResult.processedRows}, con error: ${processResult.failedRows}.`,
        type: 'error',
      });
      return;
    }

    setToast({
      text: `Importacion procesada. Hermanos creados: ${processResult.processedRows}. Omitidos: ${processResult.skippedRows}. Con error: ${processResult.failedRows}.`,
      type: 'success',
    });
    return;

    setToast({
      text: `Importación validada. Lote: ${batch.id}. Válidas: ${validRows.length}, con error: ${invalidRows.length}.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Importador</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Carga masiva de datos</h1>
        <p className="text-sm text-slate-600 dark:text-gray-400">
          Plantilla XLS/CSV/XLSX + mapeo + validación previa antes de impactar datos.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-[#c5a059]" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">1) Subir archivo</h2>
        </div>
        <a
          href={TEMPLATE_DOWNLOAD_PATH}
          download="plantilla_importador_hermanos.xls"
          className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] px-3 py-2 text-xs font-black uppercase tracking-wider"
        >
          Descargar plantilla XLS
        </a>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-xs text-slate-600 dark:text-gray-300">
          <p className="font-semibold mb-1">Datos obligatorios por fila:</p>
          <p>
            <span className="font-bold">nombres</span>, <span className="font-bold">apellidos</span>,{' '}
            <span className="font-bold">celula</span>.
          </p>
          <p className="mt-1">
            Valores válidos en <span className="font-bold">estado_proceso</span>:{' '}
            {PROCESS_LABELS.join(', ')}.
          </p>
          <p className="mt-1">
            La plantilla incluye esos estados al costado para usarlos como referencia.
          </p>
        </div>
        <input
          type="file"
          accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFileChange}
        />
        {fileName && <p className="text-xs text-slate-500 dark:text-gray-400">Archivo: {fileName}</p>}
      </section>

      {headers.length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-[#c5a059]" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">2) Mapeo de columnas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TARGET_FIELDS.map((field) => (
              <label key={field.key} className="space-y-1">
                <span className="text-xs text-slate-600 dark:text-gray-300">
                  {field.label} {field.required ? '(requerido)' : ''}
                </span>
                <select
                  value={mapping[field.key]}
                  onChange={(event) =>
                    setMapping((previous) => ({ ...previous, [field.key]: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-2 text-sm"
                >
                  <option value="">-- sin asignar --</option>
                  {headers.map((header) => (
                    <option key={`${field.key}-${header}`} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>
      )}

      {mappedRows.length > 0 && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-4">
              <p className="text-xs text-slate-500 dark:text-gray-400">Total filas</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{mappedRows.length}</p>
            </article>
            <article className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4">
              <p className="text-xs text-emerald-200">Válidas</p>
              <p className="text-2xl font-black text-emerald-100">{validRows.length}</p>
            </article>
            <article className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4">
              <p className="text-xs text-amber-200">Con error</p>
              <p className="text-2xl font-black text-amber-100">{invalidRows.length}</p>
            </article>
          </div>

          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-[#c5a059]" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Muestra de validación</h3>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {mappedRows.slice(0, 12).map((row) => (
                <div
                  key={row.rowNumber}
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3"
                >
                  <p className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                    Fila {row.rowNumber} - {row.errors.length === 0 ? 'OK' : 'Con errores'}
                  </p>
                  {row.errors.length > 0 && (
                    <p className="text-xs text-rose-300 mt-1">{row.errors.join(' | ')}</p>
                  )}
                </div>
              ))}
            </div>
          </article>

          <button
            type="button"
            onClick={onConfirmImport}
            disabled={isProcessing}
            className="rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black px-4 py-2 text-xs uppercase tracking-widest"
          >
            {isProcessing ? 'Procesando...' : '3) Confirmar importación validada'}
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-200 mb-2">
            <CheckCircle2 size={14} />
            <p className="text-xs uppercase tracking-widest font-black">Valores válidos de proceso</p>
          </div>
          <p className="text-sm text-emerald-100/90">{PROCESS_LABELS.join(' | ')}</p>
        </article>
      </section>

      <Toast
        message={toast?.text ?? ''}
        isVisible={Boolean(toast)}
        type={toast?.type ?? 'success'}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
