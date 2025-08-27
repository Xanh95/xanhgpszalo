import { Zalo, ThreadType } from "zca-js";
import { run_vietmap } from "./vietmap.js";
import { run_binhanh } from "./binhanh.js";
import path from "path";
import { Builder, By, Key, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import fs from "node:fs/promises";

// biến
const WARN_FILE = path.resolve("./warn_records.json");
const vietmap = {
  "29LD31538": "210002",
  "29H95648": "180285",
  "29LD31356": "212968",
  "29LD31377": "231347",
};

// Object chứa thông tin biển số từ danh_sach_xe.json
const binhanh = {
  "29H76446": "487452",
  "29H76366": "485798",
  "29H76494": "487423",
  "29LD31574": "476945",
  "29H76466": "489205",
  "29E15073": "633109",
};
const zalo_id = {
  "29ld31538": "2370540463748680495",
  "29h95648": "2015333738208895549",
  "29ld31356": "1802702973168669646",
  "29ld31377": "1907412626625801394",
  "29h76446": "1244389568543071118",
  "29h76366": "3061263053099966385",
  "29h76494": "7160192846130148244",
  "29ld31574": "1086903675994133727",
  "29e38191": "3709510548480395184",
  "29h76466": "8687757462246139739",
  "29e15073": "2846795138633328715",
};
// const zalo_id = {
//   "29LD31538": "8742505709139289241",
//   "29H95648": "8742505709139289241",
//   "29LD31356": "8742505709139289241",
//   "29LD31377": "8742505709139289241",
//   "29H76446": "8742505709139289241",
//   "29H76366": "8742505709139289241",
//   "29H76494": "8742505709139289241",
//   "29LD31574": "8742505709139289241",
//   "29E38191": "8742505709139289241",
//   "29H76466": "8742505709139289241",
//   "29E15073": "8742505709139289241",
// };
//  hàm lấy ngày trong tuần
function getWeekNumber(date) {
  // Clone date để tránh thay đổi object gốc
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  // Lấy thứ trong tuần (0=CN, 1=Thứ 2,...), chuẩn ISO bắt đầu từ Thứ 2
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}
// hàm lưu cảnh báo
async function loadWarningRecords() {
  try {
    const data = await fs.readFile(WARN_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {}; // nếu file chưa tồn tại, trả về object rỗng
  }
}

async function saveWarningRecords(records) {
  await fs.writeFile(WARN_FILE, JSON.stringify(records, null, 2));
}

async function saveWarningRecord(plate, type) {
  const records = await loadWarningRecords();
  const now = Date.now();

  if (!Array.isArray(records[plate])) {
    records[plate] = [{ time: now, type }];
  } else {
    const arr = records[plate];
    const last = arr[arr.length - 1];
    if (last.type === type) {
      last.time = now; // ghi đè thời gian
    } else {
      arr.push({ time: now, type }); // thêm mới
    }
  }

  // ⚡ LƯU LẠI RA FILE
  await saveWarningRecords(records);
}
// hàm gửi tin nhắn
async function sendTextToUser(api, uid, text) {
  await api.sendMessage(text, uid, ThreadType.User);
  console.log("Đã gửi cho UID:", uid);
}
// hàm format thời gian
function formatTimeFromSeconds(seconds) {
  if (seconds == null) return "N/A";
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = seconds % 60;
  return `${h} Giờ ${m} Phút ${s} Giây`;
}
// 👉 Hàm kiểm tra thời gian vietmap
async function check_time_vietmap(api) {
  // Cấu hình Firefox
  let options = new firefox.Options();
  options.addArguments("--headless"); // Bỏ comment nếu muốn chạy ẩn

  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();

  try {
    // Chỉnh cửa sổ 1920x1080
    // await driver.manage().window().setRect({ width: 1920, height: 1080 });

    // Mở trang web
    await driver.get("https://quanlyxe.vn/");

    // Chờ tối đa 10 giây cho ô nhập UserName
    let searchUsername = await driver.wait(
      until.elementLocated(By.name("UserName")),
      10000
    );
    console.log("Đã tìm thấy ô UserName!");

    let inpPas = await driver.findElement(By.name("Password"));
    let inpLogin = await driver.findElement(By.name("login"));

    await searchUsername.sendKeys("hoaphat");
    await inpPas.sendKeys("hpl2021");
    await driver.sleep(500); // time.sleep(0.5)
    await inpLogin.click();

    // Login xong rồi thì chờ trang load hoàn tất
    await driver.wait(async () => {
      let state = await driver.executeScript("return document.readyState");
      return state === "complete";
    }, 10000);
    // vòng lặp kiểm tra từng xe viet map

    for (let [plate, carId] of Object.entries(vietmap)) {
      try {
        // Lấy thông tin status. Chờ đến khi window.statuses["vec_xxx"] có giá trị
        let value = await driver.wait(async () => {
          return await driver.executeScript(
            `return window.statuses && window.statuses["vec_${carId}"] !== undefined 
                ? window.statuses["vec_${carId}"] 
                : null;`
          );
        }, 10000);

        if (!value) {
          console.log(`⚠️ Không lấy được dữ liệu cho xe ${plate}`);
          continue;
        }

        let continuous = value[16];
        let daily = value[17];
        let weekly = value[69];
        // continuous = 12600; // Giả sử giá trị này là 12600 giây (3.5 giờ)
        // daily = 28800; // Giả sử giá trị này là 28800 giây (8 giờ)
        // weekly = 165600; // Giả sử giá trị này là 165600 giây (46 giờ)

        console.log(`\n📌 Xe ${plate}:`);
        console.log(" - Lái liên tục:", formatTimeFromSeconds(continuous));
        console.log(" - Lái trong ngày:", formatTimeFromSeconds(daily));
        console.log(" - Lái trong tuần:", formatTimeFromSeconds(weekly));

        //  Kiểm tra quá giới hạn ontinuous > 14400 || daily > 36000 || weekly > 172800
        // Cảnh báo nếu lái liên tục quá 4 giờ
        if (continuous > 14400) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          if (Array.isArray(arr)) {
            const existing = arr.find(
              (kieu_vi_pham) => kieu_vi_pham.type === "over_4h"
            );
            if (
              existing !== undefined &&
              Date.now() - existing.time <= 14400 * 1000
            ) {
              console.log("Đã cảnh báo type 'over_4h' trước đó tại:");
            } else {
              console.log("Chưa từng cảnh báo 'over_4h' cho xe này.");
              await saveWarningRecord(plate, "over_4h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái liên tục quá 4 giờ!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin " thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'over_4h' cho xe:", plate);
            }
          } else {
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "over_4h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái liên tục quá 4 giờ!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin " thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'over_4h' cho xe:", plate);
          }
        }
        // Cảnh báo nếu lái trong ngày quá 10 giờ
        if (daily > 36000) {
          // 10h = 36000 giây
          const records = await loadWarningRecords();
          const arr = records[plate];

          if (Array.isArray(arr)) {
            const existing = arr.find(
              (kieu_vi_pham) => kieu_vi_pham.type === "over_10h"
            );

            if (
              existing !== undefined &&
              new Date(existing.time).toDateString() ===
                new Date().toDateString()
            ) {
              // Đã cảnh báo trong cùng 1 ngày
              console.log(
                "Đã cảnh báo type 'over_10h' cho xe này hôm nay tại:",
                new Date(existing.time).toLocaleString()
              );
            } else {
              // Chưa có hoặc khác ngày -> cảnh báo mới
              console.log("Chưa từng cảnh báo 'over_10h' cho xe này hôm nay.");
              await saveWarningRecord(plate, "over_10h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái trong ngày quá 10 giờ!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'over_10h' cho xe:", plate);
            }
          } else {
            // Chưa có record nào
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "over_10h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái trong ngày quá 10 giờ!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'over_10h' cho xe:", plate);
          }
        }
        // Cảnh báo nếu lái trong tuần quá 48 giờ
        if (weekly > 172800) {
          // 172800 giây = 48h
          const records = await loadWarningRecords();
          const arr = records[plate];
          const thisWeek = getWeekNumber(new Date());
          const thisYear = new Date().getFullYear();

          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "over_48h_week");
            if (
              existing !== undefined &&
              getWeekNumber(new Date(existing.time)) === thisWeek &&
              new Date(existing.time).getFullYear() === thisYear
            ) {
              console.log(
                `Đã cảnh báo 'over_48h_week' trong tuần ${thisWeek} rồi.`
              );
            } else {
              console.log(
                `Chưa cảnh báo 'over_48h_week' trong tuần ${thisWeek}.`
              );
              await saveWarningRecord(plate, "over_48h_week");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe quá 48 giờ trong tuần!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'over_48h_week' cho xe:", plate);
            }
          } else {
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "over_48h_week");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe quá 48 giờ trong tuần!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'over_48h_week' cho xe:", plate);
          }
        }
        // 46h = 165600 giây, 48h = 172800 giây
        if (weekly >= 165600 && weekly < 172800) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          const thisWeek = getWeekNumber(new Date());
          const thisYear = new Date().getFullYear();

          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "near_48h_week");
            if (
              existing !== undefined &&
              getWeekNumber(new Date(existing.time)) === thisWeek &&
              new Date(existing.time).getFullYear() === thisYear
            ) {
              console.log(
                `Đã cảnh báo 'near_48h_week' trong tuần ${thisWeek} rồi.`
              );
            } else {
              console.log(
                `Chưa cảnh báo 'near_48h_week' trong tuần ${thisWeek}.`
              );
              await saveWarningRecord(plate, "near_48h_week");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe gần 48 giờ (≥46h và <48h) trong tuần!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'near_48h_week' cho xe:", plate);
            }
          } else {
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "near_48h_week");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe gần 48 giờ (≥46h và <48h) trong tuần!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'near_48h_week' cho xe:", plate);
          }
        }

        // Gần 4h liên tục (>= 3h = 10800)
        if (continuous >= 12600 && continuous < 14400) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "near_4h");
            if (
              existing !== undefined &&
              Date.now() - existing.time <= 14400 * 1000
            ) {
              console.log(
                "Đã cảnh báo 'near_4h' cho xe này trong vòng 4 tiếng."
              );
            } else {
              console.log("Chưa cảnh báo 'near_4h' trong vòng 4 tiếng.");
              await saveWarningRecord(plate, "near_4h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe 3 tiếng gần 4h liên tục!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
            }
          } else {
            await saveWarningRecord(plate, "near_4h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe 3 tiếng gần 4h liên tục!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
          }
        }
        // Gần 10h trong ngày (>= 8h = 28800s, < 10h = 36000s)
        if (daily >= 28800 && daily < 36000) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "near_10h");
            if (
              existing &&
              new Date(existing.time).toDateString() ===
                new Date().toDateString()
            ) {
              console.log("Đã cảnh báo 'near_10h' cho xe này hôm nay.");
            } else {
              console.log("Chưa cảnh báo 'near_10h' hôm nay → gửi cảnh báo.");
              await saveWarningRecord(plate, "near_10h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe 8 tiếng gần 10h trong ngày!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
            }
          } else {
            await saveWarningRecord(plate, "near_10h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe 8 tiếng  gần 10h trong ngày!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
          }
        }
      } catch (err) {
        // console.error(`Lỗi khi kiểm tra xe ${plate}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    // ✅ luôn đóng Firefox khi xong
    await driver.quit();
  }
}

