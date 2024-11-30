import { z } from 'zod';

// Validation schema for customer data
export const customerCsvSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .regex(/^[A-Za-z\s]+$/, 'First name must contain only letters')
    .transform(val => val.trim()),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .regex(/^[A-Za-z\s]+$/, 'Last name must contain only letters')
    .transform(val => val.trim()),
  
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email cannot exceed 100 characters')
    .transform(val => val.trim().toLowerCase()),
  
  phone: z.string()
    .optional()
    .transform(val => (val?.trim() || ''))
    .pipe(z.string().regex(/^[0-9]+$/, 'Phone number must contain only numbers')),
  
  address: z.string()
    .optional()
    .transform(val => (val?.trim() || ''))
    .pipe(z.string().min(5, 'Address must be at least 5 characters')),
  
  companyName: z.string()
    .optional()
    .transform(val => (val?.trim() || undefined)),
  
  notes: z.string()
    .optional()
    .transform(val => (val?.trim() || undefined))
});

export type CustomerCsvData = z.infer<typeof customerCsvSchema>;

interface ValidationResult {
  valid: CustomerCsvData[];
  invalid: Array<{
    row: number;
    data: Record<string, any>;
    errors: string[];
  }>;
  duplicates: Array<{
    row: number;
    data: Record<string, any>;
    reason: string;
    existingId?: string;
  }>;
}

export function parseCSV(csvData: string): Array<Record<string, any>> {
  if (!csvData.trim()) {
    throw new Error('CSV file is empty');
  }

  const lines = csvData.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Validate required headers
  const requiredHeaders = ['firstname', 'lastname', 'email'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  return lines.slice(1)
    .filter(line => line.trim())
    .map((line, index) => {
      // Handle quoted values properly
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);

      // Clean up values and create row object
      const row: Record<string, any> = {};
      headers.forEach((header, i) => {
        const value = values[i] || '';
        row[header] = value.replace(/^"(.*)"$/, '$1').trim();
      });

      return row;
    });
}

export async function validateCsvData(
  rows: Array<Record<string, any>>,
  existingCustomers: Array<{ id: string; email: string; firstName: string; lastName: string; }>
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: [],
    invalid: [],
    duplicates: []
  };

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('No data to import');
  }

  // Create lookup maps for existing customers
  const emailMap = new Map(existingCustomers.map(c => [c.email.toLowerCase(), c]));
  const nameMap = new Map(existingCustomers.map(c => [
    `${c.firstName.toLowerCase()} ${c.lastName.toLowerCase()}`,
    c
  ]));

  // Track unique values within the import file
  const seenEmails = new Set<string>();
  const seenNames = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // Add 2 to account for header row and 0-based index

    try {
      // Basic validation before schema validation
      if (!row.email?.trim() || !row.firstname?.trim() || !row.lastname?.trim()) {
        result.invalid.push({
          row: rowNumber,
          data: row,
          errors: ['Email, First Name, and Last Name are required fields']
        });
        continue;
      }

      const email = row.email.toLowerCase().trim();
      const fullName = `${row.firstname.toLowerCase().trim()} ${row.lastname.toLowerCase().trim()}`;

      // Check for duplicates within the import file
      if (seenEmails.has(email)) {
        result.duplicates.push({
          row: rowNumber,
          data: row,
          reason: 'Duplicate email address within import file'
        });
        continue;
      }

      if (seenNames.has(fullName)) {
        result.duplicates.push({
          row: rowNumber,
          data: row,
          reason: 'Duplicate name within import file'
        });
        continue;
      }

      // Check against existing records
      const existingByEmail = emailMap.get(email);
      if (existingByEmail) {
        result.duplicates.push({
          row: rowNumber,
          data: row,
          reason: 'Email address exists',
          existingId: existingByEmail.id
        });
        continue;
      }

      // Clean phone number - remove all non-numeric characters
      if (row.phone) {
        row.phone = row.phone.replace(/\D/g, '');
      }

      // Validate data against schema
      const validatedData = await customerCsvSchema.parseAsync({
        firstName: row.firstname,
        lastName: row.lastname,
        email: row.email,
        phone: row.phone,
        address: row.address,
        companyName: row.companyname,
        notes: row.notes
      });

      // Add to tracking sets
      seenEmails.add(email);
      seenNames.add(fullName);

      // Add to valid results
      result.valid.push(validatedData);

    } catch (error) {
      if (error instanceof z.ZodError) {
        result.invalid.push({
          row: rowNumber,
          data: row,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      } else {
        result.invalid.push({
          row: rowNumber,
          data: row,
          errors: [(error as Error).message || 'Unexpected error during validation']
        });
      }
    }
  }

  return result;
}