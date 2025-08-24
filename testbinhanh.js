import { Zalo, ThreadType } from "zca-js";
import { run_vietmap } from "./vietmap.js";
import { run_binhanh } from "./binhanh.js";
import path from "path";
import { Builder, By, Key, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import fs from "node:fs/promises";
const binhanh = {
  "29H76446": "487452",
  "29H76366": "485798",
  "29H76494": "487423",
  "29LD31574": "476945",
  "29H76466": "489205",
  "29E15073": "633109",
};
// hàm format thời gian
function formatTimeFromSeconds(seconds) {
  if (seconds == null) return "N/A";
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = seconds % 60;
  return `${h} Giờ ${m} Phút ${s} Giây`;
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
check_time_binhanh();
