import * as cryption from "../helpers/cryption";
import * as postgres from "../helpers/postgres";

export interface AccountDto {
  id: number;
  created: Date;
  email: string;
  emailConfirmed: boolean;
  emailConfirmationToken: string;
  blocked: boolean;
  blockedReason: string;
}

export async function findAccountByCredentials(email: string, password: string): Promise<AccountDto> {
  const row = await postgres.first<AccountRow>(`SELECT * FROM accounts WHERE lower(data->>'email') = lower($1)`, [email]);
  return row && await cryption.validatePassword(password, row.data.passwordHash) ? mapAccount(row) : undefined;
}

export async function findAccountByEmail(email: string): Promise<AccountDto> {
  const row = await postgres.first<AccountRow>(`SELECT * FROM accounts WHERE lower(data->>'email') = lower($1)`, [email]);
  return row ? mapAccount(row) : undefined;
}

export async function isEmailAvailable(email: string): Promise<boolean> {
  const row = await postgres.first<AccountRow>(`SELECT id FROM accounts WHERE lower(data->>'email') = lower($1)`, [email]);
  return !row;
}

export async function insertAccount(email: string, password: string, emailConfirmationToken: string): Promise<AccountDto> {
  const passwordHash = await cryption.hashPassword(password);
  const data: AccountRowData = {
    email: email,
    emailConfirmationToken: emailConfirmationToken,
    emailConfirmed: false,
    passwordHash: passwordHash,
    passwordResetToken: null,
    passwordReset: false,
    blocked: false,
    blockedReason: null,
  };
  const row = await postgres.first<AccountRow>(`INSERT INTO accounts (data) VALUES ($1) RETURNING *`, [data]);
  return mapAccount(row);
}

interface AccountRow {
  id: number;
  created: Date;
  data: AccountRowData
}

interface AccountRowData {
  email: string;
  emailConfirmationToken: string;
  emailConfirmed: boolean;
  passwordHash: string;
  passwordResetToken: string,
  passwordReset: boolean;
  blocked: boolean;
  blockedReason: string;
}

function mapAccount(row: AccountRow): AccountDto {
  return {
    id: row.id,
    created: row.created,
    email: row.data.email,
    emailConfirmed: row.data.emailConfirmed,
    emailConfirmationToken: row.data.emailConfirmationToken,
    blocked: row.data.blocked,
    blockedReason: row.data.blockedReason,
  };
}
