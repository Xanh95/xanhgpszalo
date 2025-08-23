// bươc 1
// Nếu chưa có instance, tạo mới
if (!window.onlineViewData) {
    window.onlineViewData = new OnlineViewData();
    console.log("Đã tạo OnlineViewData mới");
}
// bước 2

// Nếu chưa có instance, tạo mới
if (!window.onlineViewData) {
    window.onlineViewData = new OnlineViewData();
    console.log("Đã tạo OnlineViewData mới");
}
// bước 3 
// Lấy danh sách xe
window.onlineViewData.getListVehicle();

// Lấy danh sách xe với protobuf
window.onlineViewData.getListVehicleProto(function(listVehicle) {
    console.log("Danh sách xe:", listVehicle);
});


// Tìm xe theo ID hoặc biển số
const vehicle = window.onlineViewData.listVehicle.find(v => 
    v.id === 485798
);
console.log("Xe tìm được:", vehicle);