import { Zalo, ThreadType } from "zca-js";

async function runVietmap(plate) {
  // Giả định hàm này là bất đồng bộ và tạo báo cáo xe, rồi lưu ảnh Báo_cao_xe.png
  // Ví dụ:
  // await generateReportForPlate(plate);
  console.log(`[runVietmap] Report created for plate: ${plate}`);
}

async function startBot() {
  const zalo = new Zalo();
  const api = await zalo.loginQR();

  api.listener.on("message", async (message) => {
    // Chỉ xử lý nếu là nhận tin nhắn (danh thiếp) chứa userId
    if (message.type === ThreadType.User && !message.isSelf) {
      console.log(message);
    }
  });

  api.listener.start();
  console.log("Bot đang lắng nghe danh thiếp…");
}

startBot().catch(console.error);
