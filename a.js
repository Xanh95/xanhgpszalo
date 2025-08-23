import { Zalo, ThreadType } from "zca-js";
import { run_vietmap } from "./vietmap.js";
import path from "path";
import { Builder, By, Key, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import fs from "node:fs/promises";

const vietmap = {
  "29ld31538": "210002",
  "29h95648": "180285",
  "29ld31356": "212968",
  "29ld31377": "231347",
};
const zalo_id = {
  "29ld31538": "8742505709139289241",
  "29h95648": "8742505709139289241",
  "29ld31356": "8742505709139289241",
  "29ld31377": "8742505709139289241",
  "29h76446": "8742505709139289241",
  "29h76366": "8742505709139289241",
  "29h76494": "8742505709139289241",
  "29ld31574": "8742505709139289241",
  "29e38191": "8742505709139289241",
  "29h76466": "8742505709139289241",
  "29e15073": "8742505709139289241",
};
// hàm gửi tin nhắn
async function sendTextToUser(api, uid, text) {
  await api.sendMessage(text, uid, ThreadType.User);
  console.log("Đã gửi cho UID:", uid);
}
async function startSimpleAutoReply() {
  const zalo = new Zalo();
  const api = await zalo.loginQR();
  for (let [plate, carId] of Object.entries(vietmap)) {
    await sendTextToUser(
      api,
      zalo_id[plate],
      `thời gian kiểm tra: ${new Date().toLocaleString()}`
    );
  }
}

startSimpleAutoReply().catch(console.error);
