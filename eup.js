import { Builder, By, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

async function run_eup(car) {
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
    await driver.get("https://www.ctms.vn/#elogin.html");

    // Chờ tối đa 10 giây cho ô nhập UserName
    let searchUsername = await driver.wait(
      until.elementLocated(By.id("user")),
      10000
    );
    console.log("Đã tìm thấy ô UserName!");
    let searchUsercompany = await driver.wait(
      until.elementLocated(By.id("com")),
      10000
    );
    let inpPas = await driver.findElement(By.id("password"));
    let inpLogin = await driver.findElement(By.id("signinBtn"));

    await searchUsername.sendKeys("qthoaphat");
    await searchUsercompany.sendKeys("qthoaphat");
    await inpPas.sendKeys("123456");
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

    let current_car = car;
    let eup = {
      "29E38191": "30093058",
    };
    current_car = "29E38191"; // ví dụ biển số
    let current_car_id = eup[current_car];

    // Chờ đến khi xe hiện ra và double click
    let row = await driver.wait(
      until.elementLocated(By.css(`tr[car_unicode="${current_car_id}"]`)),
      10000
    );
    // Đợi thêm để popup load hoàn toàn
    await driver.sleep(2000);
    // Chờ tối đa 15 giây đến khi element xuất hiện
    let closeBtn = await driver.wait(
      until.elementLocated(
        By.css("a.layui-layer-ico.layui-layer-close.layui-layer-close1")
      ),
      15000
    );

    // Sau đó click bằng executeScript
    await driver.executeScript(
      "document.querySelector('a.layui-layer-ico.layui-layer-close.layui-layer-close1').click();"
    );

    console.log("✅ Đã click nút đóng popup");
    console.log("✅ Đã click nút close bằng JS");
    await driver.sleep(2000);
    await driver.executeScript(
      "document.querySelector('i.fa.fa-close').click();"
    );
    console.log("✅ Đã click nút close bằng JS");

    await driver.executeScript("arguments[0].click();", row);
    console.log("✅ Đã click vào xe, đang chờ popup...");
    await driver.sleep(1000);
    let divBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//div[@role="button"][.//img[@src="https://maps.gstatic.com/mapfiles/transparent.png"]]'
        )
      ),
      10000
    );

    await divBtn.click();
    console.log("✅ Đã click vào div role=button có chứa img transparent.png");

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
      until.elementLocated(By.id("car-window-info")),
      15000
    );
    console.log("✅ Popup đã xuất hiện");
    await driver.sleep(3000);
    // Chụp ảnh toàn trang (bao gồm popup)
    let image = await popup.takeScreenshot();
    import("fs").then((fs) =>
      fs.writeFileSync("Bao_cao_xe.png", image, "base64")
    );
    console.log("✅ Đã lưu ảnh popup thành Bao_cao_xe.png");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    // await driver.quit();
  }
}

export { run_eup };
run_eup();
