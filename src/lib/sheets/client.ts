import { google, sheets_v4 } from 'googleapis';
import { getGoogleSheetsConfig } from '@/lib/sheets/config';
import type { SheetName } from '@/lib/sheets/types';

export class GoogleSheetsClient {
  private readonly spreadsheetId: string;
  private readonly sheetsApi: sheets_v4.Sheets;

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
    const values = [Object.values(row)];

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

    await this.sheetsApi.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [Object.values(row)] },
    });
  }

  private toObject(headers: string[], row: string[]): Record<string, string> {
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = row[index] ?? '';
      return acc;
    }, {});
  }
}
