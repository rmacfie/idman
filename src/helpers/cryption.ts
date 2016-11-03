import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import * as base32Encode from "base32-encode";
import * as base32Decode from "base32-decode";
import config from "../config";

export async function randomString(byteLength: number): Promise<string> {
  const bytes = await randomBytes(byteLength);
  return encodeB32(bytes);
}

export async function hashPassword(password: string): Promise<string> {
  const hash = await hashPasswordV1(password);
  return `v1:${hash}`;
}

export async function validatePassword(candidate: string, passwordHash: string): Promise<boolean> {
  if (passwordHash.startsWith("v1:")) {
    return await validatePasswordV1(candidate, passwordHash.substring("v1:".length));
  } else {
    throw new Error("Unknown password hash algorithm.");
  }
}

export async function signJwt(payload: Object, expiresInSeconds: number, jti: string): Promise<string> {
  const options: jwt.SignOptions = {
    algorithm: "HS512",
  };
  return await new Promise<string>((resolve, reject) => {
    jwt.sign(payload, config.jwtSecret, options, (err, encoded) => {
      return err ? reject(err) : resolve(encoded);
    });
  });
}

export async function verifyJwt(encoded: string, issuer: string, audiences: string[]): Promise<any> {
  const options: jwt.VerifyOptions = {
    algorithms: ["HS512"],
    audience: audiences,
    issuer: issuer,
  };
  return await new Promise<string>((resolve, reject) => {
    jwt.verify(encoded, config.jwtSecret, options, (err, payload) => {
      return err ? reject(err) : resolve(payload);
    });
  });
}

async function hashPasswordV1(password: string): Promise<string> {
  const hashLength = 32;
  const iterations = 1024 * 256;
  const passwordBuffer = Buffer.from(password);
  const saltBuffer = await randomBytes(hashLength);
  const hashBuffer = await pbkdf2(passwordBuffer, saltBuffer, iterations, hashLength, "sha512");
  return `${iterations}.${encodeB32(saltBuffer)}.${encodeB32(hashBuffer)}`;
}

async function validatePasswordV1(candidate: string, passwordHash: string): Promise<boolean> {
  const candidateBuffer = Buffer.from(candidate);
  const parts = passwordHash.split(".");
  const iterations = parseInt(parts[0]);
  const saltBuffer = decodeB32(parts[1]);
  const hashBuffer = decodeB32(parts[2]);
  const candidateHashBuffer = await pbkdf2(candidateBuffer, saltBuffer, iterations, hashBuffer.length, "sha512");
  return candidateHashBuffer.equals(hashBuffer);
}

function pbkdf2(password: Buffer, salt: Buffer, iterations: number, length: number, digest: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, length, digest, (err, key) => {
      if (err) {
        return reject(err);
      }
      return resolve(key);
    });
  });
}

function randomBytes(length: number): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  });
}

function encodeB32(bytes: Buffer) {
  const encoded = base32Encode(bytes.buffer, "Crockford");
  return encoded.toLowerCase();
}

function decodeB32(encoded: string): Buffer {
  const bytes = base32Decode(encoded, "Crockford");
  return new Buffer(bytes);
}