// 👉 Hàm kiểm tra thời gian binh anh
async function check_time_binhanh(api) {
  // Cấu hình Firefox
  let options = new firefox.Options();
  options.addArguments("--headless"); // Bỏ comment nếu muốn chạy ẩn

  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();

  try {
    // Chỉnh cửa sổ 1920x1080
    // await driver.manage().window().setRect({ width: 1920, height: 1080 });

    // Mở trang web
    await driver.get("https://gps.binhanh.vn/Default.aspx");

    // Chờ tối đa 10 giây cho ô nhập UserName
    let searchUsername = await driver.wait(
      until.elementLocated(By.name("UserLogin1$txtLoginUserName")),
      10000
    );
    console.log("Đã tìm thấy ô UserName!");

    let inpPas = await driver.findElement(
      By.name("UserLogin1$txtLoginPassword")
    );
    let inpLogin = await driver.findElement(By.name("UserLogin1$btnLogin"));

    await searchUsername.sendKeys("tvhoaphat");
    await inpPas.sendKeys("12341234");
    await driver.sleep(500);
    await inpLogin.click();

    console.log("✅ Đã đăng nhập, đang chờ trang load xong...");

    // Chờ trang load hoàn tất sau khi đăng nhập
    await driver.wait(async () => {
      let state = await driver.executeScript("return document.readyState");
      return state === "complete";
    }, 10000);

    console.log("✅ Trang đã load xong, tiếp tục...");
    await driver.sleep(4000);
    // Đợi thêm để popup load hoàn toàn
    await driver.sleep(2000);
    // Kiểm tra xem element có tồn tại trước khi click
    let closeBtn;
    try {
      closeBtn = await driver.wait(
        until.elementLocated(
          By.css("a.layui-layer-ico.layui-layer-close.layui-layer-close1")
        ),
        15000
      );

      // Nếu tìm thấy element, thực hiện click
      if (closeBtn) {
        await driver.executeScript(
          "document.querySelector('a.layui-layer-ico.layui-layer-close.layui-layer-close1').click();"
        );
        console.log("✅ Đã click nút đóng popup");
      }
    } catch (err) {
      console.log("⚠️ Không tìm thấy nút đóng popup, bỏ qua bước này.");
    }
    // vòng lặp kiểm tra từng xe binh anh
    // Lấy thông tin status. Chờ đến khi window.statuses["vec_xxx"] có giá trị
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

    for (let [plate, carId] of Object.entries(binhanh)) {
      try {
        // Tìm xe có id = 485798
        let value = listVehicle.find((v) => v.id === Number(carId));
        // console.log("Xe tìm được:", value);
        if (!value) {
          console.log(`⚠️ Không lấy được dữ liệu cho xe ${plate}`);
          continue;
        }

        let continuous = value.bgt.t_continus * 60;
        let daily = value.bgt.t_day * 60;
        let weekly = value.bgt.minute_week * 60;
        // continuous = 12600; // Giả sử giá trị này là 12600 giây (3.5 giờ)
        // daily = 28800; // Giả sử giá trị này là 28800 giây (8 giờ)
        // weekly = 165600; // Giả sử giá trị này là 165600 giây (46 giờ)

        console.log(`\n📌 Xe ${plate}:`);
        console.log(" - Lái liên tục:", formatTimeFromSeconds(continuous));
        console.log(" - Lái trong ngày:", formatTimeFromSeconds(daily));
        console.log(" - Lái trong tuần:", formatTimeFromSeconds(weekly));

        //  Kiểm tra quá giới hạn ontinuous > 14400 || daily > 36000 || weekly > 172800
        // Cảnh báo nếu lái liên tục quá 4 giờ
        if (continuous > 14400) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          if (Array.isArray(arr)) {
            const existing = arr.find(
              (kieu_vi_pham) => kieu_vi_pham.type === "over_4h"
            );
            if (
              existing !== undefined &&
              Date.now() - existing.time <= 14400 * 1000
            ) {
              console.log("Đã cảnh báo type 'over_4h' trước đó tại:");
            } else {
              console.log("Chưa từng cảnh báo 'over_4h' cho xe này.");
              await saveWarningRecord(plate, "over_4h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái liên tục quá 4 giờ!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin " thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'over_4h' cho xe:", plate);
            }
          } else {
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "over_4h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái liên tục quá 4 giờ!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin " thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'over_4h' cho xe:", plate);
          }
        }
        // Cảnh báo nếu lái trong ngày quá 10 giờ
        if (daily > 36000) {
          // 10h = 36000 giây
          const records = await loadWarningRecords();
          const arr = records[plate];

          if (Array.isArray(arr)) {
            const existing = arr.find(
              (kieu_vi_pham) => kieu_vi_pham.type === "over_10h"
            );

            if (
              existing !== undefined &&
              new Date(existing.time).toDateString() ===
                new Date().toDateString()
            ) {
              // Đã cảnh báo trong cùng 1 ngày
              console.log(
                "Đã cảnh báo type 'over_10h' cho xe này hôm nay tại:",
                new Date(existing.time).toLocaleString()
              );
            } else {
              // Chưa có hoặc khác ngày -> cảnh báo mới
              console.log("Chưa từng cảnh báo 'over_10h' cho xe này hôm nay.");
              await saveWarningRecord(plate, "over_10h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái trong ngày quá 10 giờ!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'over_10h' cho xe:", plate);
            }
          } else {
            // Chưa có record nào
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "over_10h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái trong ngày quá 10 giờ!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'over_10h' cho xe:", plate);
          }
        }
        // Cảnh báo nếu lái trong tuần quá 48 giờ
        if (weekly > 172800) {
          // 172800 giây = 48h
          const records = await loadWarningRecords();
          const arr = records[plate];
          const thisWeek = getWeekNumber(new Date());
          const thisYear = new Date().getFullYear();

          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "over_48h_week");
            if (
              existing !== undefined &&
              getWeekNumber(new Date(existing.time)) === thisWeek &&
              new Date(existing.time).getFullYear() === thisYear
            ) {
              console.log(
                `Đã cảnh báo 'over_48h_week' trong tuần ${thisWeek} rồi.`
              );
            } else {
              console.log(
                `Chưa cảnh báo 'over_48h_week' trong tuần ${thisWeek}.`
              );
              await saveWarningRecord(plate, "over_48h_week");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe quá 48 giờ trong tuần!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'over_48h_week' cho xe:", plate);
            }
          } else {
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "over_48h_week");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe quá 48 giờ trong tuần!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'over_48h_week' cho xe:", plate);
          }
        }
        // 46h = 165600 giây, 48h = 172800 giây
        if (weekly >= 165600 && weekly < 172800) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          const thisWeek = getWeekNumber(new Date());
          const thisYear = new Date().getFullYear();

          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "near_48h_week");
            if (
              existing !== undefined &&
              getWeekNumber(new Date(existing.time)) === thisWeek &&
              new Date(existing.time).getFullYear() === thisYear
            ) {
              console.log(
                `Đã cảnh báo 'near_48h_week' trong tuần ${thisWeek} rồi.`
              );
            } else {
              console.log(
                `Chưa cảnh báo 'near_48h_week' trong tuần ${thisWeek}.`
              );
              await saveWarningRecord(plate, "near_48h_week");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe gần 48 giờ (≥46h và <48h) trong tuần!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
              console.log("Đã gửi cảnh báo 'near_48h_week' cho xe:", plate);
            }
          } else {
            console.log("Chưa có record nào cho biển số này.");
            await saveWarningRecord(plate, "near_48h_week");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe gần 48 giờ (≥46h và <48h) trong tuần!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
            console.log("Đã gửi cảnh báo 'near_48h_week' cho xe:", plate);
          }
        }

        // Gần 4h liên tục (>= 3h = 10800)
        if (continuous >= 12600 && continuous < 14400) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "near_4h");
            if (
              existing !== undefined &&
              Date.now() - existing.time <= 14400 * 1000
            ) {
              console.log(
                "Đã cảnh báo 'near_4h' cho xe này trong vòng 4 tiếng."
              );
            } else {
              console.log("Chưa cảnh báo 'near_4h' trong vòng 4 tiếng.");
              await saveWarningRecord(plate, "near_4h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe 3 tiếng gần 4h liên tục!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
            }
          } else {
            await saveWarningRecord(plate, "near_4h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe 3 tiếng gần 4h liên tục!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
          }
        }
        // Gần 10h trong ngày (>= 8h = 28800s, < 10h = 36000s)
        if (daily >= 28800 && daily < 36000) {
          const records = await loadWarningRecords();
          const arr = records[plate];
          if (Array.isArray(arr)) {
            const existing = arr.find((r) => r.type === "near_10h");
            if (
              existing &&
              new Date(existing.time).toDateString() ===
                new Date().toDateString()
            ) {
              console.log("Đã cảnh báo 'near_10h' cho xe này hôm nay.");
            } else {
              console.log("Chưa cảnh báo 'near_10h' hôm nay → gửi cảnh báo.");
              await saveWarningRecord(plate, "near_10h");
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Xe ${plate} đã lái xe 8 tiếng gần 10h trong ngày!`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `Thời gian kiểm tra: ${new Date().toLocaleString()}`
              );
              await sendTextToUser(
                api,
                zalo_id[plate],
                `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
              );
            }
          } else {
            await saveWarningRecord(plate, "near_10h");
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Xe ${plate} đã lái xe 8 tiếng  gần 10h trong ngày!`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `Thời gian kiểm tra: ${new Date().toLocaleString()}`
            );
            await sendTextToUser(
              api,
              zalo_id[plate],
              `có thể xem thông tin thời gian lái xe bằng cách nhắn tin "thông tin xe ${plate}"`
            );
          }
        }
      } catch (err) {
        // console.error(`Lỗi khi kiểm tra xe ${plate}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    // ✅ luôn đóng Firefox khi xong
    await driver.quit();
  }
}

