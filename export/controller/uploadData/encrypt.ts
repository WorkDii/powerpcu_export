import { decrypt, encrypt } from "@mogeko/aes-gcm";
import { envPrivate } from "../../../lib/env.private.ts";

if (!envPrivate.data?.encryption_key)
  throw new Error("Encryption key is not set");
const encryptionKey = envPrivate.data.encryption_key;

export function encryptString(data: string) {
  return encrypt(data, encryptionKey);
}

export function decryptString(data: string) {
  return decrypt(data, encryptionKey);
}

export const blindCid = function (cid: string) {
  if (!cid) return cid;
  if (cid.length <= 7) return cid;
  const firstThree = cid.slice(0, 3);
  const lastThree = cid.slice(-4);
  const middleLength = cid.length - 7;
  const stars = "*".repeat(middleLength);
  return `${firstThree}${stars}${lastThree}`;
};

export const blindName = function (name: string) {
  if (!name) return name;
  if (name.length <= 4) return name;
  const firstTwo = name.slice(0, 4);
  const stars = "*".repeat(6);
  return `${firstTwo}${stars}`;
};

export const blindPhone = function (phone: string) {
  if (!phone) return phone;
  if (phone.length <= 4) return phone;
  const firstTwo = phone.slice(0, 4);
  const stars = "*".repeat(6);
  return `${firstTwo}${stars}`;
};

export async function encryptObject(data: Record<string, any>) {
  const _data: Record<string, any> = {};
  const keys = Object.keys(data);
  for (const key of keys) {
    if (key.toLowerCase().includes("cid") && typeof data[key] === "string") {
      _data[key] = `${blindCid(data[key])}|${await encryptString(data[key])}`;
    } else if (
      ["name", "lname"].includes(key.toLowerCase()) &&
      typeof data[key] === "string"
    ) {
      _data[key] = `${blindName(data[key])}|${await encryptString(data[key])}`;
    } else if (
      key.toLowerCase().includes("phone") &&
      typeof data[key] === "string"
    ) {
      _data[key] = `${blindPhone(data[key])}|${await encryptString(data[key])}`;
    } else {
      _data[key] = data[key];
    }
  }
  return _data;
}
