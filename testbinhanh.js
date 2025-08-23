const { Builder, By, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

async function run() {
  let options = new firefox.Options();
  // options.addArguments("--headless"); // nếu muốn chạy ẩn
  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();

  try {
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

    // bước 1 + 2: tạo instance nếu chưa có
    await driver.executeScript(`
      if (!window.onlineViewData) {
          window.onlineViewData = new OnlineViewData();
          console.log("Đã tạo OnlineViewData mới");
      }
    `);

    // bước 3: gọi hàm lấy danh sách xe
    await driver.executeScript(`
      window.onlineViewData.getListVehicle();
    `);

    // gọi getListVehicleProto (có callback)
    let listVehicle = await driver.executeAsyncScript(function(callback) {
      window.onlineViewData.getListVehicleProto(function(list) {
        callback(list); // trả kết quả về NodeJS
      });
    });
    console.log("Danh sách xe:", listVehicle);

    // // tìm xe theo id
    // let vehicle = await driver.executeScript(`
    //   return window.onlineViewData.listVehicle.find(v => v.id === 485798);
    // `);
    // console.log("Xe tìm được:", vehicle);

  } finally {
    // đóng browser
    await driver.quit();
  }
}

run();

