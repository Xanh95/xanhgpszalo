const { Builder, By, Key, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

function formatTimeFromSeconds(seconds) {
  if (seconds == null) return "N/A";
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = seconds % 60;
  return `${h}Giờ ${m}Phút ${s}Giây`;
}
async function check_overtime(current_car) {
  let options = new firefox.Options();
  //   options.addArguments("--headless"); // chạy ẩn nếu cần

  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();
  let vietmap = {
    "29ld31538": "210002",
    "29h95648": "180285",
    "29ld31356": "212968",
    "29ld31377": "231347",
  };
  try {
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
    // let current_car_id = vietmap[current_car];
    let current_car_id = vietmap[current_car];

    // Login xong rồi thì chờ trang load hoàn tất
    await driver.wait(async () => {
      let state = await driver.executeScript("return document.readyState");
      return state === "complete";
    }, 10000);

    // Chờ đến khi window.statuses["vec_xxx"] có giá trị
    let value = await driver.wait(async () => {
      return await driver.executeScript(
        `return window.statuses && window.statuses["vec_${current_car_id}"] !== undefined 
            ? window.statuses["vec_${current_car_id}"] 
            : null;`
      );
    }, 10000);

    console.log(
      `Thời gian lái xe liên tục của xe vec_${current_car}:`,
      formatTimeFromSeconds(value[16])
    );
    console.log(
      `Thời gian lái xe trong ngày của xe vec_${current_car}:`,
      formatTimeFromSeconds(value[17])
    );
    console.log(
      `Thời gian lái xe trong tuần của xe vec_${current_car}:`,
      formatTimeFromSeconds(value[69])
    );
    console.log(`số lần quá tốc độ của xe vec_${current_car}:`, value[20]);
  } finally {
    await driver.quit();
  }
}

check_overtime("29ld31538");
