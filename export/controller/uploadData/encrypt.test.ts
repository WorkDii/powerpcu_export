import { assertEquals } from "@std/assert";
import {
  decryptString,
  encryptString,
  blindCid,
  blindName,
  encryptObject,
} from "./encrypt.ts";

Deno.test("encryptString should encrypt data correctly", async () => {
  const testData = "test data";
  const encrypted = await encryptString(testData);
  assertEquals(encrypted !== testData, true);
  assertEquals(typeof encrypted, "string");
  assertEquals(encrypted.length > 0, true);
  const decrypted = await decryptString(encrypted);
  assertEquals(decrypted === testData, true);
});

Deno.test("blindCid should blind cid correctly", async () => {
  const cid = "1909800657553";
  const blinded = blindCid(cid);
  assertEquals(blinded, "190******7553");

  const cid2 = "123456";
  const blinded2 = blindCid(cid2);
  assertEquals(blinded2, "123456");

  const cid3 = "";
  const blinded3 = blindCid(cid3);
  assertEquals(blinded3, "");

  const cid4 = "12345";
  const blinded4 = blindCid(cid4);
  assertEquals(blinded4, "12345");
});

Deno.test("blindName should blind name correctly", async () => {
  const name = "test name";
  const blinded = blindName(name);
  assertEquals(blinded, "test******");

  const name2 = "test";
  const blinded2 = blindName(name2);
  assertEquals(blinded2, "test");

  const name3 = "";
  const blinded3 = blindName(name3);
  assertEquals(blinded3, "");
});

Deno.test("encryptObject should encrypt object correctly", async () => {
  const data = {
    cid: "1909800657553",
    name: "test name",
    age: 18,
  };
  const encrypted = await encryptObject(data);
  const cidEncrypted = encrypted.cid.split("|")[1];
  const nameEncrypted = encrypted.name.split("|")[1];
  const cidDecrypted = await decryptString(cidEncrypted);
  const nameDecrypted = await decryptString(nameEncrypted);

  assertEquals(cidDecrypted, data.cid);
  assertEquals(nameDecrypted, data.name);

  assertEquals(encrypted.cid, `190******7553|${cidEncrypted}`);
  assertEquals(encrypted.name, `test******|${nameEncrypted}`);
  assertEquals(encrypted.age, data.age);

  const data1 = {
    cid: 1909800657553,
    name: "test name",
    age: 18,
  };
  const encrypted1 = await encryptObject(data1);
  assertEquals(encrypted1.cid, 1909800657553);
});
