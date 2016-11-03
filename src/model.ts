import * as cryption from "./helpers/cryption";
import * as postgres from "./helpers/postgres";
import { AccountDto, SessionDto, LoginDto, SessionAndLoginDto } from "./types";

interface AccountRow {
  id: number;
  created: Date;
  data: AccountRowData
}

interface AccountRowData {
  blocked: boolean;
  blockedReason: string;
  email: string;
  emailConfirmationToken: string;
  emailConfirmed: boolean;
  passwordHash: string;
  passwordResetToken: string,
  passwordReset: boolean;
}

interface SessionRow {
  id: number;
  created: Date;
  accountid: number;
  expires: Date;
  expired: boolean;
  data: SessionRowData
}

interface SessionRowData {
  blocked: boolean;
  blockedReason: string;
  refresh: string;
  type: string;
  device: string;
}

interface LoginRow {
  id: number;
  created: Date;
  sessionid: number;
  expires: Date;
  expired: boolean;
  data: LoginRowData
}

interface LoginRowData {
  nonce: string;
  device: string;
}

export async function findAccountByCredentials(email: string, password: string): Promise<AccountDto> {
  const row = await postgres.first<AccountRow>(
    `SELECT *
    FROM accounts
    WHERE lower(data->>'email') = lower($1)`,
    [email]
  );
  return row && await cryption.validatePassword(password, row.data.passwordHash) ? mapAccount(row) : undefined;
}

export async function findAccountByEmail(email: string): Promise<AccountDto> {
  const row = await postgres.first<AccountRow>(
    `SELECT *
    FROM accounts
    WHERE lower(data->>'email') = lower($1)`,
    [email]
  );
  return row ? mapAccount(row) : undefined;
}

export async function findAccountById(accountId: number): Promise<AccountDto> {
  const row = await postgres.first<AccountRow>(
    `SELECT *
    FROM accounts
    WHERE id = $1`,
    [accountId]
  );
  return row ? mapAccount(row) : undefined;
}

export async function isEmailAvailable(email: string): Promise<boolean> {
  const row = await postgres.first<AccountRow>(
    `SELECT id
    FROM accounts
    WHERE lower(data->>'email') = lower($1)`,
    [email]
  );
  return !row;
}

export async function insertAccount(email: string, password: string, emailConfirmationToken: string): Promise<AccountDto> {
  const passwordHash = await cryption.hashPassword(password);
  const data: AccountRowData = {
    blocked: false,
    blockedReason: null,
    email: email,
    emailConfirmationToken: emailConfirmationToken,
    emailConfirmed: false,
    passwordHash: passwordHash,
    passwordResetToken: null,
    passwordReset: false,
  };
  const row = await postgres.first<AccountRow>(
    `INSERT INTO accounts (data)
    VALUES ($1) RETURNING *`,
    [data]
  );
  return mapAccount(row);
}

export async function updateAccountConfirmEmail(emailConfirmationToken: string): Promise<boolean> {
  const affectedRows = await postgres.execute(
    `UPDATE accounts
    SET data = data || '{ "emailConfirmed": true }'
    WHERE  data->>'emailConfirmed' = 'false' AND data->>'emailConfirmationToken' = $1`,
    [emailConfirmationToken]
  );
  return affectedRows > 0;
}

export async function findSessionByRefresh(refresh: string): Promise<SessionDto> {
  const row = await postgres.first<SessionRow>(
    `SELECT *, expires < now() AS expired
    FROM sessions
    WHERE data->>'refresh' = $1`,
    [refresh]
  );
  return row ? mapSession(row) : undefined;
}

export async function insertSessionAndLogin(accountId: number, refresh: string, expiresIn: number, type: string, device: string, loginNonce: string, loginExpiresIn: number): Promise<SessionAndLoginDto> {
  const sessionData: SessionRowData = {
    blocked: false,
    blockedReason: null,
    refresh: refresh,
    type: type,
    device: device,
  };
  const loginData: LoginRowData = {
    nonce: loginNonce,
    device: device,
  };
  const loginRow = await postgres.first<LoginRow>(
    `WITH ins_sessions AS (
      INSERT INTO sessions (accountid, expires, data)
      VALUES ($1, now() + $2 * interval '1 seconds', $3)
      RETURNING *, expires < now() AS expired
    ), ins_logins AS (
      INSERT INTO logins (sessionid, expires, data)
      SELECT s.id, now() + $4 * interval '1 seconds', $5
      FROM ins_sessions s
      RETURNING *, expires < now() AS expired
    )
    SELECT l.* FROM ins_logins l`,
    [accountId, expiresIn, sessionData, loginExpiresIn, loginData]
  );
  const sessionRow = await postgres.first<SessionRow>(
    `SELECT *, expires < now() AS expired FROM sessions WHERE id = $1`,
    [loginRow.sessionid]
  );
  return {
    session: mapSession(sessionRow),
    login: mapLogin(loginRow),
  };
}

export async function updateSessionBlocked(id: number, reason: string): Promise<boolean> {
  const affectedRows = await postgres.execute(
    `UPDATE sessions
    SET data = data || $2
    WHERE id = $1`,
    [id, { blocked: true, blockedReason: reason }]
  );
  return affectedRows > 0;
}

export async function insertLogin(sessionId: number, nonce: string, expiresIn: number, device: string): Promise<LoginDto> {
  const data: LoginRowData = {
    nonce: nonce,
    device: device,
  };
  const loginRow = await postgres.first<LoginRow>(
    `INSERT INTO logins (sessionid, expires, data)
    VALUES ($1, now() + $2 * interval '1 seconds', $3)
    RETURNING *, expires < now() AS expired`,
    [sessionId, expiresIn, data]
  );
  return mapLogin(loginRow);
}

function mapAccount(row: AccountRow): AccountDto {
  return {
    id: row.id,
    created: row.created,
    blocked: row.data.blocked,
    blockedReason: row.data.blockedReason,
    email: row.data.email,
    emailConfirmed: row.data.emailConfirmed,
    emailConfirmationToken: row.data.emailConfirmationToken,
  };
}
function mapSession(row: SessionRow): SessionDto {
  return {
    id: row.id,
    created: row.created,
    accountId: row.accountid,
    expires: row.expires,
    expired: row.expired,
    blocked: row.data.blocked,
    blockedReason: row.data.blockedReason,
    refresh: row.data.refresh,
    type: row.data.type,
    device: row.data.device,
  };
}

function mapLogin(row: LoginRow): LoginDto {
  return {
    id: row.id,
    created: row.created,
    sessionId: row.sessionid,
    expires: row.expires,
    expired: row.expired,
    nonce: row.data.nonce,
    device: row.data.device,
  };
}
