const { Builder, By, Key, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

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
      "29ld31538": "210002",
      "29h95648": "180285",
      "29ld31356": "212968",
      "29ld31377": "231347",
    };

    let current_car_id = vietmap[current_car];

    // Chờ đến khi xe hiện ra và click
    let row = await driver.wait(
      until.elementLocated(By.id(`vec${current_car_id}`)),
      10000
    );
    await driver.executeScript("arguments[0].click();", row);

    // Chờ popup xuất hiện
    let popup = await driver.wait(
      until.elementLocated(
        By.css(
          ".ol-popup.default.ol-popup-bottom.ol-popup-center.hasclosebox.shadow.visible"
        )
      ),
      10000
    );

    // Chụp ảnh popup
    await popup.takeScreenshot().then(function (image, err) {
      require("fs").writeFileSync("Bao_cao_xe.png", image, "base64");
    });
    console.log("✅ Đã lưu ảnh popup thành Bao_cao_xe.png");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await driver.quit();
  }
}
module.exports.run_vietmap = run_vietmap;
