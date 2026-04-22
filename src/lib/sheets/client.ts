import { google, sheets_v4 } from 'googleapis';
import { getGoogleSheetsConfig } from '@/lib/sheets/config';
import type { SheetName } from '@/lib/sheets/types';

export class GoogleSheetsClient {
  private readonly spreadsheetId: string;
  private readonly sheetsApi: sheets_v4.Sheets;
  private readonly headersCache = new Map<string, string[]>();

  constructor() {
    const config = getGoogleSheetsConfig();

    const auth = new google.auth.JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheetsApi = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = config.spreadsheetId;
  }

  async getSheetNames(): Promise<string[]> {
    const response = await this.sheetsApi.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      includeGridData: false,
    });

    return (response.data.sheets ?? [])
      .map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title));
  }

  async getSheetHeaders(sheetName: SheetName | string): Promise<string[]> {
    const response = await this.sheetsApi.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!1:1`,
    });

    const firstRow = response.data.values?.[0] ?? [];
    return firstRow.map((column) => String(column));
  }

  async getRows(sheetName: SheetName): Promise<Record<string, string>[]> {
    const response = await this.sheetsApi.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
    });

    const values = response.data.values ?? [];
    if (values.length === 0) {
      return [];
    }

    const [headers, ...rows] = values;

    return rows.map((row) => this.toObject(headers, row));
  }

  async appendRow(sheetName: SheetName, row: Record<string, string>): Promise<void> {
    const headers = await this.getCachedHeaders(sheetName);
    const values = [this.mapRowByHeaders(headers, row)];

    await this.sheetsApi.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
  }

  async updateRow(
    sheetName: SheetName,
    rowNumber: number,
    row: Record<string, string>,
  ): Promise<void> {
    const range = `${sheetName}!A${rowNumber}`;
    const headers = await this.getCachedHeaders(sheetName);

    await this.sheetsApi.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [this.mapRowByHeaders(headers, row)] },
    });
  }

  private async getCachedHeaders(sheetName: SheetName): Promise<string[]> {
    const cacheKey = String(sheetName);
    const cachedHeaders = this.headersCache.get(cacheKey);

    if (cachedHeaders) {
      return cachedHeaders;
    }

    const headers = await this.getSheetHeaders(sheetName);
    this.headersCache.set(cacheKey, headers);
    return headers;
  }

  private mapRowByHeaders(headers: string[], row: Record<string, string>): string[] {
    return headers.map((header) => row[header] ?? '');
  }

  private toObject(headers: string[], row: string[]): Record<string, string> {
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = row[index] ?? '';
      return acc;
    }, {});
  }
}
