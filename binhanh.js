const { Builder, By, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

let car = "29h76366"
async function run_binhanh(car) {
  // Cấu hình Firefox
  let options = new firefox.Options();
//   options.addArguments("--headless"); // Bỏ comment nếu muốn chạy ẩn

  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();

  try {
    // Chỉnh cửa sổ 1920x1080
    await driver.manage().window().setRect({ width: 1920, height: 1080 });

    // Mở trang web
    await driver.get("https://gps.binhanh.vn/Default.aspx");

    // Chờ tối đa 10 giây cho ô nhập UserName
    let searchUsername = await driver.wait(
      until.elementLocated(By.name("UserLogin1$txtLoginUserName")),
      10000
    );
    console.log("Đã tìm thấy ô UserName!");

    let inpPas = await driver.findElement(By.name("UserLogin1$txtLoginPassword"));
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

    let current_car = car;
    let binhanh = {
      "29h76366": "485798",
      "29h95648": "180285",
      "29ld31356": "212968",
      "29ld31377": "231347",
    };

    let current_car_id = binhanh[current_car];
    
    // Chờ đến khi xe hiện ra và double click
    let row = await driver.wait(
      until.elementLocated(By.id(`tr_${current_car_id}`)),
      10000
    );
    
    await driver.executeScript("arguments[0].dispatchEvent(new MouseEvent('dblclick', {bubbles:true}));", row);
    console.log("✅ Đã double click vào xe, đang chờ popup...");
    
    // Gọi API liên tục để lấy thông tin xe cho đến khi có giá trị
    console.log("🔄 Đang gọi API lấy thông tin xe...");
    
    let vehicleInfo = null;
    let retryCount = 0;
    const maxRetries = 10; // Tối đa 10 lần thử
    
    while (!vehicleInfo && retryCount < maxRetries) {
      try {
        retryCount++;
        console.log(`🔄 Lần thử ${retryCount}/${maxRetries}: Gọi API lấy thông tin xe...`);
        
        // Gọi API để lấy thông tin xe
        const response = await driver.executeScript(`
          return fetch('https://gps.binhanh.vn/HttpHandlers/OnlineHandler.ashx?method=detail&VehiclePlate=${current_car}&lng=107.645851&lat=16.406923&_=' + Date.now())
            .then(res => res.json())
            .catch(err => ({ success: "false", msg: err.message }));
        `);
        
        console.log("📡 API Response:", response);
        
        if (response.success === "true" && response.data) {
          vehicleInfo = response.data;
          console.log("✅ Lấy được thông tin xe từ API!");
          break;
        } else if (response.msg && response.msg.includes("Phiên làm việc hết thời gian")) {
          console.log("⚠️ Session hết hạn, đang thử lại...");
          // Đợi 1 giây trước khi thử lại
          await driver.sleep(1000);
        } else {
          console.log("❌ API trả về lỗi:", response.msg);
          // Đợi 2 giây trước khi thử lại
          await driver.sleep(2000);
        }
        
      } catch (e) {
        console.log(`❌ Lỗi lần thử ${retryCount}:`, e.message);
        await driver.sleep(2000);
      }
    }
    
    if (vehicleInfo) {
      console.log("📊 Thông tin thời gian lái xe từ API:");
      console.log(`- Biển số: ${vehicleInfo.plate || current_car}`);
      
      // Lấy thời gian lái xe (kiểm tra các trường có thể có)
      const t_continus = vehicleInfo.bgt?.t_continus || vehicleInfo.t_continus || 0;
      const t_day = vehicleInfo.bgt?.t_day || vehicleInfo.t_day || 0;
      const minute_week = vehicleInfo.minute_week || vehicleInfo.bgt?.minute_week || 0;
      
      console.log(`- Lái liên tục: ${t_continus} phút (${t_continus * 60} giây)`);
      console.log(`- Lái trong ngày: ${t_day} phút (${t_day * 60} giây)`);
      console.log(`- Lái trong tuần: ${minute_week} phút (${minute_week * 60} giây)`);
      
      // Kiểm tra vi phạm
      if (t_continus > 240) {
        console.log("⚠️ CẢNH BÁO: Lái xe quá 4 giờ liên tục!");
      }
      if (t_day > 600) {
        console.log("⚠️ CẢNH BÁO: Lái xe quá 10 giờ trong ngày!");
      }
      if (minute_week > 2880) {
        console.log("⚠️ CẢNH BÁO: Lái xe quá 48 giờ trong tuần!");
      }
    } else {
      console.log("❌ Không thể lấy thông tin xe sau", maxRetries, "lần thử");
    }
    
    // Đợi 500ms để popup xuất hiện
    await driver.sleep(500);
    
    // Chờ popup hiện ra (Leaflet popup)
    let popup = await driver.wait(
        until.elementLocated(By.css(".leaflet-popup-content-wrapper")),
        10000
    );
    
    console.log("✅ Popup đã xuất hiện");
    
    // Chụp ảnh toàn trang (bao gồm popup)
    let image = await popup.takeScreenshot();
    require("fs").writeFileSync("Bao_cao_xe.png", image, "base64");
    console.log("✅ Đã lưu ảnh popup thành Bao_cao_xe.png");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await driver.quit();
  }
}

module.exports.run_binhanh = run_binhanh;

// Gọi function để chạy code
run_binhanh(car).catch(console.error);
