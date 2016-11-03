export type SessionType = "cookie";

export interface ValidationErrorItem {
  code: string;
  message: string;
}

export interface ValidationErrorDto {
  [key: string]: ValidationErrorItem[];
}

export interface AccountDto {
  id: number;
  created: Date;
  email: string;
  emailConfirmed: boolean;
  emailConfirmationToken: string;
  blocked: boolean;
  blockedReason: string;
}

export interface SessionDto {
  id: number;
  created: Date;
  accountId: number;
  expires: Date;
  blocked: boolean;
  blockedReason: string;
  refresh: string;
  type: string;
  device: string;
}

export interface LoginDto {
  id: number;
  created: Date;
  sessionId: number;
  expires: Date;
  nonce: string;
  device: string;
}

export interface SessionAndLoginDto {
  session: SessionDto;
  login: LoginDto;
}

export interface AccessToken {
  id: number;
  email: string;
  iat: number; // Issued at (Unix Epoch)
  exp: number; // Expires at (Unix Epoch)
  aud: string; // Audience
  iss: string; // Issuer
  jti: string; // JWT ID
}

export interface AccessDto {
  accessToken: string; // JWT encoded AccessToken (see above)
  issuedAt: number;
  expiresAt: number;
}

export interface PingOutput {
  status: string;
  version: string;
  timestamp: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface RegisterOutput extends AccountDto {
}

export interface ConfirmEmailInput {
  token: string;
}

export interface SigninInput {
  email: string;
  password: string;
  type: SessionType;
  device: string;
}

export interface SigninOutput extends AccessDto {
  refreshToken: string;
}

export interface SignoutInput {
  refreshToken: string;
}

export interface VerifyInput {
  accessToken: string;
}

export interface VerifyOutput extends AccessToken {
}
