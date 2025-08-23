import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

opts = Options()
# opts.add_argument("--headless")

driver = webdriver.Firefox(options=opts)
# Chỉnh kích thước cửa sổ 1920x1080
driver.set_window_size(1920, 1080)

driver.get("https://quanlyxe.vn/")

# Chờ tối đa 10 giây cho ô tìm kiếm xuất hiện
search_username = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "UserName"))
)
print("Đã tìm kiếm xong!")

inp_pas = driver.find_element(By.NAME, "Password")
inp_login = driver.find_element(By.NAME, "login")
search_username.send_keys("hoaphat")
inp_pas.send_keys("hpl2021")
time.sleep(0.5)
inp_login.click()

current_car = '29ld31377'
vietmap = {'29ld31538' :'210002',
           '29h95648': '180285',
           '29ld31356': '212968',
           '29ld31377': '231347',
           }
#id biển xe hiện tại
current_car_id = vietmap[current_car]
# Sau khi login, chờ trang load xong lần nữa
WebDriverWait(driver, 10).until(
    lambda d: d.execute_script("return document.readyState") == "complete"
)

# Chờ đến khi window.statuses["vec_210002"] khác None data 4h 10h 48h
value = WebDriverWait(driver, 10).until(
    lambda d: d.execute_script(
    f'return window.statuses && window.statuses["vec_{current_car_id}"] !== undefined ? window.statuses["vec_{current_car_id}"] : null;')
)

print(f"Giá trị của vec_{current_car}:", value[16])

# Đợi phần tử xuất hiện và click
row = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.ID, f"vec{current_car_id}"))
)
driver.execute_script("arguments[0].click();", row)

popup = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CSS_SELECTOR,
        ".ol-popup.default.ol-popup-bottom.ol-popup-center.hasclosebox.shadow.visible"))
)

# Chụp ảnh phần tử popup
popup.screenshot("Bao_cao_xe.png")
print("✅ Đã lưu ảnh popup thành popup.png")
driver.quit()
