import { Builder, By, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

async function run_binhanh(car) {
  // Cấu hình Firefox
  let options = new firefox.Options();
  // options.addArguments("--headless"); // Bỏ comment nếu muốn chạy ẩn

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
    // Đợi thêm để popup load hoàn toàn
    await driver.sleep(1000);
    console.log("✅ Trang đã load xong, tiếp tục...");
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

    let current_car = car;
    let binhanh = {
      "29H76446": "487452",
      "29H76366": "485798",
      "29H76494": "487423",
      "29LD31574": "476945",
      "29H76466": "489205",
      "29E15073": "633109",
    };

    let current_car_id = binhanh[current_car];

    // Chờ đến khi xe hiện ra và double click
    let row = await driver.wait(
      until.elementLocated(By.id(`tr_${current_car_id}`)),
      10000
    );
    // Đợi thêm để popup load hoàn toàn
    await driver.sleep(2000);
    await driver.executeScript(
      "document.querySelector('img.btn-close.btn-close-page').click();"
    );
    console.log("✅ Đã click nút close bằng JS");
    await driver.sleep(2000);
    await driver.executeScript(
      "document.querySelector('img.btn-close.btn-close-page').click();"
    );
    console.log("✅ Đã click nút close bằng JS");

    // click dup
    await driver.executeScript(
      "arguments[0].dispatchEvent(new MouseEvent('dblclick', {bubbles:true}));",
      row
    );
    await driver.sleep(4000);
    // click dup lần 2
    await driver.executeScript(
      "arguments[0].dispatchEvent(new MouseEvent('dblclick', {bubbles:true}));",
      row
    );
    console.log("✅ Đã double click vào xe, đang chờ popup...");
    // Đợi thêm để popup load hoàn toàn
    await driver.sleep(2000);
    await driver.executeScript(
      "document.querySelector('img.btn-close.btn-close-page').click();"
    );
    console.log("✅ Đã click nút close bằng JS");

    // let el = await driver.wait(until.elementLocated(By.id("Img8")), 10000);

    // // Scroll element vào view
    // await driver.executeScript("arguments[0].scrollIntoView(true);", el);

    // // Dùng JavaScript click (bỏ qua hạn chế interactable)
    // await driver.executeScript("arguments[0].click();", el);

    // console.log("✅ Đã click Img8 bằng JS");
    // // Đợi thêm để popup load hoàn toàn
    // await driver.sleep(1000);

    // Chờ popup hiện ra (Leaflet popup)
    let popup = await driver.wait(
      until.elementLocated(By.css(".leaflet-popup-content-wrapper")),
      15000
    );
    console.log("✅ Popup đã xuất hiện");

    // Chụp ảnh toàn trang (bao gồm popup)
    let image = await popup.takeScreenshot();
    import("fs").then((fs) =>
      fs.writeFileSync("Bao_cao_xe.png", image, "base64")
    );
    console.log("✅ Đã lưu ảnh popup thành Bao_cao_xe.png");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await driver.quit();
  }
}

export { run_binhanh };
run_binhanh("29H76446");
