import { Zalo, ThreadType } from "zca-js";

async function sendMessageByPhone() {
  const zalo = new Zalo();
  const api = await zalo.loginQR();

  // Giả định tồn tại: tìm theo số điện thoại để lấy uid
  await api.findUser("0912953021").then(console.log).catch(console.error);
}

sendMessageByPhone().catch(console.error);
