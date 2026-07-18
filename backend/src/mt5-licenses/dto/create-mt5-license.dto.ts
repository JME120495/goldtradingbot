export class CreateMt5LicenseDto {
  client_name: string;
  client_email: string;
  client_whatsapp?: string;
  account_number: number;
  broker?: string;
  server?: string;
  ea_name?: string;
  plan: string;
  lot: number;
  expiry_date: string; // ISO date string (YYYY-MM-DD)
}
