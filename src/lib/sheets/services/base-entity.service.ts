import { GoogleSheetsClient } from '@/lib/sheets/client';
import type { SheetEntityMap, SheetName } from '@/lib/sheets/types';

export abstract class BaseEntityService<TSheet extends SheetName> {
  protected readonly client: GoogleSheetsClient;
  protected readonly sheetName: TSheet;

  constructor(sheetName: TSheet, client = new GoogleSheetsClient()) {
    this.sheetName = sheetName;
    this.client = client;
  }

  async list(): Promise<SheetEntityMap[TSheet][]> {
    const rows = await this.client.getRows(this.sheetName);
    return rows.map((row) => this.fromRow(row));
  }

  async create(entity: SheetEntityMap[TSheet]): Promise<void> {
    await this.client.appendRow(this.sheetName, this.toRow(entity));
  }

  async update(rowNumber: number, entity: SheetEntityMap[TSheet]): Promise<void> {
    await this.client.updateRow(this.sheetName, rowNumber, this.toRow(entity));
  }

  protected abstract fromRow(row: Record<string, string>): SheetEntityMap[TSheet];
  protected abstract toRow(entity: SheetEntityMap[TSheet]): Record<string, string>;
}
