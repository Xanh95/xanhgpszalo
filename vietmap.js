import { Builder, By, Key, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

async function run_vietmap(car) {
  // Cấu hình Firefox
  let options = new firefox.Options();
  options.addArguments("--headless"); // Bỏ comment nếu muốn chạy ẩn

  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();

  try {
    // Chỉnh cửa sổ 1920x1080
    await driver.manage().window().setRect({ width: 1920, height: 1080 });

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

    let current_car = car;
    let vietmap = {
      "29LD31538": "210002",
      "29H95648": "180285",
      "29LD31356": "212968",
      "29LD31377": "231347",
    };

    let current_car_id = vietmap[current_car];

    // Chờ đến khi xe hiện ra và click
    let row = await driver.wait(
      until.elementLocated(By.id(`vec${current_car_id}`)),
      10000
    );
    await driver.executeScript("arguments[0].click();", row);
    console.log("✅ Đã click vào xe, đang chờ popup...");

    // Chờ popup xuất hiện
    let popup = await driver.wait(
      until.elementLocated(
        By.css(
          ".ol-popup.default.ol-popup-bottom.ol-popup-center.hasclosebox.shadow.visible"
        )
      ),
      15000
    );
    console.log("✅ Popup đã xuất hiện");
    
    // Đợi thêm để popup hoàn toàn load xong và ổn định vị trí
    await driver.sleep(2000);
    
    // Đợi cho đến khi popup có nội dung và không còn thay đổi
    await driver.wait(async () => {
        try {
            const content = await popup.getText();
            return content && content.length > 0;
        } catch {
            return false;
        }
    }, 5000);
    
    console.log("✅ Popup đã load hoàn toàn");

    // Chụp ảnh popup
    await popup.takeScreenshot().then(function (image, err) {
      import("fs").then(fs => fs.writeFileSync("Bao_cao_xe.png", image, "base64"));
    });
    console.log("✅ Đã lưu ảnh popup thành Bao_cao_xe.png");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await driver.quit();
  }
}

export { run_vietmap };
