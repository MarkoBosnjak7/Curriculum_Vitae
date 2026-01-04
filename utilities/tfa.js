import crypto from "crypto";
import { saveUserSecret } from "./database.js";
import { ALGORITHM_TYPE, DIGITS_SIZE, PERIOD_TIME } from "./constants.js";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const base32Encode = () => {
  const buffer = crypto.randomBytes(20);
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

const base32Decode = (string) => {
  const clean = string.toUpperCase().replace(/=+$/g, "");
  const bytes = [];
  let bits = 0;
  let value = 0;
  for (let i = 0; i < clean.length; i++) {
    const index = BASE32_ALPHABET.indexOf(clean[i]);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

const integerToBuffer = (number) => {
  const buffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buffer[i] = number & 0xff;
    number = number >>> 8;
  }
  return buffer;
};

const constantTimeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  let response = 0;
  for (let i = 0; i < a.length; i++) {
    response |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return response === 0;
};

const generateOtpAuthenticationURL = (secret, account) => {
  const issuer = process.env.APPLICATION_NAME.replace(" ", "_");
  const label = `${issuer}:${account}`;
  const params = new URLSearchParams({ secret, issuer, algorithm: ALGORITHM_TYPE.toUpperCase(), digits: DIGITS_SIZE.toString(), period: PERIOD_TIME.toString() });
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${label}?${params.toString()}`;
};

const hotp = (secretBuffer, counter) => {
  const buffer = integerToBuffer(counter);
  const hmac = crypto.createHmac(ALGORITHM_TYPE, secretBuffer).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  const otpToken = code % (10 ** DIGITS_SIZE);
  return otpToken.toString().padStart(DIGITS_SIZE, "0");
};

export const totp = (secretBase32) => {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / PERIOD_TIME);
  return hotp(secret, counter);
};

export const verifyTotp = (token, secretBase32, window = 1) => {
  const secret = base32Decode(secretBase32);
  const time = Math.floor(Date.now() / 1000);
  const currentCounter = Math.floor(time / PERIOD_TIME);
  for (let i = -window; i <= window; i++) {
    const counter = currentCounter + i;
    const candidate = hotp(secret, counter);
    if (constantTimeCompare(candidate, token)) return { ok: true, delta: i };
  }
  return { ok: false };
};

export const createQrCode = async (userId, account) => {
  const secret = base32Encode();
  await saveUserSecret(userId, secret);
  return generateOtpAuthenticationURL(secret, account);
};
