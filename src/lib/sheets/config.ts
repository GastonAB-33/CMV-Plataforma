export interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }

  return value;
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  return {
    spreadsheetId: getRequiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID'),
    clientEmail: getRequiredEnv('GOOGLE_SHEETS_CLIENT_EMAIL'),
    privateKey: getRequiredEnv('GOOGLE_SHEETS_PRIVATE_KEY').replace(/\\n/g, '\n'),
  };
}
