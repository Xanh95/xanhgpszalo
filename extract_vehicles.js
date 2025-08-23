const fs = require('fs');

// Đọc file ketquaninhanh.json
try {
    const data = fs.readFileSync('./ketquaninhanh.json', 'utf8');
    const vehicles = JSON.parse(data);
    
    console.log(`Tổng số xe: ${vehicles.length}`);
    console.log('='.repeat(60));
    
    // Trích xuất ID và biển số của tất cả xe
    const vehicleList = vehicles.map(vehicle => ({
        id: vehicle.id,
        plate: vehicle.plate,
        pri_code: vehicle.pri_code
    }));
    
    // Hiển thị danh sách
    vehicleList.forEach((vehicle, index) => {
        console.log(`${(index + 1).toString().padStart(3, '0')}. ID: ${vehicle.id.toString().padStart(8, ' ')} | Biển số: ${vehicle.plate.padEnd(15, ' ')} | Mã: ${vehicle.pri_code}`);
    });
    
    console.log('='.repeat(60));
    console.log(`Đã trích xuất ${vehicleList.length} xe`);
    
    // Lưu vào file CSV để dễ xem
    const csvContent = 'ID,Biển số,Mã riêng\n' + 
        vehicleList.map(v => `${v.id},${v.plate},${v.pri_code}`).join('\n');
    
    fs.writeFileSync('./danh_sach_xe.csv', csvContent, 'utf8');
    console.log('Đã lưu danh sách vào file: danh_sach_xe.csv');
    
    // Lưu vào file JSON để dễ sử dụng
    fs.writeFileSync('./danh_sach_xe.json', JSON.stringify(vehicleList, null, 2), 'utf8');
    console.log('Đã lưu danh sách vào file: danh_sach_xe.json');
    
} catch (error) {
    console.error('Lỗi:', error.message);
}
