import { GoogleSheetsClient } from '@/lib/sheets/client';
import { MIN_REQUIRED_COLUMNS, REQUIRED_SHEETS } from '@/lib/sheets/schema';
import type { SheetName } from '@/lib/sheets/types';

export interface SheetsStructureValidationResult {
  ok: boolean;
  errors: string[];
}

function normalizeColumnName(value: string): string {
  return value.trim();
}

export async function validateSheetsStructure(
  client = new GoogleSheetsClient(),
): Promise<SheetsStructureValidationResult> {
  const errors: string[] = [];

  const existingSheetNames = await client.getSheetNames();

  for (const sheetName of REQUIRED_SHEETS) {
    if (!existingSheetNames.includes(sheetName)) {
      errors.push(`Falta la hoja requerida: "${sheetName}".`);
      continue;
    }

    const headers = await client.getSheetHeaders(sheetName);
    const normalizedHeaders = headers.map(normalizeColumnName);

    const missingColumns = MIN_REQUIRED_COLUMNS[sheetName].filter(
      (requiredColumn) => !normalizedHeaders.includes(requiredColumn),
    );

    if (missingColumns.length > 0) {
      errors.push(
        `La hoja "${sheetName}" no tiene columnas mínimas: ${missingColumns.join(', ')}.`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function getRequiredColumnsBySheet(): Record<SheetName, string[]> {
  return MIN_REQUIRED_COLUMNS;
}
