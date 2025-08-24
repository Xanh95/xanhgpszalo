import { Builder, By, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

async function run() {
  let options = new firefox.Options();
  // options.addArguments("--headless"); // chạy ẩn nếu muốn

  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();

  try {
    // 👉 Mở trang web
    await driver.get("https://trang-web-cua-ban.com");

    // bước 1 + bước 2: tạo instance nếu chưa có
    await driver.executeScript(`
      if (!window.onlineViewData) {
          window.onlineViewData = new OnlineViewData();
          console.log("Đã tạo OnlineViewData mới");
      }
    `);

    // bước 3: gọi hàm lấy danh sách xe
    await driver.executeScript(`window.onlineViewData.getListVehicle();`);

    // Lấy danh sách xe (callback -> Promise để trả về Node)
    let listVehicle = await driver.executeAsyncScript(function (callback) {
      window.onlineViewData.getListVehicleProto(function (listVehicle) {
        callback(listVehicle); // trả kết quả về Node.js
      });
    });

    console.log("Danh sách xe:", listVehicle);

    // Tìm xe có id = 485798
    let vehicle = listVehicle.find((v) => v.id === 485798);
    console.log("Xe tìm được:", vehicle);
  } finally {
    // await driver.quit(); // đóng Firefox sau khi test
  }
}

run();