async function startSimpleAutoReply() {
  const zalo = new Zalo();
  const api = await zalo.loginQR();
  // Regex linh hoạt hơn để nhận diện biển số xe
  const regex = /\bthông\s*tin\s*xe\s+([0-9A-Za-z]+)\b/i;
  // check time trước 1 lần
  await check_time_vietmap(api);
  // check time trước 1 lần
  await check_time_binhanh(api);
  // Sau đó cứ 10 phút chạy lại
  setInterval(async () => {
    await check_time_vietmap(api);
  }, 10 * 60 * 1000);
  // Sau đó cứ 10 phút chạy lại
  setInterval(async () => {
    await check_time_binhanh(api);
  }, 10 * 60 * 1000);

  api.listener.on("message", async (message) => {
    if (
      message.type === ThreadType.User &&
      !message.isSelf &&
      typeof message.data.content === "string" && // Kiểm tra content là chuỗi
      message.data.content.includes("thông tin xe")
    ) {
      const current_car = message.data.content.match(regex);
      if (current_car && current_car[1]) {
        const originalPlate = current_car[1];
        const plate = originalPlate.toUpperCase(); // Chuẩn hóa về chữ hoa

        console.log(
          `📋 Biển số xe từ tin nhắn: "${originalPlate}" → Chuẩn hóa: "${plate}"`
        );

        // Kiểm tra biển số xe có hợp lệ không (ít nhất 5 ký tự)
        if (plate.length < 5) {
          console.log(`⚠️ Biển số xe quá ngắn: "${plate}"`);
          await api.sendMessage(
            {
              msg: `Biển số xe "${plate}" không hợp lệ. Vui lòng kiểm tra lại.`,
            },
            message.threadId,
            message.type
          );
          return;
        }

        // Kiểm tra biển số xe thuộc binhanh hay vietmap
        if (binhanh.hasOwnProperty(plate)) {
          console.log("Đã tìm thấy biển số xe trong binhanh:", plate);
          console.log("Với ID biển số xe:", binhanh[plate]);
          await run_binhanh(plate);
          await api
            .sendMessage(
              {
                msg: `Thời gian kiểm tra: ${new Date().toLocaleString()}`,
                attachments: [path.resolve("./Bao_cao_xe.png")],
              },
              message.threadId,
              message.type
            )
            .then(console.log)
            .catch(console.error);
        } else if (vietmap.hasOwnProperty(plate)) {
          console.log("Đã tìm thấy biển số xe trong vietmap:", plate);
          console.log("Với ID biển số xe:", vietmap[plate]);
          await run_vietmap(plate);
          await api
            .sendMessage(
              {
                msg: `Thời gian kiểm tra: ${new Date().toLocaleString()}`,
                attachments: [path.resolve("./Bao_cao_xe.png")],
              },
              message.threadId,
              message.type
            )
            .then(console.log)
            .catch(console.error);
        } else {
          console.log(`❌ Không tìm thấy biển số xe: "${plate}"`);
          console.log(`📋 Các biển số có sẵn trong hệ thống:`);
          console.log(`   • Binhanh: ${Object.keys(binhanh).join(", ")}`);
          console.log(`   • Vietmap: ${Object.keys(vietmap).join(", ")}`);

          await api.sendMessage(
            {
              msg: `Không tìm thấy thông tin cho biển số xe ${plate}. Vui lòng kiểm tra lại hoặc liên hệ admin.`,
            },
            message.threadId,
            message.type
          );
        }
      }
    } else if (message.type === ThreadType.User) {
      const {
        threadId,
        data: { content },
      } = message;
      console.log("📩 Có tin nhắn cá nhân mới:");
      console.log("  • Thời gian:", new Date().toLocaleTimeString());
      console.log("  • Nội dung:", message.data.content);
      console.log(
        "  • Từ:",
        message.sender ? message.sender.name : message.threadId
      );

      setTimeout(() => {
        api.sendMessage(
          {
            msg: `Hiện chương trình chỉ hỗ trợ nhắc khi chạy quá giờ hoặc sắp quá. Và Hỗ trợ kiểm tra nhanh thông tin xe vd kiểm tra xe 31538 thì nhắn tin với nội dung : " thông tin xe 29ld31538"`,
          },
          threadId,
          message.type
        );
      }, 2 * 60 * 1000); // đợi 2 phút rồi gửi
      console.log("📩 đã phản hồi tin nhắn");
    }
  });

  api.listener.start();
  console.log(
    "Bot đã lắng nghe tin nhắn cá nhân. Tự trả lời sau 5 phút nếu không có hành động tiếp."
  );
}

startSimpleAutoReply().catch(console.error);
