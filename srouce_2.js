function documentReadyCallback() {
  $(".map-content").split({
    orientation: "vertical",
    limit: 170,
    position: "500px",
    percent: !0,
    onDrag: function () {
      window.map.updateSize();
    },
  });
  $(".status-vehicle").draggable({
    containment: "#map",
  });
  $(".control-center").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".history-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-driver-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-stop-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-overtime-driving-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-daily-driving-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-weekly-driving-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-lose-signal-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-expiredInspection").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-statistics-over-speed-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-overSpeed-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-road-over-speed-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".station-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".geofence-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".mdvr-photo-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".trailer-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-highway-speed-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $(".vehicle-traffic-violation-info").draggable({
    containment: "#map",
    handle: "span.header",
  });
  $("#table-vehicle").tableHeadFixer();
  $("#txtFromDate").datetimepicker({
    controlType: "select",
    format: "Y-m-d",
    lang: window.VMLANGUAGE,
    timepicker: !1,
    minDate: getUserWaypointTime(),
  });
  $("#txtToDate").datetimepicker({
    controlType: "select",
    format: "Y-m-d",
    lang: window.VMLANGUAGE,
    timepicker: !1,
    minDate: getUserWaypointTime(),
  });
  $("#txtFromTime").timepicker({
    showNowButton: !0,
    showCloseButton: !0,
  });
  $("#txtToTime").timepicker({
    showNowButton: !0,
    showCloseButton: !0,
  });
  $("#txtMdvrFromDate").datetimepicker({
    controlType: "select",
    format: "Y-m-d",
    lang: window.VMLANGUAGE,
    timepicker: !1,
    minDate: getUserWaypointTime(),
  });
  $("#txtMdvrToDate").datetimepicker({
    controlType: "select",
    format: "Y-m-d",
    lang: window.VMLANGUAGE,
    timepicker: !1,
    minDate: getUserWaypointTime(),
  });
  $("#txtMdvrFromTime").timepicker({
    showNowButton: !0,
    showCloseButton: !0,
  });
  $("#txtMdvrToTime").timepicker({
    showNowButton: !0,
    showCloseButton: !0,
  });
  initmap(initialization);
  closeMapTab();
  $("#searchStation").keyup(function (n) {
    n && searchStation(n);
  });
  $("#searchGeofence").keyup(function (n) {
    n && searchGeofence(n);
  });
  $("#searchTrailer").keyup(function (n) {
    n && searchTrailer(n);
  });
  $("#selectVehicle").select2();
  $("#selectVehicleMdvr").select2();
  window.getListRegistrationVehicle && window.getListRegistrationVehicle();
}
function getLayoutMonitor() {
  return $.post(
    Url.get("Monitor.aspx/GetMonitorLayout?id=1"),
    {},
    function (n) {
      let t = window.defaultGridColumn;
      n.Data && (t = window.JSON.parse(n.Data));
      t != null &&
        t.Val_1 &&
        (layoutGrid = t.Val_1?.length > 0 ? t.Val_1 : window.defaultGridColumn);
      const u = Array.from($("#table-vehicle .header")[0].children),
        i = [];
      u.forEach((n, t) => {
        if (t === 0) i.push(n);
        else {
          const t = layoutGrid.find((t) => t.field === n.className);
          if (!t) return;
          n.style.display = t.hidden ? "none" : "";
          i[t.Index + 1] = n;
        }
      });
      const r = $("#table-vehicle .header")[0];
      r.innerHTML = "";
      i.forEach((n) => {
        if (n.style.display !== "none") {
          const t = n.className || "";
          SENSORS[t] && (SENSORS[t].selected = !0);
          r.appendChild(n);
        }
      });
      showVehicleGrid();
      $("#vehicle-loading").remove();
    }
  );
}
function documentResizeCallback() {
  var n = $(window).height() - 80;
  n < 500 && (n = 500);
  $(".vehicle-wps").css("height", n - 75 + "px");
}
function initialization() {
  var u, n, i, r, f;
  window.setupMap();
  popup = new ol.Overlay.Popup({
    popupClass: "default",
    closeBox: !0,
    onclose: function () {
      removeCurrentPopupCallback();
    },
    positioning: "bottom-center",
    autoPan: !1,
    autoPanAnimation: {
      duration: 100,
    },
    offset: [0, 10],
  });
  popup.addPopupClass("shadow");
  window.myLocation = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style(),
    zIndex: 1001,
  });
  vehicleLayer = new ol.layer.Vector({
    type: MARKER_VEHICLE,
    source: new ol.source.Cluster({
      distance: 20,
      source: new ol.source.Vector(),
    }),
    style: createClusterIcon,
    zIndex: 1e3,
  });
  window.historyLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "rgba(0,60,136,.2)",
        width: 2,
      }),
    }),
  });
  tollgateLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style(),
    zIndex: 999,
  });
  trailerLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style(),
    zIndex: 1e3,
  });
  window.stationLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style(),
    zIndex: 997,
  });
  window.geofenceLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style(),
    zIndex: 996,
  });
  window.eventsLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style(),
    zIndex: 998,
  });
  window.geofencesLayerGroup = new ol.layer.Group({
    title: "Vùng",
    type: "overlay",
    layers: [geofenceLayer],
    visible: !1,
  });
  window.geofencesLayerGroup.on("propertychange", function (n) {
    n.target.getProperties().visible
      ? ($("#chkGeofence").prop("checked", !0), chkGeofence_Change())
      : ($("#chkGeofence").prop("checked", !1), chkGeofence_Change());
  });
  window.stationLayerGroup = new ol.layer.Group({
    title: "Điểm/trạm",
    type: "overlay",
    layers: [stationLayer],
    visible: !1,
  });
  window.stationLayerGroup.on("propertychange", function (n) {
    n.target.getProperties().visible
      ? ($("#chkStation").prop("checked", !0), chkStation_Change())
      : ($("#chkStation").prop("checked", !1), chkStation_Change());
  });
  u = new ol.layer.Group({
    title: "Lớp dữ liệu",
    layers: [
      new ol.layer.Group({
        title: "Xe",
        type: "overlay",
        layers: [vehicleLayer],
        visible: !0,
      }),
      new ol.layer.Group({
        title: "",
        type: "overlay",
        layers: [trailerLayer],
        visible: !0,
      }),
      new ol.layer.Group({
        title: "Lịch sử",
        type: "overlay",
        layers: [historyLayer],
        visible: !0,
      }),
      new ol.layer.Group({
        title: "Trạm thu phí",
        type: "overlay",
        layers: [tollgateLayer],
        visible: !1,
      }),
      window.stationLayerGroup,
      window.geofencesLayerGroup,
      new ol.layer.Group({
        title: "Sự kiện",
        type: "overlay",
        layers: [eventsLayer],
        visible: !0,
      }),
      new ol.layer.Group({
        title: "Điểm trung tâm",
        type: "overlay",
        layers: [myLocation],
        visible: !1,
      }),
    ],
    openInLayerSwitcher: !0,
  });
  window.map.addLayer(u);
  setupMylocation();
  window.map.on("moveend", function () {
    let n = window.myLocation.getSource().getFeatureById("center");
    n && n.setGeometry(new ol.geom.Point(window.map.getView().getCenter()));
  });
  let t = new ol.interaction.Select({
    layers: [vehicleLayer, stationLayer, tollgateLayer, trailerLayer],
    multi: !1,
    style: createClusterIcon,
  });
  window.map.addInteraction(t);
  t.getFeatures().on(["add"], function (n) {
    var t = n.element;
    if (t.getProperties().features)
      if (t.getProperties().features.length > 1)
        selectedVehicles(t.getProperties().features, !1);
      else
        switch (t.getProperties().features[0].getGeometryName()) {
          case MARKER_VEHICLE:
            selectedVehicle(t.getProperties().features[0].getId(), !1, !0);
            break;
          case MARKER_TOLLGATE:
            showTollgatePopup(tmp.data);
        }
    else
      t.getProperties().type == MARKER_STATION
        ? selectedStation(t.getProperties().id, !1)
        : t.getProperties().type == MARKER_TOLLGATE
        ? showTollgatePopup(t.getProperties().id, !1)
        : t.getProperties().type == MARKER_TRAILER &&
          showTrailerPopup(t.getProperties().data, "");
  });
  t.getFeatures().on(["remove"], function () {});
  window.map.getViewport().addEventListener("contextmenu", function (n) {
    n.preventDefault();
    let t = window.map.getEventCoordinate(n);
    var r = {
        x: n.pageX,
        y: n.pageY,
      },
      i = window.vehicleLayer.getSource().getClosestFeatureToCoordinate(t);
    return i ? (showContextMenuForMarker(i, r, t), !1) : !1;
  });
  window.map.addOverlay(popup);
  setupContextMenuForTable();
  setupContextMenuForVehicleRow();
  refresh();
  n = new ol.control.Bar();
  map.addControl(n);
  n.setPosition("top-right");
  i = new ol.control.Bar({
    toggleOne: !1,
    group: !1,
  });
  n.addControl(i);
  r = new ol.interaction.Draw({
    type: "Circle",
  });
  f = new ol.control.Toggle({
    html: '<i class="fa fa-map-marker-alt"></i>',
    title: "Add Point",
    interaction: r,
    active: !1,
    onToggle: function () {},
  });
  i.addControl(f);
  r.on("drawend", function (n) {
    var t = n.feature
        .getGeometry()
        .transform(descartesProjection, realProjection).flatCoordinates,
      i = new ol.geom.LineString([
        new ol.proj.fromLonLat([t[0], t[1]]),
        new ol.proj.fromLonLat([t[2], t[3]]),
      ]).getLength();
    addPoint(t[0], t[1], i.toFixed(0));
  });
  const e = getLocalStorage("monitor.sensorsDisplay");
  $("#chkShowSensors").prop("checked", JSON.parse(e));
  chkShowSensors_Change();
}
function setupMylocation() {
  var n = new ol.Feature({
    type: "Point",
    geometry: new ol.geom.Point(map.getView().getCenter()),
  });
  n.setId("center");
  n.setStyle(
    new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0, 0],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        src: window.urlVehicleStatus + "my_location.svg",
        opacity: 0.5,
      }),
    })
  );
  myLocation.getSource().addFeatures([n]);
}
function setTimerStatus() {
  $("#timer-status").html("" + window.timer--);
}
async function refresh() {
  if (USER_PASSWORD_EXPIRED) {
    alert(getLanguage("ERR_USER_PASSWORD_EXPIRED"));
    window.location.href = "/Account.aspx/LogOff";
    return;
  }
  setTimerStatus();
  setTimeout(refresh, 1e3);
  updateControlCenterTimer();
  timer < 0 &&
    ((timer = TIMER_INTERVAL),
    vehicleLoaded
      ? refreshStatus()
      : (await loadVehicles(),
        await getLayoutMonitor(),
        showSelectedSensors()));
  window.loadTopReminder && window.loadTopReminder();
  window.loadVehicleFields && window.loadVehicleFields();
}
function loadVehicles() {
  if (!vehicleLoaded)
    return (
      (vehicleLoaded = !0),
      $.post(Url.get("Monitor.aspx/VehicleList"), {}, function (n) {
        if (n) {
          for (var t = 1; t < n.length; t++)
            n[t][19] && n[t][19].length > 0 && (n[t][19] = n[t][19].split(",")),
              (vehicles["vec_" + n[t][0]] = n[t]);
          window.groupsVehicleTree = transformHierarchyGroup(n.slice(1));
          $("#selectVehicleGroup").combotree({
            prompt: getLanguage("vehiclegroup") || "Nhóm xe",
            editable: !0,
            onSelect: function (n) {
              n?.id
                ? ((currFilterVehicleGroupId = n?.id), searchVehicle(n?.id))
                : searchVehicle();
              isChangeMapByGroup = !0;
              refreshMaps();
              window.map
                .getView()
                .fit(vehicleLayer.getSource().getSource().getExtent(), {
                  size: window.map.getSize(),
                  padding: [100, 50, 100, 50],
                });
            },
            keyHandler: $.extend({}, $.fn.combotree.defaults.keyHandler, {
              query: function (n) {
                var i = this,
                  t = $.data(i, "combotree"),
                  r = t.options,
                  u = t.tree;
                t.remainText = !0;
                u.tree("doFilter", r.multiple ? n.split(r.separator) : n);
                u.tree("getSelected") || $(i).combotree("setValue", n);
              },
            }),
            formatter: function (n) {
              return `<i class="far fa-puzzle-piece"></i> ${n.text}`;
            },
          });
          $("#selectVehicleGroup").combotree("loadData", [
            allGroupSelect,
            ...formatDataSelection(window.groupsVehicleTree),
          ]);
        }
        vehicleStatusLoaded = !0;
        refreshStatus();
      }).fail(function () {
        vehicleLoaded = !1;
      })
    );
}
function refreshStatus() {
  ((listDriving48H = []),
  (listDriving10H = []),
  (listContinuousDriving4h = []),
  (listUnLoginDriver = []),
  (listStopOver2h = []),
  (listDeltaForStopOver2h = []),
  (listLoseSignal = []),
  (listOverSpeedByRoad = []),
  (listOverSpeedByVehicleType = []),
  (listStatOverSpeed = []),
  (listHighwaySpeed = []),
  (listVehicleTrafficViolation = []),
  vehicleStatusLoaded) &&
    ((vehicleStatusLoaded = !1),
    $.post(
      window.urlRefresh,
      {
        lastMod: lastMod,
      },
      function (n) {
        var i, t;
        if (((vehicleStatusLoaded = !0), n)) {
          if (
            ((i = lastMod),
            (lastMod = n.LastTime),
            (todayTime = n.Today),
            (nowTime = n.Now),
            (CITY_NAME = n.City),
            (t = 0),
            n.Regions)
          )
            for (t = 0; t < n.Regions.length; t++)
              regions[n.Regions[t][0]] = n.Regions[t][1];
          if (n.Drivers)
            for (t = 0; t < n.Drivers.length; t++)
              drivers[n.Drivers[t][0]] = n.Drivers[t];
          if ((n.Expired && (USER_PASSWORD_EXPIRED = !0), n.Data)) {
            for (t = 1; t < n.Data.length; t++) {
              const i = n.Data[t];
              i[1] >= todayTime &&
                nowTime - i[1] <= 300 &&
                i[4] > 0 &&
                (i[69] >= 158400 && listDriving48H.push(i),
                i[17] >= 32400 && listDriving10H.push(i),
                i[4] > 500 &&
                  i[16] >= 12600 &&
                  listContinuousDriving4h.push(i));
              i[1] >= todayTime &&
                i[33] == 0 &&
                i[4] > 500 &&
                listUnLoginDriver.push(i);
              let r = 0;
              i[15] > 0 && (r = nowTime - i[15]);
              let e = [15, 120];
              const u = vehicleFields?.[i[0]],
                o = "MONITOR.SETTING_IDLE_STOP";
              u && u?.[o] && (e = u?.[o].split(","));
              const [h, c] = e,
                l = i[4],
                s = getAcc(i),
                a = r >= h * 60 && s,
                v = r >= c * 60 && !s;
              l === 0 &&
                (a || v) &&
                i[1] >= todayTime &&
                (listStopOver2h.push(i), (listDeltaForStopOver2h[i[0]] = r));
              const f = i[27];
              f &&
                f.length > 0 &&
                f.forEach((n) => {
                  const t = i[1];
                  getAcc(i) &&
                    t - n?.GpsTime >= 300 &&
                    t >= todayTime &&
                    (listLoseSignal.push(i), listSensorLoseSignal.push(n));
                });
              i[1] >= todayTime && i[58] > 0 && listOverSpeedByRoad.push(i);
              i[1] >= todayTime &&
                i[37] > 0 &&
                listOverSpeedByVehicleType.push(i);
              i[1] >= todayTime && i[58] > 0 && listStatOverSpeed.push(i);
              i[1] >= todayTime &&
                i[75] &&
                i[4] < 6e3 &&
                listHighwaySpeed.push(i);
              statuses["vec_" + n.Data[t][0]] = n.Data[t];
            }
            refreshVehicleTrafficViolationStatus();
          }
          if (n.SensorTypes)
            for (t = 1; t < n.SensorTypes.length; t++)
              sensorTypes[n.SensorTypes[t][0]] = n.SensorTypes[t];
          updateVehicleTable();
          refreshMaps();
          i == 0 &&
            (vehicleLayer.getSource().getSource().getFeatures() &&
              (vehicleLayer.getSource().getSource().getFeatures().length > 1
                ? (window.map
                    .getView()
                    .fit(vehicleLayer.getSource().getSource().getExtent(), {
                      size: window.map.getSize(),
                      padding: [100, 50, 100, 50],
                    }),
                  window.map.getView().getZoom() == 21 &&
                    window.map.getView().setZoom(20))
                : (window.map
                    .getView()
                    .setCenter(
                      vehicleLayer
                        .getSource()
                        .getSource()
                        .getFeatures()[0]
                        ?.getGeometry()?.flatCoordinates
                    ),
                  window.map.getView().setZoom(18))),
            loadTollgates());
          currentPopupVehicle > 0 && monitorVehicle();
          updateControlCenterCounter();
          refreshVehicleStatus();
          window.displayVehicleBillingExpiredStatus &&
            window.displayVehicleBillingExpired &&
            ((window.displayVehicleBillingExpiredStatus = !1),
            window.displayVehicleBillingExpired());
        }
      }
    ).fail(function () {
      vehicleStatusLoaded = !0;
    }));
}
function refreshVehicleTrafficViolationStatus() {
  for (let n in statuses) {
    let t = statuses[n];
    t[78] > 0 && t[79] > 0 && listVehicleTrafficViolation.push(t);
  }
}
function refreshVehicleStatus() {
  var t = 0,
    i = 0,
    r = 0,
    u = 0,
    f = 0,
    e = 0,
    o = 0,
    s = 0,
    h = 0,
    c = 0,
    l = 0,
    a = 0,
    v = 0,
    y,
    n,
    p,
    w,
    b,
    k,
    d,
    g;
  for (y in statuses)
    (n = statuses[y]),
      n &&
        ((p = nowTime - n[1] <= 3600),
        p
          ? (n[33] ? t++ : i++,
            (w = nowTime - n[1]),
            (b = Math.floor(w / 60)),
            (16 & n[8]) > 0
              ? o++
              : (1 & n[8]) == 1
              ? ((k = getVehicleMaxSpeed(n)),
                n[4] > k ? e++ : n[4] >= 200 ? r++ : f++)
              : u++,
            n[58] == 3 ? l++ : n[58] == 4 ? a++ : n[58] >= 5 && v++,
            (d = n[6] >= 3 ? 1 : 0),
            (g = b <= 10 ? 1 : 0),
            d == 0 && h++,
            g && c++)
          : s++);
  $("#VehicleStatusDriver").html(t);
  $("#VehicleStatusNoDriver").html(i);
  $("#VehicleStatusRunning").html(r);
  $("#VehicleStatusStop").html(u);
  $("#VehicleStatusIdle").html(f);
  $("#VehicleStatusOverSpeed").html(e);
  $("#VehicleStatusWarning").html(o);
  $("#VehicleStatusLost").html(s);
  $("#VehicleStatusNoGPS").html(h);
  $("#VehicleStatusSending").html(c);
  $("#VehicleStatusOverSpeedThreeTimes").html(l);
  $("#VehicleStatusOverSpeedFourTimes").html(a);
  $("#VehicleStatusOverSpeedFiveTimes").html(v);
}
function showVehicleGrid() {
  var e = 0,
    t,
    f,
    s,
    u,
    n;
  switch (window.sortField) {
    case "Plate":
      e = 2;
      break;
    case "-Plate":
      e = -2;
      break;
    default:
      e = 2;
  }
  var o = [],
    i = [],
    r = [],
    h = 0;
  for (u in vehicles)
    (t = vehicles[u]),
      t &&
        (t[window.groupField]
          ? (o[t[window.groupField]] ||
              ((o[t[window.groupField]] = []), i.push(t[window.groupField])),
            o[t[window.groupField]].push(t))
          : r.push(t),
        h++);
  for (i.sort(), f = [], n = 0; n < i.length; n++)
    if (o[i[n]])
      for (
        s = o[i[n]],
          s.sort(sortbyIndex(e)),
          f.push({
            type: 1,
            text: i[n] + "(" + s.length + ")",
          }),
          u = 0;
        u < s.length;
        u++
      )
        f.push(s[u]);
  if (r.length > 0)
    for (
      f.push({
        type: 1,
        text: "******(" + r.length + ")",
      }),
        r.sort(sortbyIndex(e)),
        n = 0;
      n < r.length;
      n++
    )
      f.push(r[n]);
  $(".vehicles .vehicle").remove();
  showVehicleTable(f);
  $("#vehicleCounter").html("" + h);
  updateView();
}
function changeGroupView(n) {
  var t = n.target.options[n.target.selectedIndex].value;
  window.groupField = t;
  showVehicleGrid();
}
function showVehicleTable(n) {
  for (var t, f, r = -1, u = 0, i = 0; i < n.length; i++)
    (t = n[i]),
      t &&
        (t.type
          ? ($("#table-vehicle tbody").append(
              '<tr class="treegrid-' +
                ++r +
                '-0 vehicle vehicle-group"><td colspan="17">' +
                t.text +
                "</td></tr>"
            ),
            (u = 0))
          : ((f = $(".vehicle-info #vec" + t[0])),
            f.length == 0 && insertVehicleInfo(t, r, ++u)));
}
function insertVehicleInfo(n, t, i) {
  let r = "";
  layoutGrid.forEach((t, i) => {
    const u = layoutGrid.find((n) => n.Index == i);
    u &&
      !u.hidden &&
      (r += `<td ${u.hidden ? 'style="display:none;"' : ""} class="${
        u.field
      }"> ${t.field == "plate" ? n[1] : ""} </td>`);
  });
  $("#table-vehicle tbody").append(
    '<tr class="vehicle treegrid-' +
      t +
      "-" +
      i +
      " treegrid-parent-" +
      t +
      '-0" parent="treegrid-' +
      t +
      '-0" vehicle="' +
      n[0] +
      '" id="vec' +
      n[0] +
      '" onclick="selectedVehicle(' +
      n[0] +
      ',true, true)" title="' +
      n[1] +
      '"><td class="icon"><img src="' +
      getVehicleStatus(n) +
      '"/><i class="icon-lock" style="display: none;"></i></td>' +
      r +
      "</tr>"
  );
  $("#vec" + n[0]).bind("contextmenu", function (n) {
    n.x < 0 && (n.x = n.screenX);
    n.y < 0 && (n.x = n.screenY);
    var t = {
      x: n.pageX,
      y: n.pageY,
    };
    return showContextMenuForVehicleRow($(this).attr("vehicle"), t), !1;
  });
}
function updateView() {
  lastMod > 0 && updateVehicleTable();
}
function updateVehicleTable() {
  var p, t, u, i, f, o, s, h, c, l, y, a, n, w, v, r, e;
  SENSORS.door.selected && ((SENSORS.door.v1 = 0), (SENSORS.door.v2 = 0));
  SENSORS.power.selected && ((SENSORS.power.v1 = 0), (SENSORS.power.v2 = 0));
  SENSORS.airconditioner.selected &&
    ((SENSORS.airconditioner.v1 = 0), (SENSORS.airconditioner.v2 = 0));
  SENSORS.collision.selected &&
    ((SENSORS.collision.v1 = 0), (SENSORS.collision.v2 = 0));
  SENSORS.mixing.selected &&
    ((SENSORS.mixing.v1 = 0), (SENSORS.mixing.v2 = 0), (SENSORS.mixing.v3 = 0));
  for (p in statuses)
    if (((t = statuses[p]), t)) {
      u = vehicles["vec_" + t[0]];
      i = $("#vec" + t[0]);
      const p = t[39];
      if (
        (i.find(".icon .icon-lock").css("display", p ? "inline-block" : "none"),
        i.find(".plate").html(t[32]),
        p)
      )
        continue;
      if (i.length > 0) {
        if (
          (i.attr("title", t[7] + " " + getRegion(t[34])),
          i.find(".icon img").attr("src", getVehicleStatus(t)),
          i.find(".driver").html(getDriverName(t)),
          i.find(".mileage").html(t[9] / 100),
          i.find(".satellite").html(t[6]),
          i.find(".gpstime").html(formatDateTime(getTime(t[1]))),
          t[66])
        ) {
          const n =
            '<i class="fa fa-comment-alt-edit" style="color: green; font-size: 20px;" title="' +
            t[66] +
            '"></i>';
          i.find(".note").html(n);
        }
        if (
          ((f = i.find(".speed")),
          isSignalToday(t) &&
            (t[4] > 0
              ? (f.html(t[4] / 100),
                f.addClass("status-running"),
                f.removeClass("status-stop"))
              : (f.html(getStopTime(t)),
                f.removeClass("status-running"),
                f.addClass("status-stop"))),
          SENSORS.power.selected &&
            t &&
            u &&
            ((o = t[8] & 1),
            i
              .find(".power")
              .html(
                '<span class="power-status-' +
                  (o > 0 ? "on" : "off") +
                  '"></span>'
              ),
            (SENSORS.power.v1 += o > 0 ? 1 : 0),
            (SENSORS.power.v2 += o == 0 ? 1 : 0)),
          SENSORS.door.selected &&
            t &&
            u &&
            u[19] &&
            u[19].length > 0 &&
            u[19][1] > 0 &&
            ((s = t[8] & 2),
            i
              .find(".door")
              .html(
                '<span class="door-status-' +
                  (s > 0 ? "open" : "close") +
                  '"></span>'
              ),
            (SENSORS.door.v1 += s > 0 ? 1 : 0),
            (SENSORS.door.v2 += s == 0 ? 1 : 0)),
          SENSORS.airconditioner.selected &&
            t &&
            u &&
            u[19] &&
            u[19].length > 0 &&
            u[19][2] > 0 &&
            ((h = t[8] & 4),
            i
              .find(".airconditioner")
              .html(
                '<span class="airconditioner-status-' +
                  (h > 0 ? "on" : "off") +
                  '"></span>'
              ),
            (SENSORS.airconditioner.v1 += h > 0 ? 1 : 0),
            (SENSORS.airconditioner.v2 += h == 0 ? 1 : 0)),
          SENSORS.mifi.selected &&
            t &&
            t[56] == 29 &&
            ((c = getVehicleField(t[0], "AT38_MIFI") == "true" ? 1 : 0),
            i
              .find(".mifi")
              .html(
                '<span class="mifi-status-' +
                  (c > 0 ? "on" : "off") +
                  '"></span>'
              ),
            (SENSORS.mifi.v1 += c > 0 ? 1 : 0),
            (SENSORS.mifi.v2 += c == 0 ? 1 : 0)),
          SENSORS.collision.selected &&
            t &&
            u &&
            u[19] &&
            u[19].length > 0 &&
            u[19][10] > 0 &&
            ((l = t[8] & 1024),
            i
              .find(".collision")
              .html(
                '<span class="collision-status-' +
                  (l > 0 ? "on" : "off") +
                  '"></span>'
              ),
            (SENSORS.collision.v1 += l > 0 ? 1 : 0),
            (SENSORS.collision.v2 += l == 0 ? 1 : 0)),
          t && t[27] && t[27].length > 0)
        )
          for (y = 0, a = 0; a < t[27].length; a++)
            (n = t[27][a]),
              SENSORS.mixing.selected &&
                n.SensorTypeId == 16 &&
                ((w =
                  n.Value == 1 ? "mix" : n.Value == 2 ? "discharge" : "normal"),
                i
                  .find(".mixing")
                  .html('<span class="mixing-status-' + w + '"></span>'),
                (SENSORS.mixing.v1 += n.Value == 0 ? 1 : 0),
                (SENSORS.mixing.v2 += n.Value == 1 ? 1 : 0),
                (SENSORS.mixing.v3 += n.Value == 2 ? 1 : 0)),
              SENSORS.fuel.selected &&
                (n.SensorTypeId == 10 ||
                  n.SensorTypeId == 20 ||
                  n.SensorTypeId == 21 ||
                  n.SensorTypeId == 22 ||
                  n.SensorTypeId == 26 ||
                  n.SensorTypeId == 29 ||
                  n.SensorTypeId == 30 ||
                  n.SensorTypeId == 36 ||
                  n.SensorTypeId == 37 ||
                  n.SensorTypeId == 38 ||
                  n.SensorTypeId == 39 ||
                  n.SensorTypeId == 40 ||
                  n.SensorTypeId == 41 ||
                  n.SensorTypeId == 42 ||
                  n.SensorTypeId == 43 ||
                  n.SensorTypeId == 44 ||
                  n.SensorTypeId == 45 ||
                  n.SensorTypeId == 64 ||
                  n.SensorTypeId == 65) &&
                ((y += n.Value / 100),
                i.find(".fuel").html(accounting.formatNumber(y, 2))),
              SENSORS.temperature.selected &&
                (n.SensorTypeId == window.SENSOR_VALUE_TEMPERATURE ||
                n.SensorTypeId ==
                  window.SENSOR_VALUE_DAVITEQ_TEMPERATURE_SERIAL_BAUDRATE19200 ||
                n.SensorTypeId == 19 ||
                n.SensorTypeId == 27 ||
                n.SensorTypeId == 28 ||
                n.SensorTypeId == 33 ||
                n.SensorTypeId == 46 ||
                n.SensorTypeId == 47 ||
                n.SensorTypeId == 48 ||
                n.SensorTypeId == 49 ||
                n.SensorTypeId == 50 ||
                n.SensorTypeId == 51 ||
                n.SensorTypeId == 52 ||
                n.SensorTypeId == 53 ||
                n.SensorTypeId == 54 ||
                n.SensorTypeId == 55 ||
                n.SensorTypeId == 71
                  ? i.find(".temperature").html("T:" + n.Value / 100 + "°C")
                  : n.SensorTypeId ==
                    window.SENSOR_VALUE_PNTECH_TEMPERATURE_HUMIDITY_SERIAL_BAUDRATE9600
                  ? n.Data &&
                    ((v = JSON.parse(n.Data)),
                    v &&
                      i
                        .find(".temperature")
                        .html("T:" + v.T / 100 + "°C - H:" + v.H / 100 + "%"))
                  : n.SensorTypeId == 18 ||
                    n.SensorTypeId == 34 ||
                    n.SensorTypeId == 35 ||
                    n.SensorTypeId == 72
                  ? n.Data &&
                    ((r = JSON.parse(n.Data)),
                    r &&
                      i
                        .find(".temperature")
                        .html(
                          "T1:" + r.T1 / 100 + "°C - T2:" + r.T2 / 100 + "°C"
                        ))
                  : n.SensorTypeId == 73
                  ? n.Data &&
                    ((r = JSON.parse(n.Data)),
                    r &&
                      i
                        .find(".temperature")
                        .html(
                          "T1:" +
                            r.T1 / 100 +
                            "°C - T2:" +
                            r.T2 / 100 +
                            "°C - T3:" +
                            r.T3 / 100 +
                            "°C"
                        ))
                  : n.SensorTypeId == 74 &&
                    n.Data &&
                    ((r = JSON.parse(n.Data)),
                    r &&
                      i
                        .find(".temperature")
                        .html(
                          "T1:" +
                            r.T1 / 100 +
                            "°C - T2:" +
                            r.T2 / 100 +
                            "°C - T3:" +
                            r.T3 / 100 +
                            "°C - T4:" +
                            r.T4 / 100 +
                            "°C"
                        )));
        i.find(".address").html(t[7] + " " + getRegion(t[34]));
        t[34] > 0
          ? i.find(".district").html(getDistrict(t[34]))
          : ((e = t[7].split(",")),
            i
              .find(".district")
              .html(e[e.length > 2 ? e.length - 2 : e.length - 1]));
      }
    }
  SENSORS.door.selected &&
    ($("#VehicleDoorOpenCounter").html(SENSORS.door.v1),
    $("#VehicleDoorCloseCounter").html(SENSORS.door.v2));
  SENSORS.power.selected &&
    ($("#VehiclePowerOnCounter").html(SENSORS.power.v1),
    $("#VehiclePowerOffCounter").html(SENSORS.power.v2));
  SENSORS.airconditioner.selected &&
    ($("#VehicleAirConditionerOnCounter").html(SENSORS.airconditioner.v1),
    $("#VehicleAirConditionerOffCounter").html(SENSORS.airconditioner.v2));
  SENSORS.collision.selected &&
    ($("#VehicleCollisionOnCounter").html(SENSORS.collision.v1),
    $("#VehicleCollisionOffCounter").html(SENSORS.collision.v2));
  SENSORS.mixing.selected &&
    ($("#VehicleMixingNormalCounter").html(SENSORS.mixing.v1),
    $("#VehicleMixingMixCounter").html(SENSORS.mixing.v2),
    $("#VehicleMixingDischargeCounter").html(SENSORS.mixing.v3));
}
function getStopTime(n) {
  return n[4] == 0 ? Util.date.formatTimeFromSeconds(nowTime - n[15]) : "";
}
function getDriverName(n) {
  if (n && n[33]) {
    var t = drivers[n[33]];
    if (t) return formatString(t[1]);
  }
  return "";
}
function getContainerObj(n) {
  var r = {
      ContainerId: "",
      Serial: "",
    },
    i,
    t;
  return (
    n &&
      n[33] &&
      ((i = drivers[n[33]]),
      i != null &&
        i.length > 0 &&
        ((t = formatString(i[1]).split("-")),
        t.length > 0 && (r.ContainerId = t[0]),
        t.length > 1 && (r.Serial = t[1]))),
    r
  );
}
function getDriverPhone(n) {
  if (n && n[33]) {
    var t = drivers[n[33]];
    if (t) return formatString(t[2]);
  }
  return "";
}
function getDriverLicenseNo(n) {
  if (n && n[33]) {
    var t = drivers[n[33]];
    if (t) return formatString(t[3]);
  }
  return "";
}
function getDriverLicenseExpireDate(n) {
  if (n && n[33]) {
    var t = drivers[n[33]];
    if (t && t[4] > 0) return Util.date.formatDate3(t[4]);
  }
  return "";
}
function getVehicleTypeName(n) {
  return n[6] ? n[6] : "Chưa Phân Loại";
}
function getVehicleMaxSpeed(n) {
  if (SENSORS.road.selected && n[52] > 0) return n[52];
  var t = n[31];
  return t <= 0 && (t = 8e3), t;
}
function getVehicleMaxSpeedOnRoad(n) {
  if (n[52] > 0) return n[52];
}
function getMaxSpeedVehicle(n) {
  var t = n[31];
  return t <= 0 && (t = 8e3), t;
}
function getVehicleSpeedType() {
  return SENSORS.road.selected
    ? getLanguage("monitor.SpeedType.RoadSpeed")
    : getLanguage("monitor.SpeedType.VehicleType");
}
function getRoadName(n, t) {
  return SENSORS.road.selected && t[52] > 0
    ? t[54]
    : getVehicleTypeName(n) + (n[5] ? "(" + n[5] + ")" : "");
}
function showHideVehicleGridColumn(n, t) {
  t &&
    ((SENSORS[n].selected = !SENSORS[n].selected),
    showSelectedSensors(),
    SENSORS[n].selected && (window.timer = 0));
}
function removeCurrentPopupCallback() {
  currentPopupVehicle = 0;
  $("#table-vehicle .row-active").removeClass("row-active");
}
function selectedVehicles(n, t) {
  var f = $(".vehicle-cluster table"),
    r,
    i,
    e,
    u;
  for (f.html(""), r = [0, 0, 0, 0], i = 0, i = 0; i < n.length; i++)
    (e = vehicles["vec_" + n[i].getId()]),
      (u = statuses["vec_" + n[i].getId()]),
      e &&
        u &&
        (n[i].getGeometry().getExtent() &&
          (r[0] > n[i].getGeometry().getExtent()[0] &&
            (r[0] = n[i].getGeometry().getExtent()[0]),
          r[1] > n[i].getGeometry().getExtent()[1] &&
            (r[1] = n[i].getGeometry().getExtent()[1]),
          r[2] < n[i].getGeometry().getExtent()[2] &&
            (r[2] = n[i].getGeometry().getExtent()[2]),
          r[3] < n[i].getGeometry().getExtent()[3] &&
            (r[3] = n[i].getGeometry().getExtent()[3])),
        f.append(
          '<tr onclick="selectedVehicle(' +
            u[0] +
            ', true, true); "><td class="column1"><img src="' +
            getVehicleStatus(u) +
            '" /></td><td>' +
            u[32] +
            "</td></tr>"
        ));
  $("#vehicle-cluster-counter").html(i);
  t &&
    window.map.getView().fit(r, {
      size: window.map.getSize(),
      padding: [100, 50, 50, 50],
      duration: 1e3,
    });
  $(".vehicle-cluster").slideDown();
}
function selectedVehicle(n, t, i, r) {
  var f, u, s, l, e, h, o, c;
  if (
    (window.removeCurrentPopup(),
    $("#vec" + n).addClass("row-active"),
    (f = window.vehicles["vec_" + n]),
    (u = window.statuses["vec_" + n]),
    f)
  ) {
    if (
      ((selectVehicle = n), $("#selectVehicle").val(n).trigger("change"), u[39])
    )
      return (
        (s = !0),
        window.SUPPORT_COMPANY && window.SUPPORT_COMPANY.Id > 0 && (s = !1),
        s &&
          (window.SUPPORT_COMPANY = {
            Id: 1,
            Name: "Cty Cổ Phần Ứng Dụng Bản Đồ Việt",
            Address: "Số 3 Trần Nhân Tôn, P. An Đông, TP. HCM, Việt Nam",
            ContactPhone: "1900 633 378",
            ContactName: "",
          }),
        vehicleLocked(f[1])
      );
    i && loadMdvrRealTime(n);
  }
  if (f && u)
    $("#vehicle-speed-value").html(u[4] / 100),
      $("#road-speed-value").html(getVehicleMaxSpeed(u) / 100),
      $("#road-name").html(getVehicleSpeedType() + ": " + getRoadName(f, u)),
      (currentPopupVehicle = n),
      (l = 400),
      (e = 400),
      f[8] || (e -= 15),
      (u[27] == null || u[27].length == 0) && (e -= 15),
      u[15] == null && u[15] == null && (e -= 15),
      u[7].length < 50 && (e -= 15),
      u[11] == 0 && u[12] == 0 && (e -= 15),
      (h = new ol.proj.fromLonLat([u[2] / 1e6, u[3] / 1e6])),
      window.map.getView().setCenter(h),
      t &&
        ((o = map.getView().getZoom()),
        o < 13 && (o = 18),
        window.map.getView().setZoom(o),
        window.map.updateSize()),
      (c = ""),
      (c =
        f[24] == 15
          ? window.getContainerInfo(u, f)
          : u[27] != null && u[27].length > 0 && u[27][0].SensorTypeId == 69
          ? window.universalSensor(u, f)
          : window.getVehicleInfo(u, f)),
      popup.show(h, c),
      toogleTabEvent &&
        ((toogleTabEvent = !1), (mapTabStatus = !1), closeMapTab(!1)),
      mapTabStatus && refreshVehicleLog(u, i, r),
      window.displayVehicleMIFIStatus && window.displayVehicleMIFIStatus(u);
  else return;
}
function monitorVehicle() {
  var r = window.vehicles["vec_" + currentPopupVehicle],
    n = window.statuses["vec_" + currentPopupVehicle],
    t,
    i;
  r &&
    n &&
    ((t = new ol.proj.fromLonLat([n[2] / 1e6, n[3] / 1e6])),
    (i = !1),
    checkExtent(map.getView().calculateExtent(map.getSize()), t[0], t[1]) ||
      (i = !0),
    selectedVehicle(currentPopupVehicle, i, !0, !0));
}
function checkExtent(n, t, i) {
  return n[0] <= t && t <= n[2] && n[1] <= i && i <= n[3];
}
function selectVehicleDriving4HCallback(n) {
  selectedVehicle(n, !0, !0, !1);
}
function selectVehicleDriving10HCallback(n) {
  selectedVehicle(n, !0, !0, !1);
}
function ShowMap(n, t) {
  window.open(
    "https://maps.google.com/maps?q=" +
      t / 1e6 +
      "," +
      n / 1e6 +
      "&iwloc=A&output=embed",
    "map",
    "height=500,width=500"
  );
}
function shareLocation(n, t) {
  window.open(n, t, "height=600,width=720");
}
function closeMapTab(n) {
  mapTabStatus
    ? ((mapTabStatus = !1),
      $("#mapTab ul").addClass("hide"),
      $("#mapTab div").addClass("hide"),
      $("#mapTab .close-box i").addClass("icon-up-arrow"))
    : ((mapTabStatus = !0),
      $("#mapTab .close-box i").removeClass("icon-up-arrow"),
      $("#mapTab ul").removeClass("hide"),
      $("#mapTab div").removeClass("hide"),
      n &&
        currentPopupVehicle > 0 &&
        selectedVehicle(currentPopupVehicle, !1, !0, !0));
}
function refreshVehicleLog(n, t, i) {
  var u = !1,
    r = !1,
    f;
  n[30] > 0 && (u = !0);
  n[27] && n[27].length > 0 && (r = !0);
  f = t;
  t &&
    ($("#mapTabs li").removeClass("active"),
    $("#mapTabs li").removeClass("hide"),
    $("#mapTab .tab-content").css("display", "none"),
    u
      ? ($("#VehicleImage").attr("src", n[35]),
        $("#VehicleImage").attr("VehicleId", n[0]),
        $("#VehicleImage").attr("ImageTime", n[30]),
        $("#imgTPlate").html(n[32]),
        $("#imgTDate").html(formatDateTime(getTime(n[30]))),
        t &&
          ($("#liImage").addClass("active"),
          $("#tbImage").css("display", ""),
          (t = !1)))
      : $("#liImage").addClass("hide"),
    r
      ? t &&
        ($("#liGraph").addClass("active"),
        $("#tbGraph").css("display", ""),
        (t = !1))
      : $("#liGraph").addClass("hide"),
    !0 &&
      t &&
      ($("#liEvent").addClass("active"),
      $("#tbEvent").css("display", ""),
      (t = !1)));
  f && (removeEventPopup(), loadVehicleLog(n[0]));
  i ? loadVehicleChartCounter++ : (loadVehicleChartCounter = 30);
  r && loadVehicleChart(n);
}
function monitor(n) {
  window.open(
    Url.get("Monitor3.aspx/Vehicle/") + n,
    "",
    "height=500,width=700"
  );
}
function VehicleTrackingFeedback(n) {
  const t = Url.get("Monitor.aspx/VehicleTrackingFeedback/" + n);
  openFancyboxByIframe(t, {
    height: "430px",
  });
}
function WriteDriverCard(n) {
  Fancybox.show([
    {
      src: Url.get("Monitor.aspx/WriteDriverCard/" + n),
      type: "iframe",
      width: 400,
    },
  ]);
}
function CreateLocator(n) {
  Fancybox.show([
    {
      src: Url.get("Monitor.aspx/CreateLocator/" + n),
      type: "iframe",
      width: 650,
    },
  ]);
}
function CreateVehicleLoginCode(n) {
  Fancybox.show([
    {
      src: Url.get("Monitor.aspx/CreateVehicleLoginCode/" + n),
      type: "iframe",
      width: 650,
    },
  ]);
}
function LogInOutDriver(n) {
  openFancyboxByIframe(Url.get("Monitor.aspx/LogInOutDriver/" + n), {
    width: "400px",
    height: "220px",
  });
}
function showUpdateRemark(n) {
  Fancybox.show([
    {
      src: Url.get("Monitor.aspx/UpdateRemark/" + n),
      type: "iframe",
      width: 400,
    },
  ]);
}
function SendAlertDrivingTimeHooter(n) {
  const t = window.confirm(
    getLanguage("monitor.ConfirmAlertDrivingTimeHooter")
  );
  t &&
    $.ajax({
      url: "/Monitor/AlertDrivingTimeHooter",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        id: n,
      }),
      dataType: "json",
      success: function (n) {
        n.success
          ? alert(getLanguage("monitor.AlertHooter10sSuccess"))
          : alert(getLanguage("updatefailed"));
      },
      error: function () {
        alert(getLanguage("monitor.NoPermission"));
      },
    });
}
function TurnOnOffHooter(n, t) {
  if (typeof t == "undefined" || t === "") {
    alert(getLanguage("monitor.HooterNotSupported"));
    return;
  }
  t = String(t);
  let i;
  t === "1"
    ? (i = window.confirm(getLanguage("monitor.ConfirmTurnOffHooter")))
    : t === "0" &&
      (i = window.confirm(getLanguage("monitor.ConfirmTurnOnHooter")));
  i &&
    $.ajax({
      url: "/Monitor/TurnOnOffHooter",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        id: n,
        hooterStatus: parseInt(t),
      }),
      dataType: "json",
      success: function (n) {
        n.success
          ? alert(getLanguage("updatesuccess"))
          : alert(getLanguage("updatefailed"));
      },
      error: function () {
        alert(getLanguage("monitor.NoPermission"));
      },
    });
}
function WritePlateToImage(n) {
  const t = window.confirm(getLanguage("monitor.ConfirmWritePlateToImage"));
  t &&
    $.ajax({
      url: "/Monitor/WritePlateToImage",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        id: n,
      }),
      dataType: "json",
      success: function (n) {
        n.success
          ? alert(getLanguage("updatesuccess"))
          : alert(getLanguage("updatefailed"));
      },
      error: function () {
        alert(getLanguage("monitor.NoPermission"));
      },
    });
}
function closePupopSendDeviceError() {
  closeFancybox();
}
function isSignalToday(n) {
  return n ? n[1] >= todayTime : !1;
}
function createClusterIcon(n) {
  var t = n.get("features"),
    u,
    r,
    i,
    f,
    e;
  return t
    ? (t.length == 1
        ? (style = getStyleVehicleLayer(t[0].getId()))
        : t.length > 1 &&
          ((u = t.length < 10 ? "medium" : "large"),
          (style = [
            new ol.style.Style({
              image: new ol.style.Circle({
                radius: 20,
                fill: new ol.style.Fill({
                  color:
                    "rgba(" + clusterStylesConfig[u].rgba_bg.join(",") + ")",
                }),
              }),
            }),
            new ol.style.Style({
              image: new ol.style.Circle({
                radius: 15,
                fill: new ol.style.Fill({
                  color:
                    "rgba(" + clusterStylesConfig[u].rgba_bg.join(",") + ")",
                }),
              }),
              text: new ol.style.Text({
                text: t.length.toString(),
                fill: new ol.style.Fill({
                  color: "#000",
                }),
              }),
            }),
          ])),
      style)
    : ((r = n.get("type")), r == MARKER_STATION)
    ? ((i = n.get("data")),
      [
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: "rgba(138, 192, 255, 0.5)",
          }),
          stroke: new ol.style.Stroke({
            color: "rgba(0,60,136,1)",
            width: 2,
          }),
          text: new ol.style.Text({
            text: i[1],
            offsetX: 0,
            offsetY: 15,
            fill: new ol.style.Fill({
              color: "#000000",
            }),
            textAlign: "center",
            backgroundFill: new ol.style.Fill({
              color: "#ff0",
            }),
            padding: [2, 2, 2, 2],
            font: 'bold 13px "tahoma"',
          }),
        }),
        new ol.style.Style({
          image: new ol.style.Icon({
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: Url.get("Upload/0/poi") + i[5] + ".png",
          }),
          geometry: new ol.geom.Point(
            new ol.proj.fromLonLat([i[3] / 1e6, i[4] / 1e6])
          ),
        }),
      ])
    : r == MARKER_TOLLGATE
    ? ((f = n.get("data")), tollgateStyle(f[5]))
    : r == MARKER_TRAILER
    ? ((e = n.get("data")), getStyleTrailerLayer(e))
    : void 0;
}
function getVehicleStatus(n) {
  var u, t, i, f, o, r, s, h;
  let e = "0";
  if (
    (vehicles["vec_" + n[0]] && (e = vehicles["vec_" + n[0]][23]),
    (u = "white_100.svg"),
    n && n.length > 50 && n[1] > 0)
  ) {
    i = Math.floor((nowTime - n[1]) / 60);
    f = 0;
    n[56] == 21 && n[55] > 0 && nowTime - n[55] < 600 && (i = 5);
    i < 61
      ? (16 & n[8]) > 0
        ? (t = "red")
        : (1 & n[8]) == 1
        ? ((o = getVehicleMaxSpeed(n)),
          (t = n[4] > o ? "blue" : n[4] > 0 ? "green" : "yellow"))
        : (t = "grey")
      : ((t = "white"), (f = 0));
    r = 1;
    n[5] > 10 && n[5] <= 90
      ? (r = 2)
      : n[5] > 90 && n[5] <= 180
      ? (r = 3)
      : n[5] > 180 && n[5] <= 270 && (r = 4);
    s = n[6] >= 3 ? 1 : 0;
    h = i <= 10 ? 1 : 0;
    u =
      "vehicle_" +
      e +
      "_" +
      t +
      "_" +
      s.toString() +
      h.toString() +
      f.toString() +
      ".svg";
  }
  return window.urlVehicleStatus + u;
}
function getStyleVehicleLayer(n) {
  var t = statuses["vec_" + n],
    r,
    i;
  const u = t[27] || [];
  if (((r = getVehicleStatus(t)), (i = new ol.style.Style()), t)) {
    let f = t[32];
    if (trailers != null && trailers != []) {
      let n = trailers["trailer_" + t[57]];
      n && (f += " " + n[4]);
    }
    let n = [];
    showSensors && (n = u.map((n) => getSensorValuesCustom(t, n)));
    i.setText(
      new ol.style.Text({
        text: `${f}${n.length > 0 ? " \n " + n : " "}`,
        offsetX: 0,
        offsetY: 32,
        rotation: 0,
        fill: new ol.style.Fill({
          color: "#000000",
        }),
        backgroundFill: new ol.style.Fill({
          color: t[33] != "" ? "#65F93C" : "orange",
        }),
        padding: [3, 3, 3, 3],
        textAlign: "center",
        font: 'bold 12px "tahoma"',
      })
    );
    i.setImage(
      new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        src: r,
        scale: 0.1 + (0.3 * map.getView().getZoom()) / 100,
        rotation: ((Math.PI * t[5]) / 180).toFixed(2),
        opacity: 1,
      })
    );
  } else
    i.setImage(
      new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        src: r,
        scale: 0.1 + (0.3 * map.getView().getZoom()) / 100,
        rotation: 0,
        opacity: 1,
      })
    );
  return i;
}
function refreshMaps() {
  var t = [],
    n;
  const i = Array.from(document.querySelectorAll('[hide="false"]')).map((n) =>
    n.getAttribute("vehicleId")
  );
  vehicleLayer.getSource().getSource().getFeatures().length > 0 &&
    vehicleLayer.getSource().getSource().clear();
  for (n in statuses)
    statuses[n][2] > statuses[n][3] &&
      !statuses[n][39] &&
      (isChangeMapByGroup && currFilterVehicleGroupId != "all" && i.length != 0
        ? i.includes(String(statuses[n][0]))
        : !0) &&
      t.push(getFeatureById(statuses[n]));
  vehicleLayer.getSource().getSource().addFeatures(t);
}
function getFeatureById(n) {
  var r = new ol.geom.Point(new ol.proj.fromLonLat([n[2] / 1e6, n[3] / 1e6])),
    t = new ol.Feature({
      name: n[32],
      type: MARKER_VEHICLE,
    });
  t.setGeometryName(MARKER_VEHICLE);
  t.setId(n[0]);
  t.setGeometry(r);
  const i = window.map.getOverlayById(n[0]);
  return i && window.map.removeOverlay(i), t;
}
function loadVehicleLog(n) {
  $("#tbEvent p").remove();
  $("#tbEvent #tbEvent-graph-loading").css("display", "");
  request(
    Url.get("Monitor.aspx/GetVehicleEvents"),
    {
      vehicle: n,
    },
    function (n) {
      if (n != null && n.length > 0) {
        n.shift();
        gvVehicleEvents = n;
        for (var t = 0; t < n.length; t++)
          $("#tbEvent").prepend(
            '<p id="vevent' +
              t +
              '" onclick="showCurentVehicleEvent(' +
              t +
              ')"><b>' +
              ConvertIntToDateStr(n[t][3]) +
              ":</b>" +
              n[t][9] +
              "<br/>" +
              n[t][8] +
              "</p>"
          );
      }
      $("#tbEvent #tbEvent-graph-loading").css("display", "none");
    },
    function () {
      $("#tbEvent #tbEvent-graph-loading").css("display", "none");
    }
  );
}
function removeEventPopup() {
  window.eventsLayer.getSource().clear();
}
function showEventTab() {
  mapTabStatus = !1;
  toogleTabEvent = !1;
  closeMapTab(!0);
  $("#liEvent").trigger("click");
}
function openVehicleImageGalerry() {
  var n = $("#VehicleImage"),
    t = n.attr("VehicleId"),
    i = n.attr("ImageTime");
  window.showHistoryImage
    ? window.open(
        window.HISTORY_IMAGE_REPLAY_LINK + "?id=" + t + "&from=" + i + "&to=0"
      )
    : viewVehicleCameras(t, i);
}
function viewVehicleCameras(n, t) {
  request(
    Url.get("Monitor.aspx/ViewCam"),
    {
      vehicleId: n,
      time: t,
    },
    function (n) {
      var i, t, r;
      if (n && n.length > 0) {
        for (i = [], t = 0; t < n.length; t++) {
          r = statuses["vec_" + n[t].Id];
          const u = Util.date.formatFullDateTime(getTime(n[t].Time.toString()));
          r &&
            i.push({
              src: n[t].Url,
              type: "image",
              caption:
                "<b> " + r[32] + " - " + u + "<br/>" + n[t].Info + "</b>",
            });
        }
        Fancybox.show(i, {
          startIndex: 0,
          caption: {
            position: "bottom",
          },
          wheel: "slide",
        });
      }
    },
    function () {}
  );
}
function loadVehicleChart(n) {
  loadVehicleChartCounter++;
  loadVehicleChartCounter > 30 &&
    ((loadVehicleChartCounter = 0),
    $("#tbGraph .graph").remove(),
    $("#tbGraph #graph-loading").css("display", ""),
    $.post(
      Url.get("Monitor.aspx/GetSensorValues"),
      {
        vehicle: n[0],
        sensorType: n[27][0].SensorTypeId,
        from: 0,
        to: n[1],
      },
      function (n) {
        n != null && n.length > 0
          ? ($(".graph").remove(),
            $(".viewGraph").remove(),
            n.length > 0 && loadFuelChart(n))
          : $("#tbGraph #graph-loading").css("display", "none");
      }
    ));
}
function loadFuelChart(n) {
  var u = [],
    f = [],
    e = [],
    l = [],
    w = [],
    a = [],
    o = 0,
    h,
    v,
    c,
    i,
    p,
    r;
  let s = {};
  const b = [];
  for (h = 0, v = 0, c = 0; c < n.length; c++) {
    i = n[c];
    o = i[0];
    const t = new Date("2010/01/01").setSeconds(i[1] + 25200);
    b.push(t);
    a.push((i[2] / 100).toFixed(2));
    u.push(i[3] / 100);
    f.push(i[4] / 100);
    e.push(i[5] / 100);
    l.push(i[7] / 100);
    w.push(i[8] / 100);
    h == 0 && (h = i[1]);
    v = i[1];
  }
  var nt = ConvertIntToDateStr_dd_mm_hh_mm(h),
    tt = ConvertIntToDateStr_dd_mm_hh_mm(v),
    k = "",
    t = 0,
    d = 0,
    y = statuses["vec_" + o];
  y &&
    ((k = y[32]), (t = y[27][0].SensorTypeId), (d = vehicles["vec_" + o][24]));
  p = "VehicleChart_" + o;
  $("#tbGraph #graph-loading").css("display", "none");
  $("#tbGraph").html(
    '<div class="graph" id="' +
      p +
      '" style="height: 216px;width: 368px;"></div>'
  );
  const g = echarts.init(document.getElementById(p), null, {
    renderer: "svg",
  });
  r = [];
  d == 15
    ? r.push(
        {
          type: "line",
          name: "Return",
          data: f,
          areaStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          lineStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          itemStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        },
        {
          type: "line",
          name: "Supply",
          data: e,
          areaStyle: {
            color: "rgba(254, 105, 200, 1)",
          },
          lineStyle: {
            color: "rgba(254, 105, 200, 1)",
          },
          itemStyle: {
            color: "rgba(254, 105, 200, 1)",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        },
        {
          type: "line",
          name: "Setpoint",
          data: l,
          areaStyle: {
            color: "rgba(255, 69, 0, 1)",
          },
          lineStyle: {
            color: "rgba(255, 69, 0, 1)",
          },
          itemStyle: {
            color: "rgba(255, 69, 0, 1)",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        }
      )
    : t === 18 || t === 34 || t === 35 || t === 72 || t === 73 || t === 74
    ? (r.push(
        {
          type: "line",
          name: getLanguage("sensor.values") + " 1",
          data: f,
          areaStyle: {
            color: "#EE6055",
          },
          lineStyle: {
            color: "#EE6055",
          },
          itemStyle: {
            color: "#EE6055",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        },
        {
          type: "line",
          name: getLanguage("sensor.values") + " 2",
          data: e,
          areaStyle: {
            color: "#17BEBB",
          },
          lineStyle: {
            color: "#17BEBB",
          },
          itemStyle: {
            color: "#17BEBB",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        },
        {
          type: "line",
          name: getLanguage("sensor.voltage"),
          lineStyle: {
            color: "red",
          },
          itemStyle: {
            color: "red",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 0,
          data: a,
          smooth: !0,
          showSymbol: !1,
        }
      ),
      (t === 73 || t === 74) &&
        r.push({
          type: "line",
          name: getLanguage("sensor.values") + " 3",
          data: l,
          areaStyle: {
            color: "#AAF683",
          },
          lineStyle: {
            color: "#AAF683",
          },
          itemStyle: {
            color: "#AAF683",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        }),
      t === 74 &&
        r.push({
          type: "line",
          name: getLanguage("sensor.values") + " 4",
          data: w,
          areaStyle: {
            color: "#FFD97D",
          },
          lineStyle: {
            color: "#FFD97D",
          },
          itemStyle: {
            color: "#FFD97D",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        }))
    : t == 66 || t == 67 || t == 68
    ? r.push(
        {
          type: "line",
          name: keyTemperature,
          lineStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          itemStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          data: f,
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        },
        {
          type: "line",
          name: keyHumidity,
          lineStyle: {
            color: "rgba(254, 105, 200, 1)",
          },
          itemStyle: {
            color: "rgba(254, 105, 200, 1)",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          data: e,
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        }
      )
    : r.push(
        {
          type: "line",
          name: getLanguage("sensor.values"),
          data: u,
          areaStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          lineStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          itemStyle: {
            color: "rgb(119, 176, 0, .5)",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          markPoint: {
            data: [
              {
                value: parseInt(u[u.length - 1]),
                xAxis: u.length - 1,
                yAxis: u[u.length - 1],
              },
            ],
          },
          yAxisIndex: 1,
          smooth: !0,
          showSymbol: !1,
        },
        {
          type: "line",
          name: getLanguage("sensor.voltage"),
          lineStyle: {
            color: "red",
          },
          itemStyle: {
            color: "red",
          },
          label: {
            textStyle: {
              fontFamily: "monospace",
            },
          },
          yAxisIndex: 1,
          data: a,
          smooth: !0,
          showSymbol: !1,
        }
      );
  const it = [
    {
      name: getLanguage("sensor.voltage"),
      nameLocation: "center",
      axisLabel: {
        show: !0,
      },
      axisLine: {
        show: !0,
      },
      axisTick: {
        show: !0,
      },
      type: "value",
      position: "right",
      nameTextStyle: {
        color: "red",
        fontWeight: "bold",
        fontFamily: "monospace",
      },
    },
    {
      name: getSensorName(t),
      nameLocation: "center",
      axisLabel: {
        show: !0,
        inside: !0,
      },
      type: "value",
      nameTextStyle: {
        fontSize: 10,
        fontWeight: "bold",
        fontFamily: "monospace",
      },
      axisLine: {
        show: !0,
      },
    },
  ];
  s = {
    title: {
      text: k + " [" + nt + "->" + tt + "]",
      left: "center",
      textStyle: {
        fontFamily: "monospace",
        fontSize: 12,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
      },
      formatter: (n) => {
        let i = 0,
          t = `${Util.date.formatDateTime5(
            new Date(n[0].axisValue - 252e5)
          )}<br/>`;
        return (
          n.forEach((n) => {
            (i += n.value || 0),
              (t += `${n.marker} ${n.seriesName}: ${n.value.toString()}<br/>`);
          }),
          t
        );
      },
    },
    toolbox: {
      show: !0,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
      },
    },
    yAxis: it,
    xAxis: {
      type: "category",
      data: b,
      axisLabel: {
        formatter: function (n) {
          return Util.date.formatTime2(new Date(n - 252e5));
        },
      },
    },
    series: r,
  };
  s && typeof s == "object" && g.setOption(s);
  window.addEventListener("resize", g.resize);
}
function showContextMenuForMarker(n, t, i) {
  var r = 0,
    e = new ol.geom.LineString([
      i,
      n.getGeometry().getCoordinates(),
    ]).getLength(),
    u = !0,
    f;
  window.map.getView().getZoom() > 16
    ? e > 1e3 && (u = !1)
    : e > 3e3 && (u = !1);
  u &&
    n.getProperties().features &&
    n.getProperties().features.length == 1 &&
    n.getProperties().features[0].getGeometryName() == MARKER_VEHICLE &&
    (r = n.getProperties().features[0].getId());
  r > 0
    ? ((f = vehicles["vec_" + r]),
      f && ($("#map").contextMenu(!1), showContextMenuForVehicleRow(f[0], t)))
    : $(".sidebar-left").contextMenu(t);
}
function showContextMenuForVehicleRow(n, t) {
  contextVehicleId = n;
  $(".vehicles").contextMenu(t);
}
function chkHistory_Change() {
  $("#chkHistory").is(":checked")
    ? (importVehicleToSelect(), $(".history-info").slideDown())
    : ($(".history-info").slideUp(), window.historyLayer.getSource().clear());
}
function importVehicleToSelect() {
  var n = [],
    i,
    t;
  for (i in vehicles)
    vehicles[i] &&
      n.push({
        id: vehicles[i][0],
        plate: vehicles[i][1],
      });
  if (($("#selectVehicle").html(""), n.length > 0)) {
    for (n.sort(sortbyProperty("plate")), t = 0; t < n.length; t++)
      $("#selectVehicle").append(
        '<option value="' + n[t].id + '">' + n[t].plate + "</option>"
      );
    $("#selectVehicle").val(selectVehicle ? selectVehicle : n[0].id);
    $("#selectVehicle").select2().trigger("change");
  }
}
function loadHistoryByTime(n) {
  var t = $("#selectVehicle").val();
  t > 0 && loadVehicleHistoryByTime(t, n, "", "");
}
function loadVehicleHistoryByTime(n, t, i, r) {
  if (((currentPopupVehicle = 0), removeCurrentPopup(), n > 0)) {
    var u = statuses["vec_" + n];
    u &&
      ($("#history-loading").css("display", ""),
      request(
        Url.get("Monitor.aspx/GetWaypointQuickView"),
        {
          vehicle: n,
          seconds: t,
          from: i,
          to: r,
        },
        function (n) {
          var i, u, r, t;
          if (n && n.length > 0) {
            for (
              window.historyLayer.getSource().clear(), i = [], u = [], r = 0;
              r < n.length;
              r++
            )
              (t = n[r]),
                i.push([t[0] / 1e6, t[1] / 1e6]),
                t.length == 3 && u.push([t[0] / 1e6, t[1] / 1e6, t[2]]);
            if (
              (i.length > 0 &&
                (setFeatureForHistory(i, u),
                $(".context-menu-item.icon-delete-route").css("display", "")),
              window.historyLayer)
            ) {
              const n = window.historyLayer.getSource().getExtent();
              n &&
                map.getView().fit(n, {
                  size: map.getSize(),
                  padding: [50, 50, 50, 50],
                });
            }
          }
          $("#history-loading").css("display", "none");
        },
        function () {
          $("#history-loading").css("display", "none");
        }
      ));
  }
}
function setFeatureForHistory(n, t) {
  for (
    var r = new ol.Feature({
        type: "Route",
        geometry: new ol.geom.LineString(n).transform(
          realProjection,
          descartesProjection
        ),
      }),
      u = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "green",
            width: 2,
          }),
        }),
      ],
      i = 0;
    i < t.length;
    i++
  )
    u.push(
      new ol.style.Style({
        geometry: new ol.geom.Point(new ol.proj.fromLonLat([t[i][0], t[i][1]])),
        image: new ol.style.Icon({
          src: window.urlVehicleStatus + "arrow.png",
          anchor: [0.5, 0.5],
          rotateWithView: !0,
          rotation: ((Math.PI * t[i][2]) / 90).toFixed(2),
        }),
      })
    );
  r.setStyle(u);
  window.historyLayer.getSource().addFeatures([r]);
}
function loadHistory() {
  var r = $("#txtFromDate").val(),
    u = $("#txtFromTime").val(),
    f = $("#txtToDate").val(),
    e = $("#txtToTime").val(),
    n = $("#selectVehicle").val(),
    t,
    i;
  n > 0 &&
    ((t = r + " " + u),
    (i = f + " " + e),
    loadVehicleHistoryByTime(n, -1, t, i));
}
function viewHistory() {
  var n = $("#txtFromDate").val(),
    t = $("#txtFromTime").val(),
    i = $("#txtToDate").val(),
    r = $("#txtToTime").val(),
    u = $("#selectVehicle").val(),
    f = Util.date.getSeconds(new Date(Date.parse(n + " " + t))),
    e = Util.date.getSeconds(new Date(Date.parse(i + " " + r)));
  window.open(
    window.HISTORY_REPLAY_LINK + "?id=" + u + "&from=" + f + "&to=" + e
  );
}
function chkVehicleGroup_Change() {
  $("#chkVehicleGroup").is(":checked")
    ? ((groupVehicle = 1), window.vehicleLayer.getSource().setDistance(20))
    : (window.vehicleLayer.getSource().setDistance(0), (groupVehicle = 0));
  refreshMaps();
}
function chkShowSensors_Change() {
  $("#chkShowSensors").is(":checked")
    ? ((showSensors = !0), setLocalStorage("monitor.sensorsDisplay", !0))
    : ((showSensors = !1), setLocalStorage("monitor.sensorsDisplay", !1));
  refreshMaps();
}
function toggleControlCenterCommands() {
  $("#control-center").css("height", "unset");
  window.ControlCommands
    ? ($(".control-center .state-collapse").switchClass(
        "state-collapse",
        "state-expand",
        1e3,
        "easeInOutQuad"
      ),
      $(".control-center .commands").slideDown(),
      (window.ControlCommands = !1))
    : ($(".control-center .state-expand").switchClass(
        "state-expand",
        "state-collapse",
        1e3,
        "easeInOutQuad"
      ),
      $(".control-center .commands").slideUp(),
      (window.ControlCommands = !0));
}
function chkHelp_Change(n) {
  $(n).is(":checked")
    ? ($(".status-vehicle").slideDown(),
      $(".guide-right-click").slideDown(),
      $(".pn-guide").slideDown())
    : ($(".status-vehicle").slideUp(),
      $(".guide-right-click").slideUp(),
      $(".pn-guide").slideUp());
}
function showHistory(n) {
  var t = $("#chkHistory");
  t.is(":checked") || $("#chkHistory").trigger("click");
  $("#selectVehicle").val(n).trigger("change");
}
function updateControlCenterCounter() {
  ShowVehicleNoDriverTable();
  ShowVehicleLongStopTable();
  ShowVehicleOverSpeedTable();
  ShowVehicleOverTimeDrivingTable();
  ShowVehicleDailyDrivingTable();
  ShowVehicleRoadOverSpeedTable();
  ShowVehicleLoseSignalTable();
  ShowVehicleWeekyDrivingTable();
  showDrivingTimeTable();
  ShowVehicleHighwaySpeedTable();
  ShowVehicleTrafficViolationTable();
}
function iconStatusVehicle(n) {
  if (!n) return "";
  const t = document.createElement("img");
  return (t.src = getVehicleStatus(n)), (t.style.width = "24px"), t;
}
function ShowVehicleNoDriverTable() {
  tableBoardControl(
    listUnLoginDriver.sort(sortbyIndex(33)),
    "chkVehiclesNoDriver",
    "vehicles-driver",
    {
      showBackground: !1,
      duration: (n) => n[1] - n[36],
    }
  );
  const n = listUnLoginDriver.length;
  $(".vehicle-driver-info .header .counter").html(n);
  window.CounterVehicleNoDriver = n;
  n > 0
    ? $("#CounterVehicleNoDriver").html(
        "(" + window.CounterVehicleNoDriver + ") "
      )
    : $("#CounterVehicleNoDriver").html("");
}
function ShowVehicleLongStopTable() {
  tableBoardControl(
    listStopOver2h.sort(sortbyIndex(-16)),
    "chkVehiclesLongStop",
    "vehicles-stop",
    {
      showBackground: !1,
      duration: (n) => listDeltaForStopOver2h[n[0]],
      time: (n) => n[15],
    }
  );
  const n = listStopOver2h.length;
  $(".vehicle-stop-info .header .counter").html(n);
  window.CounterVehicleLongStop = n;
  n > 0
    ? $("#CounterVehicleLongStop").html(
        "(" + window.CounterVehicleLongStop + ") "
      )
    : $("#CounterVehicleLongStop").html("");
}
function ShowVehicleOverSpeedTable() {
  tableBoardControl(
    listOverSpeedByVehicleType.sort(sortbyIndex(33)),
    "chkVehiclesOverSpeed",
    "vehicles-overSpeed",
    {
      showBackground: !1,
      duration: (n) => nowTime - n[37],
      time: (n) => n[37],
      overSpeedByRoad: !0,
    }
  );
  const n = listOverSpeedByVehicleType.length;
  $(".vehicle-overSpeed-info .header .counter").html(n);
  window.CounterVehicleOverSpeed = n;
  n > 0
    ? $("#CounterVehicleOverSpeed").html(
        "(" + window.CounterVehicleOverSpeed + ") "
      )
    : $("#CounterVehicleOverSpeed").html("");
}
function ShowVehicleRoadOverSpeedTable() {
  tableBoardControl(
    listOverSpeedByRoad.sort(sortbyIndex(33)),
    "chkVehicleRoadOverSpeed",
    "vehicles-road-overSpeed",
    {
      showBackground: !1,
      duration: (n) => nowTime - n[58],
      time: (n) => n[58],
      overSpeedByRoad: !0,
    }
  );
  const n = listOverSpeedByRoad.length;
  $(".vehicle-road-over-speed-info .header .counter").html(n);
  window.CounterVehicleRoadOverSpeed = n;
  n > 0
    ? $("#CounterVehicleRoadOverSpeed").html(
        "(" + window.CounterVehicleRoadOverSpeed + ") "
      )
    : $("#CounterVehicleRoadOverSpeed").html("");
}
function onCheckBoardControl(n, t) {
  let i;
  switch (n) {
    case idsBoardControl.stopOver2h:
      i = ShowVehicleLongStopTable;
      break;
    case idsBoardControl.unLoginDriver:
      i = ShowVehicleNoDriverTable;
      break;
    case idsBoardControl.overSpeedByVehicleType:
      i = ShowVehicleOverSpeedTable;
      break;
    case idsBoardControl.overSpeedByRoad:
      i = ShowVehicleRoadOverSpeedTable;
      break;
    case idsBoardControl.continuousdriving4h:
      i = ShowVehicleOverTimeDrivingTable;
      break;
    case idsBoardControl.drivingDaily10h:
      i = ShowVehicleDailyDrivingTable;
      break;
    case idsBoardControl.loseSignal:
      i = ShowVehicleLoseSignalTable;
      break;
    case idsBoardControl.driving48h:
      i = ShowVehicleWeekyDrivingTable;
      break;
    case idsBoardControl.highwaySpeed:
      i = ShowVehicleHighwaySpeedTable;
      break;
    case idsBoardControl.expiredInspection:
      i = ShowVehicleExpiredInspectionTable;
      break;
    case idsBoardControl.vehicleTrafficViolation:
      i = ShowVehicleTrafficViolationTable;
  }
  $(`#${n}`).is(":checked")
    ? ($(`.${t}`).slideDown(), i && i())
    : $(`.${t}`).slideUp();
}
function getAcc(n) {
  if (!n) return 0;
  let t = 0;
  const i = n[1],
    r = n[8];
  return nowTime - i < 3660 && (1 & r) == 1 && (t = 1), t;
}
function ShowVehicleLoseSignalTable() {
  tableBoardControl(
    listLoseSignal.sort(sortbyIndex(33)),
    "chkloseSignal",
    "vehicles-lose-signal",
    {
      showBackground: !1,
      duration: (n, t) => {
        const i = listSensorLoseSignal[t];
        return nowTime - i?.GpsTime;
      },
      time: (n, t) => {
        const i = listSensorLoseSignal[t];
        return i?.GpsTime;
      },
      sensor: !0,
    }
  );
  const n = listLoseSignal.length;
  $(".vehicle-lose-signal-info .header .counter").html(n);
  window.CounterVehicleLoseSignal = n;
  n > 0
    ? $("#CounterLoseSignal").html("(" + window.CounterVehicleLoseSignal + ") ")
    : $("#CounterLoseSignal").html("");
}
function ShowVehicleWeekyDrivingTable() {
  tableBoardControl(
    listDriving48H.sort(sortbyIndex(-70)),
    "chkVehicleWeeklyDriving",
    "vehicles-weekly-driving",
    {
      keyDuration: 69,
      timeViolate: 172800,
    }
  );
  const n = listDriving48H.length;
  $(".vehicle-weekly-driving-info .header .counter").html(n);
  window.CounterVehicleWeeklyDriving = n;
  $("#driving48HBag .bag-number").html(n);
  $("#driving48HBagMobile .bag-number").html(n);
  n > 0
    ? $("#CounterVehicleWeeklyDriving").html(
        "(" + window.CounterVehicleWeeklyDriving + ") "
      )
    : $("#CounterVehicleWeeklyDriving").html("");
}
function ShowVehicleHighwaySpeedTable() {
  tableBoardControl(
    listHighwaySpeed.sort(sortbyIndex(-70)),
    "chkVehicleHighwaySpeed",
    "vehicles-highway-speed",
    {
      showBackground: !1,
      slowSpeedHighway: !0,
      showDuration: !1,
      time: (n) => n[1],
    }
  );
  const n = listHighwaySpeed.length;
  $(".vehicle-highway-speed-info .header .counter").html(n);
  window.CounterVehicleHighwaySpeed = n;
  n > 0
    ? $("#CounterVehicleHighwaySpeed").html(
        "(" + window.CounterVehicleHighwaySpeed + ") "
      )
    : ($("#CounterVehicleHighwaySpeed").html(""),
      $(".vehicles-highway-speed tbody").empty());
}
function ShowVehicleOverTimeDrivingTable() {
  tableBoardControl(
    listContinuousDriving4h.sort(sortbyIndex(-17)),
    "chkVehicleOverTimeDriving",
    "vehicles-overtime-driving",
    {
      keyDuration: 16,
      timeViolate: 14400,
    }
  );
  const n = listContinuousDriving4h.length;
  $(".vehicle-overtime-driving-info .header .counter").html(n);
  window.CounterVehicleOverTimeDriving = n;
  n > 0
    ? ($("#CounterVehicleOverTimeDriving").html(
        "(" + window.CounterVehicleOverTimeDriving + ") "
      ),
      $("#driving4hBag .bag-number").html(window.CounterVehicleOverTimeDriving))
    : ($("#CounterVehicleOverTimeDriving").html(""),
      $("#driving4hBag .bag-number").html(0));
}
function ShowVehicleDailyDrivingTable() {
  tableBoardControl(
    listDriving10H.sort(sortbyIndex(-18)),
    "chkVehicleDailyDriving",
    "vehicles-daily-driving",
    {
      keyDuration: 17,
      timeViolate: 36e3,
    }
  );
  const n = listDriving10H.length;
  $(".vehicle-daily-driving-info .header .counter").html(n);
  window.CounterVehicleDailyDriving = n;
  $("#driving10HBag .bag-number").html(n);
  $("#driving10HBagMobile .bag-number").html(n);
  n > 0
    ? $("#CounterVehicleDailyDriving").html(
        "(" + window.CounterVehicleDailyDriving + ") "
      )
    : $("#CounterVehicleDailyDriving").html("");
}
function updateExpiredInspectation(n = "", t = "", i, r = "") {
  $(".datepicker").datetimepicker({
    format: "d-m-Y",
    timepicker: !1,
    lang: "vi",
  });
  $("#plateInspect").html(r);
  $("#registerDate").val(n.split("-").reverse().join("-") || "");
  $("#nextRegisterDate").val(t.split("-").reverse().join("-"));
  $("#updateInspectionDateModal").modal("show");
  $("#updateRegisterVehicleForm")
    .off("submit")
    .on("submit", function (n) {
      n.preventDefault();
      n.stopPropagation();
      const t = {
        VehicleId: i,
        RegisterDate: $("#registerDate").val(),
        NextRegisterDate: $("#nextRegisterDate").val(),
      };
      $("#btnUpdateRegisterDate").attr("disabled", !0);
      $.ajax({
        url: updateRegistration,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(t),
        success: function (n) {
          n
            ? n.success === !0
              ? (showDataSuccess(n.message),
                ShowVehicleExpiredInspectionTable(),
                $("#updateInspectionDateModal").modal("hide"))
              : alert(n.message)
            : alert("Error");
        },
        error: function (n) {
          console.error("Error:", n.responseText);
          alert(n.responseText);
        },
        complete: function () {
          $("#btnUpdateRegisterDate").removeAttr("disabled");
        },
      });
    });
}
function ShowExpiredInspectionTable(n) {
  const i = $(`#chkExpiredInspection`).is(":checked");
  if (i && n.length > 0) {
    const t = $(`#VehicleExpiredInspection tbody`).empty();
    n.map((n) => {
      const { i = "", r = "", f = "" } = n;
      let u = "";
      const e = r ? Util.date.formatDate(new Date(r)) : "",
        o = i ? Util.date.formatDate(new Date(i)) : "",
        s = dayUntilNow(n.NextRegisterDate);
      u =
        dayUntilNow(n.NextRegisterDate) >= 0
          ? "warning-driving-3h30"
          : "warning-overtime-driving";
      t.append(
        `<tr style="cursor: pointer" class="${u}" onclick="updateExpiredInspectation('${
          e || ""
        }', '${o}', ${n.Id}, '${f}' )">` +
          `<td nowrap="nowrap" class="config"> ${n.Plate} </td>` +
          `<td nowrap="nowrap" class="plate"> ${n.VehicleType} </td>` +
          `<td nowrap="nowrap" class="time"> ${
            i ? Util.date.formatDate(new Date(n.NextRegisterDate)) : ""
          } </td>` +
          `<td nowrap="nowrap" class="address"> ${s} </td>` +
          "</tr>"
      );
    });
    $(`.vehicle-expiredInspection`).tableHeadFixer();
  }
  const t = n.length;
  $(".vehicle-expiredInspection .header .counter").html(t);
  window.VehicleExpireInSpection = t;
  t > 0
    ? $("#CounterExpiredInspection").html(
        "(" + window.VehicleExpireInSpection + ") "
      )
    : $("#CounterExpiredInspection").html("");
}
function ShowVehicleExpiredInspectionTable() {
  getListRegistrationVehicle?.(ShowExpiredInspectionTable);
}
function ShowVehicleTrafficViolationTable() {
  ShowVehiclesViolationTable(
    listVehicleTrafficViolation.sort(sortbyIndex(-70))
  );
  const n = listVehicleTrafficViolation.length;
  $(".vehicle-traffic-violation-info .header .counter").html(n);
  window.CounterVehicleTrafficViolation = n;
  n > 0
    ? $("#CounterVehicleTrafficViolation").html(
        "(" + window.CounterVehicleTrafficViolation + ") "
      )
    : ($("#CounterVehicleTrafficViolation").html(""),
      $(".vehicle-traffic-violation-info tbody").empty());
}
function ShowVehiclesViolationTable(n) {
  const t = $(`#chkVehicleTrafficViolation`).is(":checked");
  if (t && n.length > 0) {
    const t = $(`table.vehicles-traffic-violation tbody`).empty();
    n.map((n) => {
      let i = "";
      i = n[78] >= 0 ? "warning-driving-3h30" : "warning-overtime-driving";
      t.append(
        `<tr class="${i}" onclick="selectedVehicle(${n[0]},true)">` +
          `<td nowrap="nowrap" class="config"> ${
            iconStatusVehicle(n).outerHTML
          } </td>` +
          `<td nowrap="nowrap" class="plate"> ${n[32]} </td>` +
          `<td nowrap="nowrap" class="violation-count"> ${n[78]} </td>` +
          `<td nowrap="nowrap" class="violation-audit-time"> ${Util.date.formatFullDateTime2(
            n[79]
          )} </td>` +
          "</tr>"
      );
    });
    $(`.vehicles-traffic-violation`).tableHeadFixer();
  }
}
function updateControlCenterTimer() {
  updateVehicleTableInMap(window.CounterVehicleNoDriver, "divVehiclesNoDriver");
  updateVehicleTableInMap(window.CounterVehicleLongStop, "divVehiclesLongStop");
  updateVehicleTableInMap(
    window.CounterStatisticOverSpeed,
    "divStatisticOverSpeed"
  );
  updateVehicleTableInMap(
    window.CounterVehicleOverSpeed,
    "divVehicleOverSpeed"
  );
  updateVehicleTableInMap(
    window.CounterVehicleRoadOverSpeed,
    "divVehicleRoadOverSpeed"
  );
  updateVehicleTableInMap(
    window.CounterVehicleOverTimeDriving,
    "divVehicleOverTimeDriving"
  );
  updateVehicleTableInMap(
    window.CounterVehicleDailyDriving,
    "divVehicleDailyDriving"
  );
  updateVehicleTableInMap(window.CounterVehicleLoseSignal, "loseSignal");
  updateVehicleTableInMap(
    window.CounterVehicleWeeklyDriving,
    "divVehicleWeeklyDriving"
  );
  updateVehicleTableInMap(
    window.CounterVehicleHighwaySpeed,
    "divVehicleHighwaySpeed"
  );
  updateVehicleTableInMap(window.VehicleExpireInSpection, "expiredInspection");
  updateVehicleTableInMap(
    window.CounterVehicleTrafficViolation,
    "divVehicleTrafficViolation"
  );
}
function updateVehicleTimerCommon(n, t) {
  const i = `#${n} label`;
  t
    ? $(i).hasClass("warning-blue")
      ? ($(i).removeClass("warning-blue"), $(i).addClass("warning-red"))
      : ($(i).removeClass("warning-red"), $(i).addClass("warning-blue"))
    : ($(i).removeClass("warning-blue"), $(i).removeClass("warning-red"));
}
function updateVehicleTableInMap(n, t) {
  const i = n > 0;
  updateVehicleTimerCommon(t, i);
}
function chkStation_Change(n = false) {
  $("#chkStation").is(":checked")
    ? (window.stationLayerGroup.setVisible(!0),
      $(".station-info").slideDown(),
      n || ShowStationTable())
    : (window.stationLayerGroup.setVisible(!1), $(".station-info").slideUp());
}
function toggleStationListCommands() {
  $(".station-info").css("height", "unset");
  window.StationPanel
    ? ($(".station-info .state-collapse").switchClass(
        "state-collapse",
        "state-expand",
        1e3,
        "easeInOutQuad"
      ),
      $(".station-info").css("height", "300px"),
      (window.StationPanel = !1))
    : ($(".station-info .state-expand").switchClass(
        "state-expand",
        "state-collapse",
        1e3,
        "easeInOutQuad"
      ),
      $(".station-info").css("height", "30px"),
      (window.StationPanel = !0));
}
function ShowStationTable() {
  $("#station-table").html("");
  $("#station-loading").css("display", "");
  $.post(Url.get("Monitor.aspx/StationListByJson"), {}, function (n) {
    var t, i;
    if (n && n.length > 0)
      for (stations = [], n.shift(), t = 0; t < n.length; t++)
        (i = n[t]),
          (stations["station_" + n[t][0]] = n[t]),
          $("#station-table").append(
            '<tr id="point' +
              i[0] +
              '"  onclick="selectedStation(' +
              i[0] +
              ',true)"><td nowrap="nowrap" class="type"><img src="' +
              Url.get("Upload/0/poi") +
              i[5] +
              '.png"/></td><td nowrap="nowrap" class="name">' +
              i[1] +
              "</td></tr>"
          ),
          displayStationOnMap(i);
    $("#station-loading").css("display", "none");
  });
}
function displayStationOnMap(n) {
  var t = new ol.proj.fromLonLat([n[3] / 1e6, n[4] / 1e6]),
    r = new ol.geom.Circle(t, n[2]),
    i = new ol.Feature({
      geometry: r,
      type: MARKER_STATION,
      id: n[0],
      data: n,
    });
  i.setStyle([
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(0, 128, 0, 0.2)",
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(0,128,0,1)",
        width: 2,
      }),
      text: new ol.style.Text({
        text: n[1],
        offsetX: 0,
        offsetY: 20,
        fill: new ol.style.Fill({
          color: "#000000",
        }),
        textAlign: "center",
        backgroundFill: new ol.style.Fill({
          color: "#ff0",
        }),
        padding: [2, 2, 2, 2],
        font: 'bold 13px "tahoma"',
      }),
    }),
    new ol.style.Style({
      image: new ol.style.Icon({
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        src: Url.get("Upload/0/poi") + n[5] + ".png",
      }),
      geometry: new ol.geom.Point(t),
    }),
  ]);
  window.stationLayer.getSource().addFeature(i);
}
function selectedStation(n, t) {
  var i, r;
  n &&
    n > 0 &&
    ((i = $("#point" + n)),
    i.hasClass("station-active")
      ? i.removeClass("station-active")
      : ($(".station-active").removeClass("station-active"),
        i.addClass("station-active")),
    (r = stations["station_" + n]),
    r && showStationPopup(r, t));
}
function searchStation(n) {
  var i = $("#searchStation").val() + "";
  for (var t in stations)
    i.length == 0 || stations[t][1].indexOf(i) > -1
      ? $("#point" + stations[t][0]).css("display", "")
      : $("#point" + stations[t][0]).css("display", "none");
  if (n.keyCode == 13)
    for (t in stations)
      stations[t][1] == i && selectedStation(stations[t][0], !0);
}
function addPoint(n, t, i) {
  var r = Url.get("Map.aspx/AddPoint?x=" + n + "&y=" + t + "&distance=" + i);
  openFancyboxByIframe(r, {
    width: "765px",
    height: "780px",
  });
}
function chkGeofence_Change(n = false) {
  $("#chkGeofence").is(":checked")
    ? (window.geofencesLayerGroup.setVisible(!0),
      $(".geofence-info").slideDown(),
      n || ShowGeofenceTable())
    : ($(".geofence-info").slideUp(),
      window.geofencesLayerGroup.setVisible(!1));
}
function toggleGeofenceListCommands() {
  window.GeofencePanel
    ? ($(".geofence-info .state-collapse").switchClass(
        "state-collapse",
        "state-expand",
        1e3,
        "easeInOutQuad"
      ),
      $(".geofence-info").css("height", "300px"),
      (window.GeofencePanel = !1))
    : ($(".geofence-info .state-expand").switchClass(
        "state-expand",
        "state-collapse",
        1e3,
        "easeInOutQuad"
      ),
      $(".geofence-info").css("height", "30px"),
      (window.GeofencePanel = !0));
}
function ShowGeofenceTable() {
  $("#geofence-table").html("");
  $("#geofence-loading").css("display", "");
  $.post(Url.get("Monitor.aspx/GeofenceListByJson"), {}, function (n) {
    var t, i;
    if (n && n.length > 0)
      for (geofences = [], n.shift(), t = 0; t < n.length; t++)
        (i = n[t]),
          (geofences["geofence_" + n[t][0]] = n[t]),
          $("#geofence-table").append(
            '<tr id="geo' +
              i[0] +
              '" onclick="selectedGeofence(' +
              i[0] +
              ')"><td nowrap="nowrap" class="type">' +
              getTypeGeofence(i[2]) +
              '</td><td nowrap="nowrap" class="name">' +
              i[1] +
              "</td></tr>"
          ),
          displayGeofenceOnMap(i);
    $("#geofence-loading").css("display", "none");
  });
}
function getTypeGeofence(n) {
  if (n) {
    if (n == "polygon")
      return (
        '<img src="' +
        Url.cdn(
          "Scripts/static/OpenLayers-2.11/theme/default/img/PolygonUp.png"
        ) +
        '"/>'
      );
    if (n == "line")
      return (
        '<img src="' +
        Url.cdn(
          "Scripts/static/OpenLayers-2.11/theme/default/img/PolylineUp.png"
        ) +
        '"/>'
      );
  }
  return null;
}
function displayGeofenceOnMap(n) {
  for (var t, r = n[3].split(";"), u = [], i = 0; i < r.length; i++)
    if (r[i].length > 0) {
      var f = r[i].split(","),
        e = f[0] / 1e6,
        o = f[1] / 1e6;
      u.push([e, o]);
    }
  n[2] == "polygon"
    ? ((t = new ol.Feature({
        name: n[1],
        type: "Polygon",
      })),
      t.setId(n[0]),
      t.setStyle([
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(0,60,136,.2)",
            width: 2,
          }),
          fill: new ol.style.Fill({
            color: "rgba(0, 0, 255, 0.13)",
          }),
        }),
        new ol.style.Style({
          text: new ol.style.Text({
            text: n[1],
            fill: new ol.style.Fill({
              color: "#000000",
            }),
            textAlign: "center",
            scale: 2,
          }),
        }),
      ]),
      t.setGeometry(
        new ol.geom.Polygon([u]).transform(realProjection, descartesProjection)
      ),
      window.geofenceLayer.getSource().addFeature(t))
    : n[2] == "line" &&
      ((t = new ol.Feature({
        name: n[1],
        type: "Line",
      })),
      t.setStyle([
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(0,60,136,.2)",
            width: 2,
          }),
        }),
        new ol.style.Style({
          text: new ol.style.Text({
            text: n[1],
            fill: new ol.style.Fill({
              color: "#000000",
            }),
            textAlign: "center",
            scale: 2,
          }),
        }),
      ]),
      t.setGeometry(
        new ol.geom.LineString(u).transform(realProjection, descartesProjection)
      ),
      window.geofenceLayer.getSource().addFeature(t));
}
function selectedGeofence(n) {
  const t = window.geofenceLayer.getSource().getFeatureById(n);
  if (t) {
    let n = t.getGeometry().getExtent();
    window.map.getView().fit(n, window.map.getSize(), {
      duration: 5e3,
    });
  }
}
function searchGeofence(n) {
  var i = $("#searchGeofence").val() + "";
  for (var t in geofences)
    i.length == 0 || geofences[t][1].indexOf(i) > -1
      ? $("#geo" + geofences[t][0]).css("display", "")
      : $("#geo" + geofences[t][0]).css("display", "none");
  if (n.keyCode == 13)
    for (t in geofences)
      geofences[t][1] == i && selectedGeofence(geofences[t][0]);
}
function searchTrailer(n) {
  var i = $("#searchTrailer").val() + "";
  for (var t in trailers)
    i.length == 0 || trailers[t][4].indexOf(i) > -1
      ? $("#trailer_" + trailers[t][0]).css("display", "")
      : $("#trailer_" + trailers[t][0]).css("display", "none");
  if (n.keyCode == 13)
    for (t in trailers) trailers[t][4] == i && selectTrailer(trailers[t][0]);
}
function loadTollgates() {
  request(
    Url.get("Monitor.aspx/GetTollgatesByJson"),
    {},
    function (n) {
      n && n.length > 0 && (n.shift(), renderTollgate(n));
    },
    function () {}
  );
}
function closeWinAdd() {
  closeFancybox();
  $("#chkStation").is(":checked") && ShowStationTable();
}
function renderTollgate(n) {
  window.tollgateLayer.getSource().clear();
  for (var t = 0; t < n.length; t++) getTollgateStyle(n[t]);
}
function getTollgateStyle(n) {
  if (n[3] < n[4]) {
    let t = n[3];
    n[3] = n[4];
    n[4] = t;
  }
  tollgates["tollgate_" + n[0]] = n;
  let i = (n[3] / 1e6).toFixed(6),
    r = (n[4] / 1e6).toFixed(6),
    u = [i, r];
  var f = new ol.geom.Point(new ol.proj.fromLonLat(u)),
    t = new ol.Feature({
      name: n[1],
      type: MARKER_TOLLGATE,
      id: n[0],
      data: n,
    });
  t.setStyle(tollgateStyle(n[5]));
  t.setGeometry(f);
  window.tollgateLayer.getSource().addFeature(t);
}
function tollgateStyle(n) {
  var t = [];
  return (
    n &&
      (t = [
        new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: window.urlVehicleStatus + "tollroad.svg",
            scale: 0.05,
          }),
        }),
        new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1.5],
            anchorxunits: "fraction",
            anchoryunits: "fraction",
            src: window.urlVehicleStatus + "arrows.svg",
            scale: 0.03,
            rotation: (Math.PI * n) / 180,
          }),
        }),
      ]),
    t
  );
}
function onMonitorTableSetup() {
  const n = Url.get("/monitor/SetupVariable/1");
  Fancybox.show(
    [
      {
        src: n,
        type: "iframe",
      },
    ],
    {
      on: {
        reveal: function () {
          $(".fancybox__content").css("width", "615px");
          $(".fancybox__content").css("height", "480px");
        },
        done: () => {
          const n = $(".fancybox__iframe")[0];
          n.contentWindow.postMessage([layoutGrid, defaultGridColumn], "*");
        },
      },
    }
  );
}
function setupContextMenuForTable() {
  $.contextMenu({
    selector: ".sidebar-left",
    zIndex: 1001,
    delay: 2e3,
    autoHide: !0,
    callback: function (n) {
      if ("mnu4" == n)
        window.historyLayer.getSource().clear(),
          $(".context-menu-item.icon-delete-route").css("display", "none");
      else if ("mnu5" == n && map.ContextLonlat) {
        var t = getGoogleLonlatFromLonlat(map.ContextLonlat);
        addPoint(t.lon, t.lat);
      }
    },
    items: {
      mnu2: {
        name: getLanguage("monitor.Status"),
        icon: "fa-filter",
        items: {
          mnu2item0: {
            html: "<div>" + getLanguage("monitor.Status") + "</div>",
            type: "html",
          },
          mnu2item9: {
            name: getLanguage("monitor.Status.DriverLogged"),
            type: "checkbox",
            click: "changeSearchOption9(this);",
          },
          mnu2item10: {
            name: getLanguage("monitor.Status.NoDriverLogged"),
            type: "checkbox",
            click: "changeSearchOption10(this);",
          },
          mnu2item1: {
            name: getLanguage("monitor.Status.Running"),
            type: "checkbox",
            click: "changeSearchOption1(this);",
          },
          mnu2item3: {
            name: getLanguage("monitor.Status.Stop"),
            type: "checkbox",
            click: "changeSearchOption3(this);",
          },
          mnu2item2: {
            name: getLanguage("monitor.Status.Idle"),
            type: "checkbox",
            click: "changeSearchOption2(this);",
          },
          mnu2item5: {
            name: getLanguage("monitor.Status.OverSpeed"),
            type: "checkbox",
            click: "changeSearchOption5(this);",
          },
          mnu2item6: {
            name: getLanguage("monitor.Status.SOS"),
            type: "checkbox",
            click: "changeSearchOption6(this);",
          },
          mnu2item4: {
            name: getLanguage("monitor.Status.LostGPRS"),
            type: "checkbox",
            click: "changeSearchOption4(this);",
          },
          mnu2item7: {
            name: getLanguage("monitor.Status.LostGPS"),
            type: "checkbox",
            click: "changeSearchOption7(this);",
          },
          mnu2item8: {
            name: getLanguage("monitor.Status.Connected"),
            type: "checkbox",
            click: "changeSearchOption8(this);",
          },
          mnu2item11: {
            name: getLanguage("monitor.Status.OverSpeed.ThreeTimes"),
            type: "checkbox",
            click: "changeSearchOption11(this);",
          },
          mnu2item12: {
            name: getLanguage("monitor.Status.OverSpeed.FourTimes"),
            type: "checkbox",
            click: "changeSearchOption12(this);",
          },
          mnu2item13: {
            name: getLanguage("monitor.Status.OverSpeed.FiveTimes"),
            type: "checkbox",
            click: "changeSearchOption13(this);",
          },
        },
      },
      mnu3: {
        name: getLanguage("monitor.Table.Setup"),
        icon: "fa-table",
        callback: function () {
          onMonitorTableSetup();
        },
      },
      sep4: "---------",
      mnu5: {
        name: getLanguage("monitor.Point.Add"),
        icon: "fa-map-marker",
        disabled: function () {
          return !window.map.MapFocus;
        },
      },
      sep3: "---------",
      mnu4: {
        name: getLanguage("monitor.RemoveRoute"),
        icon: "fa-eraser",
        disabled: function () {
          return !this.data("mnu4Disabled");
        },
      },
      sep2: "---------",
      mnu1: {
        name: getLanguage("monitor.Guide"),
        selected: !0,
        type: "checkbox",
        click: "chkHelp_Change(this)",
      },
    },
    events: {
      show: function (n) {
        var i = this,
          t = i.data();
        showGuide &&
          ((showGuide = !1),
          (t.mnu1 = !0),
          (t.mnu3item1 = !0),
          (t.mnu3item2 = !1),
          (t.mnu3item3 = !0),
          (t.mnu3item4 = !0),
          (t.mnu3item5 = !0),
          (t.mnu3item6 = !1),
          (t.mnu3item7 = !0),
          (t.mnu3item8 = !1),
          (t.mnu3item9 = !1),
          (t.mnu3item10 = !1));
        t.mnu2item1 = searchOption1;
        t.mnu2item2 = searchOption2;
        t.mnu2item3 = searchOption3;
        t.mnu2item4 = searchOption4;
        t.mnu2item5 = searchOption5;
        t.mnu2item6 = searchOption6;
        t.mnu2item7 = searchOption7;
        t.mnu2item8 = searchOption8;
        t.mnu2item9 = searchOption9;
        t.mnu2item10 = searchOption10;
        t.mnu2item11 = searchOption11;
        t.mnu2item12 = searchOption12;
        t.mnu2item13 = searchOption13;
        t.mnu3item10 = SENSORS.fuel.selected;
        t.mnu3item11 = SENSORS.temperature.selected;
        t.mnu3item12 = SENSORS.door.selected;
        t.mnu3item13 = SENSORS.airconditioner.selected;
        t.mnu3item14 = SENSORS.collision.selected;
        t.mnu3item15 = SENSORS.mixing.selected;
        t.mnu4Disabled =
          window.historyLayer.getSource().getFeatures().length == 0 ? 0 : 1;
        $.contextMenu.setInputValues(n, t);
      },
      hide: function (n) {
        var t = this;
        $.contextMenu.getInputValues(n, t.data());
        window.map.MapFocus = !1;
      },
    },
  });
}
function setupContextMenuForVehicleRow() {
  $.contextMenu({
    selector: ".vehicles",
    zIndex: 1001,
    triggers: !1,
    callback: function (n) {
      var t;
      if (
        ((hooterstatus = statuses["vec_" + contextVehicleId]?.[63]),
        (hooter = statuses["vec_" + contextVehicleId]?.[68]),
        "mnu1item1lv1" == n)
      )
        loadVehicleHistoryByTime(contextVehicleId, 900);
      else if ("mnu1item2lv1" == n)
        loadVehicleHistoryByTime(contextVehicleId, 1800);
      else if ("mnu1item3lv1" == n)
        loadVehicleHistoryByTime(contextVehicleId, 3600);
      else if ("mnu1item4lv1" == n)
        loadVehicleHistoryByTime(contextVehicleId, 7200);
      else if ("mnu1item5lv1" == n)
        loadVehicleHistoryByTime(contextVehicleId, 14400);
      else if ("mnu1item6lv1" == n)
        loadVehicleHistoryByTime(contextVehicleId, 28800);
      else if ("mnu1item7lv1" == n)
        loadVehicleHistoryByTime(contextVehicleId, 0);
      else if ("mnu1item1lv2" == n)
        (t = Util.date.getSeconds(new Date())),
          window.open(
            window.HISTORY_REPLAY_LINK +
              "?id=" +
              contextVehicleId +
              "&from=" +
              (t - 900)
          );
      else if ("mnu1item2lv2" == n)
        (t = Util.date.getSeconds(new Date())),
          window.open(
            window.HISTORY_REPLAY_LINK +
              "?id=" +
              contextVehicleId +
              "&from=" +
              (t - 1800)
          );
      else if ("mnu1item3lv2" == n)
        (t = Util.date.getSeconds(new Date())),
          window.open(
            window.HISTORY_REPLAY_LINK +
              "?id=" +
              contextVehicleId +
              "&from=" +
              (t - 3600)
          );
      else if ("mnu1item4lv2" == n)
        (t = Util.date.getSeconds(new Date())),
          window.open(
            window.HISTORY_REPLAY_LINK +
              "?id=" +
              contextVehicleId +
              "&from=" +
              (t - 7200)
          );
      else if ("mnu1item5lv2" == n)
        (t = Util.date.getSeconds(new Date())),
          window.open(
            window.HISTORY_REPLAY_LINK +
              "?id=" +
              contextVehicleId +
              "&from=" +
              (t - 14400)
          );
      else if ("mnu1item6lv2" == n)
        (t = Util.date.getSeconds(new Date())),
          window.open(
            window.HISTORY_REPLAY_LINK +
              "?id=" +
              contextVehicleId +
              "&from=" +
              (t - 28800)
          );
      else if ("mnu1item7lv2" == n)
        (t = Util.date.getSeconds(new Date())),
          window.open(
            window.HISTORY_REPLAY_LINK + "?id=" + contextVehicleId + "&from=0"
          );
      else if ("mnu1item8" == n)
        window.open(window.HISTORY_REPLAY_LINK + "?id=" + contextVehicleId);
      else if ("mnu2" == n) window.historyLayer.getSource().clear();
      else if ("mnu3" == n) showEventTab(), loadVehicleLog(contextVehicleId);
      else if ("mnu4" == n) VehicleTrackingFeedback(contextVehicleId);
      else if ("mnu5" == n) {
        const n = Url.get("Vehicle.aspx/UpdateVehicleMIFI/" + contextVehicleId);
        openFancyboxByIframe(n, {
          width: "700px",
          height: "290px",
        });
      } else
        "mnu6" == n
          ? WriteDriverCard(contextVehicleId)
          : "mnu7" == n
          ? LogInOutDriver(contextVehicleId)
          : "mnu8" == n
          ? TurnOnOffHooter(contextVehicleId, hooter)
          : "mnu9" == n
          ? TurnOnOffHooter(contextVehicleId, hooter)
          : "mnu10" == n
          ? showUpdateRemark(contextVehicleId)
          : "mnu11" == n
          ? WritePlateToImage(contextVehicleId)
          : "mnu12" == n
          ? CreateVehicleLoginCode(contextVehicleId)
          : "mnu13" == n
          ? SendAlertDrivingTimeHooter(contextVehicleId)
          : "mnu14" == n && CreateLocator(contextVehicleId);
    },
    items: {
      mnu1: {
        name: getLanguage("monitor.History.Replay"),
        icon: "fa-clock",
        items: {
          mnu1item1: {
            name: getLanguage("monitor.History.Last15Minutes"),
            icon: "fa-clock",
            items: {
              mnu1item1lv1: {
                name: getLanguage("monitor.History.QuickView"),
                icon: "fa-bolt",
              },
              mnu1item1lv2: {
                name: getLanguage("monitor.History.NewWindow"),
                icon: "fa-external-link",
              },
            },
          },
          mnu1item2: {
            name: getLanguage("monitor.History.Last30Minutes"),
            icon: "fa-clock",
            items: {
              mnu1item2lv1: {
                name: getLanguage("monitor.History.QuickView"),
                icon: "fa-bolt",
              },
              mnu1item2lv2: {
                name: getLanguage("monitor.History.NewWindow"),
                icon: "fa-external-link",
              },
            },
          },
          mnu1item3: {
            name: getLanguage("monitor.History.Last1Hour"),
            icon: "fa-clock",
            items: {
              mnu1item3lv1: {
                name: getLanguage("monitor.History.QuickView"),
                icon: "fa-bolt",
              },
              mnu1item3lv2: {
                name: getLanguage("monitor.History.NewWindow"),
                icon: "fa-external-link",
              },
            },
          },
          mnu1item4: {
            name: getLanguage("monitor.History.Last2Hour"),
            icon: "fa-clock",
            items: {
              mnu1item4lv1: {
                name: getLanguage("monitor.History.QuickView"),
                icon: "fa-bolt",
              },
              mnu1item4lv2: {
                name: getLanguage("monitor.History.NewWindow"),
                icon: "fa-external-link",
              },
            },
          },
          mnu1item5: {
            name: getLanguage("monitor.History.Last4Hour"),
            icon: "fa-clock",
            items: {
              mnu1item5lv1: {
                name: getLanguage("monitor.History.QuickView"),
                icon: "fa-bolt",
              },
              mnu1item5lv2: {
                name: getLanguage("monitor.History.NewWindow"),
                icon: "fa-external-link",
              },
            },
          },
          mnu1item6: {
            name: getLanguage("monitor.History.Last8Hour"),
            icon: "fa-clock",
            items: {
              mnu1item6lv1: {
                name: getLanguage("monitor.History.QuickView"),
                icon: "fa-bolt",
              },
              mnu1item6lv2: {
                name: getLanguage("monitor.History.NewWindow"),
                icon: "fa-external-link",
              },
            },
          },
          mnu1item7: {
            name: getLanguage("monitor.History.Today"),
            icon: "fa-clock",
            items: {
              mnu1item7lv1: {
                name: getLanguage("monitor.History.QuickView"),
                icon: "fa-bolt",
              },
              mnu1item7lv2: {
                name: getLanguage("monitor.History.NewWindow"),
                icon: "fa-external-link",
              },
            },
          },
          mnu1item8: {
            name: getLanguage("monitor.History.Option"),
            icon: "fa-external-link",
          },
        },
      },
      mnu3: {
        name: getLanguage("monitor.VehicleEvent"),
        icon: "fa-terminal",
      },
      mnu4: {
        name: getLanguage("monitor.VehicleTrackingFeedback"),
        icon: "fa-exclamation-triangle",
        visible: vehicleTrackingFeedback,
      },
      mnu5: {
        name: getLanguage("monitor.SetupMIFI"),
        icon: "fa-wifi",
        visible: function () {
          var n = statuses["vec_" + contextVehicleId];
          return n && n[56] == 29 ? !0 : !1;
        },
      },
      mnu6: {
        name: getLanguage("monitor.WriteDriverCard"),
        icon: "fa-id-card",
        visible: writeDriverCard,
      },
      mnu7: {
        name: getLanguage("monitor.LogInOutDriver"),
        icon: "fa-sign-in-alt",
        visible: logInOutDriver,
      },
      mnu8: {
        name: getLanguage("monitor.TurnOnHooter"),
        icon: "fa-volume-up",
        visible: function () {
          var n = statuses["vec_" + contextVehicleId];
          return n !== undefined && turnOnOffHooter && n[68] === "0";
        },
      },
      mnu9: {
        name: getLanguage("monitor.TurnOffHooter"),
        icon: "fa-volume-up",
        visible: function () {
          var n = statuses["vec_" + contextVehicleId];
          return n !== undefined && turnOnOffHooter && n[68] === "1";
        },
      },
      mnu10: {
        name: getLanguage("monitor.Remark"),
        icon: "fa-sticky-note",
        visible: createRemark,
      },
      mnu11: {
        name: getLanguage("monitor.WritePlateToImage"),
        icon: "fa-file-image",
        visible: writePlateToImage,
      },
      mnu12: {
        name: getLanguage("monitor.CreateVehicleLoginCode"),
        icon: "fa-sign-in",
        visible: createVehicleLoginCode,
      },
      mnu13: {
        name: getLanguage("monitor.AlertDrivingTimeHooter"),
        icon: "fa-paper-plane",
        visible: alertDrivingTimeHooter,
      },
      mnu14: {
        name: getLanguage("monitor.CreateLocator"),
        icon: "fa-share",
        visible: createLocator,
      },
      sep1: "---------",
      mnu2: {
        name: getLanguage("monitor.RemoveRoute"),
        icon: "fa-eraser",
        disabled: function () {
          return !this.data("mnu2Disabled");
        },
      },
    },
    events: {
      hide: function () {},
      show: function (n) {
        var i = this,
          t = i.data();
        t.mnu2Disabled =
          window.historyLayer.getSource().getFeatures().length == 0 ? 0 : 1;
        $.contextMenu.setInputValues(n, t);
      },
    },
  });
}
function resetFilter(n, t, i) {
  SENSOR_FILTER[n] = !1;
  $(i).removeClass("active");
  SENSOR_FILTER[t] = !1;
  $(i).removeClass("active");
  searchVehicle();
}
function toggleFilter(n, t) {
  SENSOR_FILTER[n]
    ? ((SENSOR_FILTER[n] = !1), $(t).removeClass("active"))
    : ((SENSOR_FILTER[n] = !0), $(t).addClass("active"));
  searchVehicle();
}
function resetFilterMIFIStatus() {
  resetFilter("mifi_on", "mifi_off", "#VehicleMIFIOffStatus");
}
function changeVehicleMIFIOnStatus() {
  toggleFilter("mifi_on", "#VehicleMIFIOnStatus");
}
function resetFilterDoorStatus() {
  resetFilter("door_open", "door_close", "#VehicleDoorOpenStatus");
}
function resetFilterAirConditionerStatus() {
  resetFilter(
    "airconditioner_on",
    "airconditioner_off",
    "#VehicleAirConditionerOffStatus"
  );
}
function resetFilterCollisionStatus() {
  resetFilter("collision_on", "collision_off", "#VehicleCollisionOffStatus");
}
function resetFilterMixingStatus() {
  SENSOR_FILTER.mixing_normal = !1;
  $("#VehicleMixingNormalStatus").removeClass("active");
  SENSOR_FILTER.mixing_mix = !1;
  $("#VehicleMixingMixStatus").removeClass("active");
  SENSOR_FILTER.mixing_discharge = !1;
  $("#VehicleMixingDischargeStatus").removeClass("active");
  searchVehicle();
}
function resetFilterPowerStatus() {
  resetFilter("power_on", "power_off", "#VehiclePowerOffStatus");
}
function changeVehicleDoorOpenStatus() {
  toggleFilter("door_open", "#VehicleDoorOpenStatus");
}
function changeVehicleDoorCloseStatus() {
  toggleFilter("door_close", "#VehicleDoorCloseStatus");
}
function changeVehicleAirConditionerOnStatus() {
  toggleFilter("airconditioner_on", "#VehicleAirConditionerOnStatus");
}
function changeVehicleAirConditionerOffStatus() {
  toggleFilter("airconditioner_off", "#VehicleAirConditionerOffStatus");
}
function changeVehicleCollisionOnStatus() {
  toggleFilter("collision_on", "#VehicleCollisionOnStatus");
}
function changeVehicleCollisionOffStatus() {
  toggleFilter("collision_off", "#VehicleCollisionOffStatus");
}
function changeVehicleMixingNormalStatus() {
  toggleFilter("mixing_normal", "#VehicleMixingNormalStatus");
}
function changeVehicleMixingMixStatus() {
  toggleFilter("mixing_mix", "#VehicleMixingMixStatus");
}
function changeVehicleMixingDischargeStatus() {
  toggleFilter("mixing_discharge", "#VehicleMixingDischargeStatus");
}
function changeVehiclePowerOnStatus() {
  toggleFilter("power_on", "#VehiclePowerOnStatus");
}
function changeVehiclePowerOffStatus() {
  toggleFilter("power_off", "#VehiclePowerOffStatus");
}
function showSelectedSensors() {
  var t, n;
  for (t in SENSORS)
    (n = SENSORS[t]),
      n &&
        (n.selected
          ? ($("#" + n.id).addClass("btn-success"),
            n.guide && $("#" + n.guide).css("display", ""))
          : ($("#" + n.id).removeClass("btn-success"),
            n.guide && $("#" + n.guide).css("display", "none"),
            n.resetFilter && n.resetFilter()));
}
function selectSensor(n) {
  var t = SENSORS[n];
  t &&
    (showHideVehicleGridColumn(n, !0),
    setLocalStorage("monitor.sensor." + n, t.selected ? 1 : 0),
    n == "road"
      ? $.notify(
          {
            title: "",
            icon: "fa fa-tachometer",
            message: t.selected
              ? getLanguage("monitor.Guide.SpeedType.Road")
              : getLanguage("monitor.Guide.SpeedType.VehicleType"),
          },
          {
            type: "success",
            placement: {
              from: "top",
              align: "center",
              animate: {
                enter: "animated fadeInDown",
                exit: "animated fadeOutUp",
              },
            },
          }
        )
      : n == "video" && showVideoMdvr(t, selectVehicle));
}
function estimateDistance(n) {
  async function t() {
    var t = statuses["vec_" + n],
      i,
      o,
      r,
      e,
      s,
      f,
      u;
    if (t) {
      i = [];
      for (o in statuses)
        (r = statuses[o]),
          r &&
            r[0] != t[0] &&
            ((e = Gis.getDistance(t[2], t[3], r[2], r[3])),
            (s = parseInt(e / 16.6)),
            i.push({
              Id: r[0],
              Plate: r[32],
              Distance: Math.round(parseInt(e / 100) / 10),
              ImgSource: getVehicleStatus(r),
              Coordinate: [t[2], t[3], r[2], r[3]],
              Time: Util.date.formatTimeFromSeconds(s),
            }));
      for (
        await $.post(
          Url.get("Monitor.aspx/StationListByJson"),
          {},
          function (n) {
            if (n && n.length > 0) {
              n.shift();
              for (let r = 0; r < n.length; r++) {
                const u = n[r];
                if (u) {
                  const n = Gis.getDistance(t[2], t[3], u[3], u[4]),
                    r = parseInt(n / 16.6),
                    f = Url.get("Upload/0/poi") + u[5] + ".png";
                  i.push({
                    Id: u[0],
                    Plate: u[1],
                    Distance: Math.round(parseInt(n / 100) / 10),
                    ImgSource: f,
                    Coordinate: [t[2], t[3], u[3], u[4]],
                    Time: Util.date.formatTimeFromSeconds(r),
                  });
                }
              }
            }
            $("#popup-loading").css("display", "none");
          }
        ),
          i.sort(sortbyProperty("Distance")),
          f =
            '<div style="max-height:600px;overflow:auto;"><table class="estimate-table">',
          f +=
            '<tr><td colspan="5"><b>' +
            getLanguage("monitor.Function.CalculateDistance.From") +
            " " +
            t[32] +
            " " +
            getLanguage("monitor.Function.CalculateDistance.To") +
            ":</b></td></tr>",
          f +=
            '<tr class="header"><td></td><td>' +
            getLanguage("monitor.Function.CalculateDistance.Objective") +
            `</td><td>` +
            getLanguage("monitor.Function.CalculateDistance.Distance") +
            "</td><td>" +
            getLanguage("monitor.Function.CalculateDistance.Time") +
            "</td><td></td></tr>",
          u = 0;
        u < i.length;
        u++
      ) {
        const { sCoord: n, dCoord: t } = Gis.getCoorsSD(...i[u].Coordinate),
          r = `https://www.google.com/maps?saddr=${n.join(",")}&daddr=${t.join(
            ","
          )}`;
        f +=
          '<tr">' +
          `<td> <img style="width: 24px;" src="${
            i[u]?.ImgSource || ""
          }" alt="Vehicle Status"/> </td>` +
          `<td class="title"> ${i[u].Plate} </td>` +
          `<td class="speed"> ${i[u].Distance} </td>` +
          `<td class="time"> ${i[u].Time} </td>` +
          `<td class="title"> <a href=${r} target="_blank"> ${getLanguage(
            "monitor.Function.CalculateDistance.Navigate"
          )} </a> </td>` +
          "</tr>";
      }
      f += "<table></div>";
      Fancybox.show([
        {
          src: `<div>
                        ${f}
                    </div>`,
          type: "html",
        },
      ]);
    }
  }
  $("#popup-loading").css("display", "");
  t();
}
function getTitleForMapByVehicle(n, t) {
  return (
    getLanguage("monitor.Plate") +
    ": " +
    t[32] +
    "\n" +
    getLanguage("monitor.DateTime") +
    ": " +
    formatDateTime(getTime(t[1])) +
    (t[4] > 0
      ? "\n" + getLanguage("monitor.Speed") + ": " + t[4] / 100 + " km/h"
      : "\n" + getLanguage("monitor.StopTime") + ": " + getStopTime(t)) +
    "\n--------------------------------\n" +
    getLanguage("monitor.GpsMileage") +
    ": " +
    t[9] / 100 +
    "\n" +
    getLanguage("monitor.Address") +
    ": " +
    t[7] +
    " " +
    getRegion(t[34])
  );
}
function getTitleForMapByStation(n) {
  $("#map").attr("title", getLanguage("monitor.Point") + ": " + n[1]);
}
function getTitleForMapByTollgate(n) {
  $("#map").attr(
    "title",
    getLanguage("monitor.Tollgate") +
      ": " +
      n[1] +
      "\n" +
      getLanguage("monitor.Address") +
      ": " +
      n[2]
  );
}
function showStationPopup(n, t) {
  currentPopupVehicle = 0;
  removeCurrentPopup();
  var i = new ol.proj.fromLonLat([n[3] / 1e6, n[4] / 1e6]);
  t && (window.map.getView().setCenter(i), window.map.getView().setZoom(16));
  window.map.updateSize();
  popup.show(
    i,
    `<b> ${getLanguage("monitor.Name")} </b>: ${n[1]} <br/>` +
      `<b> ${getLanguage("monitor.Radius")} </b>:  ${n[2]} <br/>` +
      (n[7] > 0
        ? `<b> ${getLanguage("monitor.MaxSpeed")}(km/h) </b>:  ${n[7]} <br/>`
        : "")
  );
}
function showTollgatePopup(n) {
  currentPopupVehicle = 0;
  removeCurrentPopup();
  let t = tollgates["tollgate_" + n];
  if (t) {
    var i = new ol.proj.fromLonLat([t[3] / 1e6, t[4] / 1e6]);
    popup.show(
      i,
      "<b>" +
        getLanguage("monitor.Tollgate") +
        "</b>: " +
        t[1] +
        "<br/><b>" +
        getLanguage("monitor.Address") +
        "</b>: " +
        t[2]
    );
  }
}
function showTrailerPopup(n, t) {
  if (
    ((currentPopupVehicle = 0),
    removeCurrentPopup(),
    t == "" &&
      (t =
        trailers["trailer_" + n[0]] != null
          ? trailers["trailer_" + n[0]][4]
          : ""),
    n && t != "")
  ) {
    var i = new ol.proj.fromLonLat([n[3] / 1e6, n[4] / 1e6]);
    popup.show(
      i,
      "<b>" +
        getLanguage("monitor.Trailer") +
        "</b>: " +
        t +
        "<br/><b>" +
        getLanguage("monitor.Address") +
        "</b>: " +
        n[8]
    );
  }
}
function changeSearchOption1(n) {
  searchOption1 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption2(n) {
  searchOption2 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption3(n) {
  searchOption3 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption4(n) {
  searchOption4 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption5(n) {
  searchOption5 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption6(n) {
  searchOption6 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption7(n) {
  searchOption7 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption8(n) {
  searchOption8 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption9(n) {
  searchOption9 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption10(n) {
  searchOption10 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption11(n) {
  searchOption11 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption12(n) {
  searchOption12 = n.checked ? 1 : 0;
  searchVehicle();
}
function changeSearchOption13(n) {
  searchOption13 = n.checked ? 1 : 0;
  searchVehicle();
}
function showVehicleStatus1() {
  searchOption1 = !searchOption1;
  searchVehicle();
}
function showVehicleStatus2() {
  searchOption2 = !searchOption2;
  searchVehicle();
}
function showVehicleStatus3() {
  searchOption3 = !searchOption3;
  searchVehicle();
}
function showVehicleStatus4() {
  searchOption4 = !searchOption4;
  searchVehicle();
}
function showVehicleStatus5() {
  searchOption5 = !searchOption5;
  searchVehicle();
}
function showVehicleStatus6() {
  searchOption6 = !searchOption6;
  searchVehicle();
}
function showVehicleStatus7() {
  searchOption7 = !searchOption7;
  searchVehicle();
}
function showVehicleStatus8() {
  searchOption8 = !searchOption8;
  searchVehicle();
}
function showVehicleStatus9() {
  searchOption9 = !searchOption9;
  searchVehicle();
}
function showVehicleStatus10() {
  searchOption10 = !searchOption10;
  searchVehicle();
}
function showVehicleStatus11() {
  searchOption11 = !searchOption11;
  searchVehicle();
}
function showVehicleStatus12() {
  searchOption12 = !searchOption12;
  searchVehicle();
}
function showVehicleStatus13() {
  searchOption13 = !searchOption13;
  searchVehicle();
}
function toggleFilterVehicle(n, t) {
  n ? $(t).addClass("status-active") : $(t).removeClass("status-active");
}
function searchVehicle(n) {
  var t = $("#txtSearchBox").val() + "";
  searchVehicleByFilters(
    t,
    currFilterVehicleGroupId ?? (n || searchByGroupValue)
  );
  toggleFilterVehicle(searchOption1, "#searchOption1");
  toggleFilterVehicle(searchOption2, "#searchOption2");
  toggleFilterVehicle(searchOption3, "#searchOption3");
  toggleFilterVehicle(searchOption4, "#searchOption4");
  toggleFilterVehicle(searchOption5, "#searchOption5");
  toggleFilterVehicle(searchOption6, "#searchOption6");
  toggleFilterVehicle(searchOption7, "#searchOption7");
  toggleFilterVehicle(searchOption8, "#searchOption8");
  toggleFilterVehicle(searchOption9, "#searchOption9");
  toggleFilterVehicle(searchOption10, "#searchOption10");
  toggleFilterVehicle(searchOption11, "#searchOption11");
  toggleFilterVehicle(searchOption12, "#searchOption12");
  toggleFilterVehicle(searchOption13, "#searchOption13");
}
function searchVehicleByFilters(n, t) {
  var u, r, f, e, i;
  $(".vehicle-group").css("display", "none");
  for (u in vehicles)
    (r = vehicles[u]),
      (f = statuses[u]),
      r &&
        ((e = searchVehicleByFilter(r, f, n, t)),
        (i = $("#vec" + r[0])),
        e
          ? (i.css("display", ""),
            $("." + i.attr("parent")).css("display", ""),
            i.attr("hide", !1),
            i.attr("vehicleId", r[0]))
          : (i.attr("hide", !0), i.css("display", "none")));
}
function searchVehicleByFilter(n, t, i, r = "all") {
  var f, e, o, s, h;
  if (n) {
    var c = !1,
      u = !1,
      l = !1;
    if (
      ((l =
        r !== "all"
          ? r == defaultUnGroup
            ? n[26] == ""
            : n[27] == String(r)
          : !0),
      (c = i.length > 0 ? n[1]?.regexIndexOf(i) >= 0 : !0),
      t
        ? ((f = nowTime - t[1] <= 3600),
          searchOption1 ||
          searchOption2 ||
          searchOption3 ||
          searchOption4 ||
          searchOption5 ||
          searchOption6 ||
          searchOption7 ||
          searchOption8 ||
          searchOption9 ||
          searchOption10 ||
          searchOption11 ||
          searchOption12 ||
          searchOption13
            ? (searchOption1 && f && (u = u || (searchOption1 && t[4] > 0)),
              searchOption2 && f && (u = u || (t[4] == 0 && (t[8] & 1) > 0)),
              searchOption3 && f && (u = u || (t[8] & 1) == 0),
              searchOption4 && (u = u || nowTime - t[1] > 3600),
              searchOption5 && f && (u = u || t[4] > getVehicleMaxSpeed(t)),
              searchOption6 && f && (u = u || (t[8] & 16) > 0),
              searchOption7 && f && (u = u || t[6] < 3),
              searchOption8 && f && (u = u || nowTime - t[1] <= 3600),
              searchOption9 && f && (u = u || t[33] > 0),
              searchOption10 && f && (u = u || t[33] == 0),
              searchOption11 && f && (u = u || t[58] == 3),
              searchOption12 && f && (u = u || t[58] == 4),
              searchOption13 && f && (u = u || t[58] >= 5))
            : (u = !0))
        : (u = !(
            searchOption1 |
            searchOption2 |
            searchOption3 |
            searchOption4 |
            searchOption5 |
            searchOption6 |
            searchOption7 |
            searchOption8 |
            searchOption9 |
            searchOption10 |
            searchOption11 |
            searchOption12 |
            searchOption13
          )),
      (e = !0),
      (o = !1),
      SENSOR_FILTER.power_on &&
        ((e = !1), n && t && (t[8] & 1) > 0 && (o = !0)),
      SENSOR_FILTER.power_off &&
        ((e = !1), n && t && (t[8] & 1) > 0 && (o = !0)),
      SENSOR_FILTER.door_open &&
        ((e = !1),
        n &&
          t &&
          n[19] &&
          n[19].length > 0 &&
          n[19][1] > 0 &&
          (t[8] & 2) > 0 &&
          (o = !0)),
      SENSOR_FILTER.door_close &&
        ((e = !1),
        n &&
          t &&
          n[19] &&
          n[19].length > 0 &&
          n[19][1] > 0 &&
          (t[8] & 2) == 0 &&
          (o = !0)),
      SENSOR_FILTER.airconditioner_on &&
        ((e = !1),
        n &&
          t &&
          n[19] &&
          n[19].length > 0 &&
          n[19][2] > 0 &&
          (t[8] & 4) > 0 &&
          (o = !0)),
      SENSOR_FILTER.airconditioner_off &&
        ((e = !1),
        n &&
          t &&
          n[19] &&
          n[19].length > 0 &&
          n[19][2] > 0 &&
          (t[8] & 4) == 0 &&
          (o = !0)),
      SENSOR_FILTER.collision_on &&
        ((e = !1),
        n &&
          t &&
          n[19] &&
          n[19].length > 0 &&
          n[19][10] > 0 &&
          (t[8] & 1024) > 0 &&
          (o = !0)),
      SENSOR_FILTER.collision_off &&
        ((e = !1),
        n &&
          t &&
          n[19] &&
          n[19].length > 0 &&
          n[19][10] > 0 &&
          (t[8] & 1024) == 0 &&
          (o = !0)),
      SENSOR_FILTER.mixing_normal && ((e = !1), t && t[27] && t[27].length > 0))
    )
      for (s = 0; s < t[27].length; s++)
        (h = t[27][s]), h.SensorTypeId == 16 && h.Value == 0 && (o = !0);
    if (SENSOR_FILTER.mixing_mix && ((e = !1), t && t[27] && t[27].length > 0))
      for (s = 0; s < t[27].length; s++)
        (h = t[27][s]), h.SensorTypeId == 16 && h.Value == 1 && (o = !0);
    if (
      SENSOR_FILTER.mixing_discharge &&
      ((e = !1), t && t[27] && t[27].length > 0)
    )
      for (s = 0; s < t[27].length; s++)
        (h = t[27][s]), h.SensorTypeId == 16 && h.Value == 2 && (o = !0);
    return l && c && u && (e || o);
  }
  return !1;
}
function showErrorNotification() {
  bootoast.toast({
    message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
    type: "danger",
    position: "bottom",
  });
}
function showSuccessNotification() {
  bootoast.toast({
    message: "Cập nhật thành công.",
    type: "success",
    position: "bottom",
  });
}
function suffixValue2(n, t, i = true) {
  const r =
    {
      l: "ℓ",
      c: "°C",
      p: "%",
    }[t] || "";
  return (i ? n / 100 : n) + "" + r;
}
function transformIcon(n) {
  const t = {
    [keyTemperature]: `<i class="fas fa-thermometer-three-quarters"></i>`,
    [keyHumidity]: '<i class="fas fa-burn"></i>',
    [keyFuel]: '<i class="fas fa-gas-pump"></i>',
  };
  return t[n] || "";
}
function getSensorValuesCustom(n, t) {
  var u = "",
    r = t.SensorTypeId,
    f,
    i;
  if (r > 0) {
    f = n[1] - t.GpsTime;
    const e = f > 600 ? "sensor-offline" : "sensor-online";
    r == 71
      ? t.Data &&
        ((i = JSON.parse(t.Data)), i && (u += suffixValue2(i.T1, "c")))
      : r == 18 || r == 34 || r == 35 || r == 72
      ? t.Data &&
        ((i = JSON.parse(t.Data)),
        i && (u += suffixValue2(i.T1, "c") + ", " + suffixValue2(i.T2, "c")))
      : r == 73
      ? t.Data &&
        ((i = JSON.parse(t.Data)),
        i &&
          (u +=
            suffixValue2(i.T1, "c") +
            ", " +
            suffixValue2(i.T2, "c") +
            " \n " +
            suffixValue2(i.T3, "c")))
      : r == 74
      ? t.Data &&
        ((i = JSON.parse(t.Data)),
        i &&
          (u +=
            suffixValue2(i.T1, "c") +
            ", " +
            suffixValue2(i.T2, "c") +
            " \n " +
            suffixValue2(i.T3, "c") +
            ", " +
            suffixValue2(i.T4, "c")))
      : r == 66 || r == 67 || r == 68
      ? t.Data &&
        ((i = JSON.parse(t.Data)),
        i && (u += suffixValue2(i.T, "c") + ", " + suffixValue2(i.H, "p")))
      : (u += getSensorValue(t));
  }
  return u;
}
function suffixValue(n, t, i = true) {
  const r =
    {
      l: "&#8467;",
      c: "&#176;C",
      p: "%",
    }[t] || "";
  return (i ? n / 100 : n) + "" + r;
}
function getSensorValue(n) {
  const i = n?.SensorTypeId,
    t = n?.Value;
  if (containerSensorName.includes(i)) return suffixValue2(t, "c");
  if (i === 16) {
    if (t == 0) return "Bình Thường";
    if (t == 1) return "Trộn";
    if (t == 2) return "Xả";
  } else {
    if (i === 15) return "Chất Lỏng";
    if (sensorLiter.includes(i)) return suffixValue2(t, "l");
  }
  return t;
}
function commonNameReturn(n, t, i) {
  if (window.getVehicleField) {
    var r = window.getVehicleField(t[0], "NAME-SENSOR-" + i);
    if (r && r.length > 0) return r;
  }
  return n;
}
function getSensorName(n, t) {
  return containerSensorName.includes(t)
    ? commonNameReturn(keyTemperature, n, t)
    : t === 13 || t === 16
    ? "Bồn Trộn"
    : t === 15
    ? "Chất Lỏng"
    : sensorLiter.includes(t)
    ? commonNameReturn(keyFuel, n, t)
    : "[VIETMAP-SENSOR-" + t + "]";
}
function getSensorNameByVehicle(n, t) {
  if (window.getVehicleField) {
    var i = window.getVehicleField(n, "NAME-SENSOR-" + t);
    if (i && i.length > 0) return i;
  }
  return getLanguage("VIETMAP-SENSOR-" + t);
}
function getContainerSensorName(n, t) {
  return containerSensorName.includes(t)
    ? commonNameReturn(keySetpoint, n, t)
    : "[VIETMAP-SENSOR-" + t + "]";
}
function showChartDrivingTime(n, t) {
  return (() => {
    const i = statuses["vec_" + n];
    let r = "",
      u = "",
      f = "";
    const e = i[1] >= todayTime;
    if (i[0] && e) {
      const n = Util.date.formatDate(new Date()),
        t = Util.date.formatDateTime3(new Date()),
        e = Util.date.formatDateTime3(
          new Date(new Date("2010/01/01").setSeconds(nowTime - i[16]))
        );
      if (
        (e && t && (r = () => showTripDetail(i[0], e, t, i[33].toString(), !0)),
        n)
      ) {
        let t = i[0];
        i[33] != 0 && i[33].toString() && (t = 0);
        const r = i?.[73] > 1;
        u = () =>
          showTripDailyDrivingDetail(
            t,
            n + " 00:00",
            n + " 23:59",
            i[33].toString(),
            !0,
            r
          );
        let { start: e, end: o } = getWeekRange();
        const s = Util.date.formatDate(e),
          h = Util.date.formatDate(o);
        f = () => showTripWeeklyDrivingDetail(t, s, h, i[33].toString(), !0);
      }
    }
    const o = {
      "4h": r,
      "10h": u,
      "48h": f,
    }[t];
    o?.();
  }).call(this);
}
function loadVehicleFields() {
  vehicleFieldCounter++;
  vehicleFieldCounter > 300 &&
    ((vehicleFieldCounter = 0),
    $.post(
      Url.get("Monitor.aspx/GetFields"),
      {
        vehicles: "",
        keys: "",
      },
      function (n) {
        if (n && n.length > 0)
          for (var t = 0; t < n.length; t++)
            vehicleFields[n[t].VehicleId]
              ? (vehicleFields[n[t].VehicleId][n[t].FieldName] =
                  n[t].FieldValue)
              : ((vehicleFields[n[t].VehicleId] = []),
                (vehicleFields[n[t].VehicleId][n[t].FieldName] =
                  n[t].FieldValue));
      }
    ));
}
function getVehicleField(n, t) {
  return vehicleFields[n] && vehicleFields[n][t] ? vehicleFields[n][t] : "";
}
function showVideoMdvr(n, t) {
  if (n.selected) {
    if (($(".video-panel").css("display", ""), t > 0)) {
      loadMdvrRealTime(t);
      return;
    }
    $.notify(
      {
        title: "",
        icon: "fa fa-video",
        message: getLanguage("monitor.video.realtime"),
      },
      {
        type: "success",
        placement: {
          from: "top",
          align: "center",
          animate: {
            enter: "animated fadeInDown",
            exit: "animated fadeOutUp",
          },
        },
      }
    );
  } else
    $(".video-panel").css("display", "none"), $("#video_mdvr").attr("src", "");
}
function loadMdvrRealTime(n) {
  window.SENSORS.video.selected &&
    ($("#loading").css("display", ""),
    $.post(
      Url.get("Monitor.aspx/GetMdvrById"),
      {
        id: n,
      },
      function (n) {
        if (n) {
          $("#loading").css("display", "none");
          n.exist
            ? $("#error").css("display", "none")
            : $("#error").css("display", "");
          $("#video_mdvr").attr(
            "src",
            "http://mdvr.quanlyxe.vn/808gps/open/player/realtime.html?"
          );
        }
        $(".video-panel").css("display", "");
        $("#loading").css("display", "none");
      }
    ).fail(function () {
      $("#loading").css("display", "none");
    }));
}
function toggleMdvrPhotoCommands() {
  window.MdvrPhotoPanel
    ? ($(".mdvr-photo-info .state-collapse").switchClass(
        "state-collapse",
        "state-expand",
        1e3,
        "easeInOutQuad"
      ),
      $(".mdvr-photo-info").css("height", "300px"),
      (window.MdvrPhotoPanel = !1))
    : ($(".mdvr-photo-info .state-expand").switchClass(
        "state-expand",
        "state-collapse",
        1e3,
        "easeInOutQuad"
      ),
      $(".mdvr-photo-info").css("height", "30px"),
      (window.MdvrPhotoPanel = !0));
}
function chkMdvrPhoto_Change() {
  var r = $("#chkMdvrPhoto"),
    n,
    i,
    t;
  r.is(":checked") || $("#chkMdvrPhoto").trigger("click");
  $("#chkMdvrPhoto").is(":checked")
    ? $(".mdvr-photo-info").slideDown()
    : $(".mdvr-photo-info").slideUp();
  n = [];
  for (i in vehicles)
    vehicles[i] &&
      n.push({
        id: vehicles[i][0],
        plate: vehicles[i][1],
      });
  if (($("#selectVehicleMdvr").html(""), n.length > 0)) {
    for (n.sort(sortbyProperty("plate")), t = 0; t < n.length; t++)
      $("#selectVehicleMdvr").append(
        '<option value="' + n[t].id + '">' + n[t].plate + "</option>"
      );
    $("#selectVehicleMdvr").select2().trigger("change");
  }
}
function loadMdvrPhoto(n) {
  n && paging.page != 0 && (paging.page += n);
  var t = $("#selectVehicleMdvr").val();
  $.post(
    Url.get("Monitor.aspx/GetMdvrDeviceById"),
    {
      id: t,
    },
    function (n) {
      if (n)
        if (n.exist) {
          data = n.data;
          var i = $("#txtMdvrFromDate").val(),
            r = $("#txtMdvrFromTime").val(),
            u = $("#txtMdvrToDate").val(),
            f = $("#txtMdvrToTime").val(),
            t = data.split(",");
          $(".photos").html("");
          $(".prev").css("display", "none");
          $(".next").css("display", "none");
          $(".loadPhoto").css("display", "");
          $.post(
            Url.get("Monitor.aspx/GetMdvrPhoto"),
            {
              deviceId: t[2],
              session: t[0],
              from: i + " " + r + ":00",
              to: u + " " + f + ":00",
              currentPage: paging.page,
              pageRecord: 10,
            },
            function (n) {
              var i, t;
              if (n && n.Result == 0) {
                for (
                  paging.page = n.Pagination.CurrentPage,
                    paging.total = n.Pagination.TotalPages,
                    paging.pageSize = n.Pagination.PageRecords,
                    n.Pagination.NextPage <= n.Pagination.TotalPages &&
                      n.Pagination.TotalPages > 1 &&
                      (n.Pagination.CurrentPage < n.Pagination.NextPage &&
                        $(".next").css("display", ""),
                      (n.Pagination.TotalPages =
                        n.Pagination.NextPage ||
                        n.Pagination.CurrentPage > 1) &&
                        $(".prev").css("display", "")),
                    i = [],
                    t = 0;
                  t < n.Infos.length;
                  t++
                )
                  $(".photos").append(
                    "<img src=" + n.Infos[t].DownloadUrl + "/>"
                  ),
                    i.push({
                      src: n.Infos[t].DownloadUrl,
                      type: "image",
                      caption:
                        "<b> " +
                        n.Infos[t].Channel +
                        " - " +
                        new Date(n.Infos[t].FileTimeI) +
                        "<br/>" +
                        n.Infos[t].Position +
                        "</b>",
                    });
                Fancybox.show(i, {
                  startIndex: 0,
                  caption: {
                    position: "bottom",
                  },
                  wheel: "slide",
                });
              }
              $(".loadPhoto").css("display", "none");
            }
          ).fail(function () {
            $(".loadPhoto").css("display", "none");
          });
        } else data = "";
      $("#loading").css("display", "none");
    }
  ).fail(function () {
    data = "";
    $("#loading").css("display", "none");
  });
}
function showImg(n) {
  Fancybox.show([
    {
      src: n.src,
      type: "image",
    },
  ]);
}
function removeVehicleBillingExpiredPopup() {
  $("#vehicle-billing-expired").remove();
}
function displayVehicleBillingExpired() {
  $("#vehicle-billing-expired").remove();
}
function closeWinVehicleMIFI(n) {
  closeFancybox();
  n &&
    (showNotification({
      lv: 1,
      msg: getLanguage("updatesuccess"),
    }),
    (window.vehicleFieldCounter = 600),
    (window.timer = 2));
}
function displayVehicleMIFIStatus(n) {
  if (n && n[56] == 29) {
    var t = getVehicleField(n[0], "AT38_MIFI") == "true";
    t
      ? ($("#mini-status-onoff").addClass("mifi-status-on"),
        $("#mini-status-onoff").removeClass("mifi-status-off"))
      : ($("#mini-status-onoff").removeClass("mifi-status-on"),
        $("#mini-status-onoff").addClass("mifi-status-off"));
    $("#mifi-status").css("display", "");
    (MIFI_VEHICLE != n[0] || n[1] - MIFI_TIME > 300) &&
      ((MIFI_VEHICLE = n[0]), (MIFI_TIME = n[1]), loadVehicleMIFIStatus(n[0]));
  } else $("#mifi-status").css("display", "none");
}
function loadVehicleMIFIStatus(n) {
  request(
    Url.get("Vehicle.aspx/GetVehicleMIFIStatus"),
    {
      id: n,
    },
    function (n) {
      var t = 0,
        i = 0;
      n && n.success && ((t = n.Today), (i = n.Month));
      $("#mini-status-day").html(t);
      $("#mini-status-month").html(i);
    },
    function () {}
  );
}
function monitorPacketTransmitted(n, t, i) {
  if ((t || (t = n), !i)) {
    showDataFailed(t, getLanguage("gov.NoND91"));
    return;
  }
  const r = monitorQueue.some((n) => n.plate === t);
  r
    ? showDataProcessing(t, getLanguage("gov.ProcessingData"))
    : (monitorQueue.push({
        plate: t,
        token: "",
      }),
      interval || (interval = setInterval(checkGovFleetMonitorStatus, 1e3)));
  $("#btn_check_tcdb_" + t).attr("disabled", !0);
  showDataProcessing(t, getLanguage("gov.ProcessingData"));
}
async function callGovFleetMonitorApi(n) {
  try {
    const t = await fetch(govFleetMonitorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(n),
    });
    return t.ok ? await t.json() : null;
  } catch (t) {
    showDataFailed(n.plate, t);
  }
}
async function checkGovFleetMonitorStatus() {
  if (monitorQueue.length === 0) {
    clearInterval(interval);
    interval = null;
    return;
  }
  if (!isRequestInProgress) {
    const n = monitorQueue[0];
    isRequestInProgress = !0;
    try {
      const t = await callGovFleetMonitorApi({
        plate: n.plate,
        token: n.token,
      });
      t
        ? t.status === 1
          ? (n.token = t.token)
          : t.status === 2
          ? (showDataSuccess(t.data), resetGovFleetMonitorStatus(n))
          : t.status === 3 || t.status === 4
          ? (showDataFailed(n.plate, getLanguage("gov.NoData")),
            resetGovFleetMonitorStatus(n))
          : t.status === 5 &&
            (showDataFailed(n.plate, getLanguage("gov.FetchDataFailed")),
            resetGovFleetMonitorStatus(n))
        : (showDataFailed(n.plate, getLanguage("gov.FetchDataFailed")),
          resetGovFleetMonitorStatus(n));
    } finally {
      isRequestInProgress = !1;
    }
  }
}
function resetGovFleetMonitorStatus(n) {
  $(`#btn_check_tcdb_${n.plate}`).attr("disabled", !1);
  monitorQueue.shift();
}
function ShowGovFleetMonitorTable(n, t) {
  const i = $(".vehicles-gov-monitor tbody");
  let r = i.find(`tr[data-plate="${n}"]`);
  r.length === 0
    ? ((r = $(`<tr data-plate="${n}"><td>${n}</td><td>${t}</td></tr>`)),
      i.prepend(r))
    : r.html(`<td>${n}</td><td>${t}</td>`);
  i.find("tr").length > 0 && $(".vehicle-gov-check-result").show();
  i.find("tr").length > 5 && i.find("tr").last().remove();
}
function showDataSuccess(n) {
  bootoast.toast({
    message: n,
    type: "success",
    position: "top-right",
    icon: "success",
    animationDuration: "300",
    dismissable: !0,
    timeout: 10,
  });
}
function showDataProcessing(n, t) {
  bootoast.toast({
    message: `${getLanguage("gov.Vehicle")} ${n} ${t}`,
    type: "info",
    position: "top-right",
    icon: "info",
    animationDuration: "300",
    dismissable: !0,
    timeout: 1,
  });
}
function showDataFailed(n, t) {
  bootoast.toast({
    message: `${getLanguage("gov.Vehicle")} ${n} ${t}`,
    type: "warning",
    position: "top-right",
    icon: "danger",
    animationDuration: "300",
    dismissable: !0,
    timeout: 20,
  });
}
function ShowToastFleetMonitor(n, t) {
  const i = $(".vehicles-gov-monitor tbody");
  let r = i.find(`tr[data-plate="${n}"]`);
  r.length === 0
    ? ((r = $(`<tr data-plate="${n}"><td>${n}</td><td>${t}</td></tr>`)),
      i.prepend(r))
    : r.html(`<td>${n}</td><td>${t}</td>`);
  i.find("tr").length > 0 && $(".vehicle-gov-check-result").show();
  i.find("tr").length > 5 && i.find("tr").last().remove();
}
function toggleGovCheckResult() {
  $(".vehicle-gov-check-result").is(":visible")
    ? $(".vehicle-gov-check-result").slideUp()
    : $(".vehicle-gov-check-result").slideDown();
}
function getWeekRange(n = new Date()) {
  let t = new Date(n),
    i = new Date(n),
    r = n.getDay(),
    u = r === 0 ? 6 : r - 1;
  return (
    t.setDate(n.getDate() - u),
    t.setHours(0, 0, 0, 0),
    i.setDate(t.getDate() + 6),
    i.setHours(23, 59, 59, 999),
    {
      start: t,
      end: i,
    }
  );
}
function showDrivingTimeTable(n, t) {
  n?.name && setLocalStorage(n.name, n.checked);
  let r = $("#txtSearchDrivingTime").val() + "" || t;
  const o = [],
    i = $("#table-driving-time tbody"),
    h = getLocalStorage("ckbFilterByDrivingTime") == "true",
    c = getLocalStorage("ckbFilterBySpeed") == "true",
    l = getLocalStorage("ckbFilterByStop") == "true",
    u = "--:--:--";
  for (let n in vehicles)
    o.push(
      statuses[n] || {
        nullWp: !0,
        info: vehicles[n],
      }
    );
  i.empty();
  const f = o;
  f.length > 0
    ? f.sort(function (n, t) {
        return (
          n.nullWp && (n[32] = n.info?.[1]),
          t.nullWp && (t[32] = t.info?.[1]),
          n[32]?.localeCompare(t[32])
        );
      })
    : i.append(
        `<tr> <td colspan="9"> Không có dữ liệu để hiển thị </td> </tr>`
      );
  let e = 0,
    s = "";
  f.forEach(function (n) {
    const w = n.nullWp,
      f = drivers[n[33]] || {};
    let o = "bg-success",
      a = "bg-success",
      v = "bg-success",
      i = !1;
    n[69] >= 172800
      ? ((o = "bg-danger-orang-red"), (i = !0))
      : n[69] >= 158400 && ((o = "bg-warning-orange"), (i = !0));
    n[17] >= 36e3
      ? ((a = "bg-danger-orang-red"), (i = !0))
      : n[17] >= 32400 && ((a = "bg-warning-orange"), (i = !0));
    n[16] >= 14400
      ? ((v = "bg-danger-orang-red"), (i = !0))
      : n[16] >= 3.5 * 3600 && ((v = "bg-warning-orange"), (i = !0));
    const p = w ? n?.info[1] : n[32] ?? "",
      y = formatString(f[1]) ?? "",
      t = n[1] >= todayTime,
      b = !r || p.regexIndexOf(r) >= 0 || y.regexIndexOf(r) >= 0,
      k = !l || (n[4] <= 0 && t),
      d = !c || (n[4] > 0 && t),
      g = !h || (i && t);
    if (b && k && d && g) {
      let i = "",
        r = "",
        h = "";
      const c = '<i class="fal fa-clock"></i>',
        b = "Click để hiển thị thời gian lái xe",
        l = "show-detail",
        w = Util.date.formatDate(new Date()),
        k = Util.date.formatDateTime3(new Date()),
        d = Util.date.formatDateTime3(
          new Date(new Date("2010/01/01").setSeconds(nowTime - n[16]))
        );
      if (n[0] && t) {
        const t = n?.[73] > 1;
        if (
          (d &&
            k &&
            (i = `onclick="javascript:showTripDetail(${n[0]},'${d}','${k}', ${
              t ? "-1" : n[33].toString()
            }, true)"`),
          w)
        ) {
          let i = n[0];
          n[33] != 0 && n[33].toString() && (i = 0);
          r = `onclick="javascript:showTripDailyDrivingDetail(${i},'${
            w + " 00:00"
          }', '${w + " 23:59"}', ${n[33].toString()}, true, ${t})"`;
          let { start: u, end: f } = getWeekRange();
          const e = Util.date.formatDate(u),
            o = Util.date.formatDate(f);
          h = `onclick="javascript:showTripWeeklyDrivingDetail(${i},'${e}', '${o}', ${n[33].toString()}, true)"`;
        }
      }
      e++;
      s +=
        `<tr title="${t ? "" : "Xe mất tín hiệu"}">` +
        `<td class="stt" style="text-align: center"> ${e} </td>` +
        `<td class="stt" > ${iconStatusVehicle(n).outerHTML} </td>` +
        `<td class="plate"> ${p} </td>` +
        `<td class="license"> ${f[3] ?? ""} </td>` +
        `<td class="driver">
                    ${y} ${
          y && n?.[73] > 1
            ? `<b title="Số lượng xe trong ngày" style="padding: 2px 6px; background: lightblue; border-radius: 4px;"> ${
                n[73] ?? ""
              } </b>`
            : ""
        }
                </td>` +
        `<td class="phoneNumber"> ${f[2] ?? ""}</td>` +
        `<td ${i} class="4h ${i ? l : ""} ${t ? v : ""}" 
                    title="${b}" 
                    style="text-align: right;"> 
                        ${i && c} ${
          t ? Util.date.formatTimeFromSeconds(n[16]) : u
        } 
                </td>` +
        `<td ${r} class="10h ${r ? l : ""} ${t ? a : ""}" 
                    title="${b}" 
                    style="text-align: right;"> 
                        ${r && c} ${
          t ? Util.date.formatTimeFromSeconds(n[17]) : u
        } 
                </td>` +
        `<td ${h} class="48h ${h ? l : ""} ${
          t ? o : ""
        }" style="text-align: right"> 
                    ${h && c} ${t ? Util.date.formatTimeFromSeconds(n[69]) : u} 
                </td>` +
        +"</tr>";
    }
  });
  e == 0
    ? i.append(`<tr> <td colspan="6"> Không có dữ liệu để hiển thị </td> </tr>`)
    : i.html(s);
}
function searchVehicleDrivingTime(n) {
  const t = n.target.value;
  onDebouncing(showDrivingTimeTable(null, t));
}
function openTableDrivingTime() {
  const n = getLocalStorage("ckbFilterByDrivingTime") == "true",
    t = getLocalStorage("ckbFilterBySpeed") == "true",
    i = getLocalStorage("ckbFilterByStop") == "true";
  tableDrivingTimeFancy = Fancybox.show(
    [
      {
        src: `
            <div>
                <div class="vehicle-wps" style="height: 80vh; overflow: auto;">
                    <div class="header" style="position: sticky;top: 0;">
                        <input id="txtSearchDrivingTime" type="text" class="form-control" placeholder="Biển kiểm soát..."
                    style="border-radius: 0px" onkeyup="searchVehicleDrivingTime(event);" />
                    </div>
                    <table id="table-driving-time" style="width: 100%; margin-bottom:50px;" class="table table-bordered table-striped table-hover vehicles">
                        <thead style="top: 34px !important;">
                            <tr class="header">
                                <th rowspan="2" class="stt"> STT </th>
                                <th rowspan="2" class="status">  </th>
                                <th rowspan="2" class="plate"> ${keyPlate} </td>
                                <th rowspan="2" class="license"> ${keyLicense} </th>
                                <th rowspan="2" class="driver"> ${keyDriver} </th>
                                <th rowspan="2" class="phoneNumber"> ${keyPhoneNumber} </th>
                                <th colSpan="3" style="text-align: center"> Thời gian lái xe </th>
                            </tr>
                            <tr class="header"> 
                                <td class="4h"> ${key4h} (4H) </td>
                                <td class="10h"> ${key10h} (10H) </td>
                                <td class="48h"> ${key48h} (48H) </th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>

                    <div class="btn-filter form-check" style="display: flex; gap: 12px;">
                        <span>
                            <input class="form-check-input" onclick="showDrivingTimeTable(this)" name="ckbFilterByStop" ${
                              i && "checked"
                            } type="checkbox" id="btn-filter-by-stop" >
                            <label class="form-check-label" for="btn-filter-by-stop">
                                Dừng, đỗ
                            </label>
                        </span>
                        <span> 
                            <input class="form-check-input" onclick="showDrivingTimeTable(this)" name="ckbFilterBySpeed" ${
                              t && "checked"
                            } type="checkbox" id="btn-filter-by-speed" >
                            <label class="form-check-label" for="btn-filter-by-speed">
                                Đang di chuyển
                            </label>
                        </span>
                        <span> 
                            <input class="form-check-input" onclick="showDrivingTimeTable(this)" name="ckbFilterByDrivingTime" type="checkbox" id="btn-filter-driving-time" ${
                              n && "checked"
                            } >
                            <label class="form-check-label" for="btn-filter-driving-time">
                                Xe vi phạm
                            </label>
                        </span>
                    </div>
                </div>
            </div>`,
        type: "html",
      },
    ],
    {
      mainClass: "custom-vehicle-popup",
      dragToClose: !1,
      autoFocus: !1,
      defaultType: "html",
      on: {
        done: () => {
          showDrivingTimeTable();
        },
      },
    }
  );
}
function onLoadingReport(n = false) {
  $("#popup-loading").css("display", n ? "block" : "none");
}
function getOBJInfo(n, t) {
  var r, i;
  let u = "";
  if (t[74]) {
    let n = t[74];
    if (n.DID) {
      let f =
          '<table class="obd table table-striped table-hover table-bordered">',
        t = [];
      for (r in n.DID) n.DID[r].Flag && t.push(n.DID[r]);
      t.sort(sortbyProperty("-TIME"));
      let e = !0;
      for (i = 0; i < t.length; i++) {
        let n = t[i].Name;
        e &&
          ((e = !1),
          (f += `<tr><td class="obd-title" colspan="3">${getLanguage(
            "monitor.OBD.DID"
          )}</td></tr>`),
          (f += `<tr><th>${getLanguage(
            "monitor.OBD.DID.Name"
          )}</th><th>${getLanguage(
            "monitor.OBD.DID.Value"
          )}</th><th>${getLanguage("monitor.OBD.DID.Unit")}</th></tr>`));
        f += `<tr class="${
          t[i].TIME >= todayTime ? "obd-online" : "obd-offline"
        }"><td>${n ? n : t[i].Id}</td><td class="text-right">${
          t[i].Value
        }</td><td>${t[i].Unit}</td></tr>`;
      }
      f += "</table>";
      u += f;
    }
    if (n.DTC) {
      let f =
          '<table class="obd table table-striped table-hover table-bordered">',
        t = [];
      for (r in n.DTC) n.DTC.Flag && t.push(n.DTC[r]);
      t.sort(sortbyProperty("-TIME"));
      let e = !0;
      for (i = 0; i < t.length; i++)
        e &&
          ((e = !1),
          (f += `<tr><td class="obd-title" colspan="7">${getLanguage(
            "monitor.OBD.DTC"
          )}</td></tr>`),
          (f += `<tr><th>${getLanguage(
            "monitor.OBD.DTC.Key"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.Value"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.DTCDisplay"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.HMByte"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.RootCode"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.FaultsTypes"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.FailureCodeMeaning"
          )}</th></tr>`)),
          (f += `<tr class="${
            t[i].TIME >= todayTime ? "obd-online" : "obd-offline"
          }"><td>${t[i].Key}</td><td>${t[i].Value}</td><td>${
            t[i].DTCDisplay
          }</td><td>${t[i].HMByte}</td><td>${t[i].RootCode}</td><td>${
            t[i].FaultsTypes
          }</td><td>${t[i].FailureCodeMeaning}</td></tr>`);
      f += "</table>";
      u += f;
    }
    if (n.Metadata) {
      let f =
          '<table class="obd table table-striped table-hover table-bordered">',
        t = [];
      for (r in n.Metadata) n.Metadata.Flag && t.push(n.Metadata[r]);
      t.sort(sortbyProperty("-TIME"));
      let e = !0;
      for (i = 0; i < t.length; i++)
        e &&
          ((e = !1),
          (f += `<tr><td class="obd-title" colspan="3">${getLanguage(
            "monitor.OBD.Metadata"
          )}</td></tr>`),
          (f += `<tr><th>${getLanguage(
            "monitor.OBD.Metadata.Time"
          )}</th><th>${getLanguage(
            "monitor.OBD.Metadata.Type"
          )}</th><th>${getLanguage("monitor.OBD.Metadata.Name")}</th></tr>`)),
          (f += `<tr class="${
            t[i].TIME >= todayTime ? "obd-online" : "obd-offline"
          }"><td>${Util.date.formatFullDateTime2(t[i].TIME)}</td><td>${
            t[i].Type
          }</td><td>${t[i].Name}</td></tr>`);
      f += "</table>";
      u += f;
    }
  }
  return u;
}
function showOBDDetail(n) {
  var i, t;
  let r = "",
    u = statuses["vec_" + n];
  if (u) {
    let n = u[74];
    if (n.DID) {
      let f =
          '<table class="obd table table-striped table-hover table-bordered">',
        u = [];
      for (i in n.DID) u.push(n.DID[i]);
      u.sort(sortbyProperty("-TIME"));
      let e = !0;
      for (t = 0; t < u.length; t++) {
        let n = u[t].Name;
        e &&
          ((e = !1),
          (f += `<tr><td class="obd-title" colspan="4">${getLanguage(
            "monitor.OBD.DID"
          )}</td></tr>`),
          (f += `<tr><th>${getLanguage(
            "monitor.OBD.DID.Time"
          )}</th><th>${getLanguage(
            "monitor.OBD.DID.Name"
          )}</th><th>${getLanguage(
            "monitor.OBD.DID.Value"
          )}</th><th>${getLanguage("monitor.OBD.DID.Unit")}</th></tr>`));
        f += `<tr class="${
          u[t].TIME >= todayTime ? "obd-online" : "obd-offline"
        }"><td>${Util.date.formatFullDateTime2(u[t].TIME)}</td><td>${
          n ? n : u[t].Id
        }</td><td class="text-right">${u[t].Value}</td><td>${
          u[t].Unit
        }</td></tr>`;
      }
      f += "</table>";
      r += f;
    }
    if (n.DTC) {
      let f =
          '<table class="obd table table-striped table-hover table-bordered">',
        u = [];
      for (i in n.DTC) u.push(n.DTC[i]);
      u.sort(sortbyProperty("-TIME"));
      let e = !0;
      for (t = 0; t < u.length; t++)
        e &&
          ((e = !1),
          (f += `<tr><td class="obd-title" colspan="8">${getLanguage(
            "monitor.OBD.DTC"
          )}</td></tr>`),
          (f += `<tr><th>${getLanguage(
            "monitor.OBD.DTC.Time"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.Key"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.Value"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.DTCDisplay"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.HMByte"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.RootCode"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.FaultsTypes"
          )}</th><th>${getLanguage(
            "monitor.OBD.DTC.FailureCodeMeaning"
          )}</th></tr>`)),
          (f += `<tr class="${
            u[t].TIME >= todayTime ? "obd-online" : "obd-offline"
          }"><td>${Util.date.formatFullDateTime2(u[t].TIME)}</td><td>${
            u[t].Key
          }</td><td>${u[t].Value}</td><td>${u[t].DTCDisplay}</td><td>${
            u[t].HMByte
          }</td><td>${u[t].RootCode}</td><td>${u[t].FaultsTypes}</td><td>${
            u[t].FailureCodeMeaning
          }</td></tr>`);
      f += "</table>";
      r += f;
    }
    if (n.Metadata) {
      let f =
          '<table class="obd table table-striped table-hover table-bordered">',
        u = [];
      for (i in n.Metadata) u.push(n.Metadata[i]);
      u.sort(sortbyProperty("-TIME"));
      let e = !0;
      for (t = 0; t < u.length; t++)
        e &&
          ((e = !1),
          (f += `<tr><td class="obd-title" colspan="4">${getLanguage(
            "monitor.OBD.Metadata"
          )}</td></tr>`),
          (f += `<tr><th>${getLanguage(
            "monitor.OBD.Metadata.Time"
          )}</th><th>${getLanguage(
            "monitor.OBD.Metadata.Type"
          )}</th><th>${getLanguage("monitor.OBD.Metadata.Name")}</th></tr>`)),
          (f += `<tr class="${
            u[t].TIME >= todayTime ? "obd-online" : "obd-offline"
          }"><td>${Util.date.formatFullDateTime2(u[t].TIME)}</td><td>${
            u[t].Type
          }</td><td>${u[t].Name}</td></tr>`);
      f += "</table>";
      r += f;
    }
    r &&
      Fancybox &&
      Fancybox.show([
        {
          src: `<div>
                        ${r}
                    </div>`,
          type: "html",
        },
      ]);
  }
}
function tableBoardControl(n = [], t, i, r = {}) {
  const {
      keyDuration: u,
      timeViolate: e,
      o = !0,
      duration: s,
      time: h,
      sensor: f = !1,
      overSpeedByRoad: c = !1,
      slowSpeedHighway: l = !1,
      showDuration: a = !0,
    } = r,
    v = $(`#${t}`).is(":checked");
  if (v && n.length > 0) {
    const t = $(`table.${i} tbody`).empty();
    n.map((n, i) => {
      let r = "",
        v = {},
        y = undefined,
        p = undefined;
      o && (r = n[u] < e ? "warning-driving-3h30" : "warning-overtime-driving");
      f && (v = listSensorLoseSignal[i]);
      const w = f
        ? `<td nowrap="nowrap" class="sensor"> ${
            sensorTypes[v?.SensorTypeId][2]
          } </td>`
        : undefined;
      (c || l) &&
        (y = `
                    <td nowrap="nowrap" class="speed"> ${n[4] / 100} </td>
                    <td nowrap="nowrap" class="maxspeed"> ${
                      getVehicleMaxSpeedOnRoad(n) / 100
                    } </td>
                `);
      a &&
        (p = `<td nowrap="nowrap" class="duration"> ${Util.date.formatTimeFromSeconds(
          s?.(n, i) ?? n[u]
        )} </td>`);
      t.append(
        `<tr class="${r}" onclick="selectedVehicle(${n[0]},true)">` +
          `<td nowrap="nowrap" class="config"> ${
            iconStatusVehicle(n).outerHTML
          } </td>` +
          `<td nowrap="nowrap" class="plate"> ${n[32]} </td>` +
          w +
          `<td nowrap="nowrap" class="time"> ${formatDateTime(
            getTime(h?.(n, i) ?? n[38])
          )} </td>` +
          p +
          y +
          `<td nowrap="nowrap" class="address"> ${
            n[7] + " " + getRegion(n[34])
          } </td>` +
          "</tr>"
      );
    });
    $(`.${i}`).tableHeadFixer();
  }
}
var myLocation,
  vehicleLayer,
  historyLayer,
  eventsLayer,
  stationLayer,
  geofenceLayer,
  tollgateLayer,
  trailerLayer,
  TIMER_INTERVAL = 10,
  MARKER_VEHICLE = 1,
  MARKER_STATION = 2,
  MARKER_TOLLGATE = 3,
  MARKER_TRAILER = 4,
  timer = 0,
  vehicleLoaded = !1,
  vehicleStatusLoaded = !1,
  vehicles = [],
  drivers = [],
  statuses = [],
  sensorTypes = [],
  trailers = null,
  trailerStatuses = [],
  sortField = "Plate",
  groupField = 2,
  groupVehicle = 1,
  showSensors = !1,
  selectVehicle,
  currentPopupVehicle = 0,
  writeDriverCard = !1,
  logInOutDriver = !1,
  turnOnOffHooter = !1,
  createRemark = !1,
  writePlateToImage = !1,
  createVehicleLoginCode = !1,
  alertDrivingTimeHooter = !1,
  createLocator = !1,
  vehicleTrackingFeedback = !0,
  defaultGridColumn = [
    {
      Index: 0,
      field: "note",
      hidden: !0,
    },
    {
      Index: 1,
      field: "plate",
      hidden: !1,
    },
    {
      Index: 2,
      field: "gpstime",
      hidden: !1,
    },
    {
      Index: 3,
      field: "speed",
      hidden: !1,
    },
    {
      Index: 4,
      field: "satellite",
      hidden: !0,
    },
    {
      Index: 5,
      field: "mileage",
      hidden: !1,
    },
    {
      Index: 6,
      field: "mifi",
      hidden: !0,
    },
    {
      Index: 7,
      field: "fuel",
      hidden: !0,
    },
    {
      Index: 8,
      field: "temperature",
      hidden: !0,
    },
    {
      Index: 9,
      field: "door",
      hidden: !0,
    },
    {
      Index: 10,
      field: "airconditioner",
      hidden: !0,
    },
    {
      Index: 11,
      field: "collision",
      hidden: !0,
    },
    {
      Index: 12,
      field: "mixing",
      hidden: !0,
    },
    {
      Index: 13,
      field: "district",
      hidden: !1,
    },
    {
      Index: 14,
      field: "address",
      hidden: !0,
    },
    {
      Index: 15,
      field: "power",
      hidden: !1,
    },
  ],
  layoutGrid = [],
  currFilterVehicleGroupId,
  isChangeMapByGroup,
  loadVehicleChartCounter,
  contextVehicleId,
  stations,
  geofences,
  tollgates,
  showGuide,
  SENSOR_FILTER,
  containerSensorName,
  sensorLiter,
  vehicleFields,
  vehicleFieldCounter,
  ssmdvr,
  ssTimeout,
  displayVehicleBillingExpiredStatus,
  MIFI_VEHICLE,
  MIFI_TIME;
const ExpiredPhoneStatus = {
  NullPhone: "1",
  Expired: "2",
};
var SENSORS = {
    road: {
      id: "Sensor_Road",
      selected: !1,
      field: "",
    },
    fuel: {
      id: "Sensor_Fuel",
      selected: !1,
      field: "fuel",
    },
    temperature: {
      id: "Sensor_Temperature",
      selected: !1,
      field: "temperature",
    },
    mixing: {
      id: "Sensor_Mixing",
      selected: !1,
      field: "mixing",
      guide: "mixing-guide",
      v1: 0,
      v2: 0,
      v3: 0,
      resetFilter: resetFilterMixingStatus,
    },
    door: {
      id: "Sensor_Door",
      selected: !1,
      field: "door",
      guide: "door-guide",
      v1: 0,
      v2: 0,
      resetFilter: resetFilterDoorStatus,
    },
    collision: {
      id: "Sensor_Collision",
      selected: !1,
      field: "collision",
      guide: "collision-guide",
      v1: 0,
      v2: 0,
      resetFilter: resetFilterCollisionStatus,
    },
    airconditioner: {
      id: "Sensor_AirConditioner",
      selected: !1,
      field: "airconditioner",
      guide: "airconditioner-guide",
      v1: 0,
      v2: 0,
      resetFilter: resetFilterAirConditionerStatus,
    },
    video: {
      id: "Sensor_Video",
      selected: !1,
      field: "",
    },
    power: {
      id: "Sensor_Power",
      selected: !1,
      field: "power",
      guide: "power-guide",
      v1: 0,
      v2: 0,
      resetFilter: resetFilterPowerStatus,
    },
    mifi: {
      id: "Sensor_MIFI",
      selected: !1,
      field: "mifi",
      guide: "mifi-guide",
      v1: 0,
      v2: 0,
      resetFilter: resetFilterMIFIStatus,
    },
  },
  clusterStylesConfig = {
    medium: {
      rgba_bg: [241, 211, 87, 0.6],
      rgba_fg: [240, 194, 12, 0.6],
    },
    large: {
      rgba_bg: [253, 156, 115, 0.6],
      rgba_fg: [241, 128, 23, 0.6],
    },
  },
  popup,
  mapTabStatus = !0,
  toogleTabEvent = !0,
  element = document.getElementById("popup");
currFilterVehicleGroupId = "all";
isChangeMapByGroup = !1;
var lastMod = 0,
  todayTime = 0,
  nowTime = 0,
  CITY_NAME = "",
  listDriving48H = [],
  listDriving10H = [],
  listContinuousDriving4h = [],
  listUnLoginDriver = [],
  listOverSpeedByRoad = [],
  listOverSpeedByVehicleType = [],
  listStatOverSpeed = [],
  listHighwaySpeed = [],
  listStopOver2h = [],
  listDeltaForStopOver2h = [],
  listLoseSignal = [],
  listSensorLoseSignal = [],
  USER_PASSWORD_EXPIRED = !1;
loadVehicleChartCounter = 0;
contextVehicleId = 0;
const idsBoardControl = {
  groupVehicle: "chkVehicleGroup",
  history: "chkHistory",
  stopOver2h: "chkVehiclesLongStop",
  unLoginDriver: "chkVehiclesNoDriver",
  statOverSpeed: "chkStatisticOverSpeed",
  overSpeedByVehicleType: "chkVehiclesOverSpeed",
  overSpeedByRoad: "chkVehicleRoadOverSpeed",
  continuousdriving4h: "chkVehicleOverTimeDriving",
  drivingDaily10h: "chkVehicleDailyDriving",
  loseSignal: "chkloseSignal",
  driving48h: "chkVehicleWeeklyDriving",
  highwaySpeed: "chkVehicleHighwaySpeed",
  expiredInspection: "chkExpiredInspection",
  vehicleTrafficViolation: "chkVehicleTrafficViolation",
};
stations = [];
geofences = [];
tollgates = [];
showGuide = !0;
SENSOR_FILTER = {
  door_open: !1,
  door_close: !1,
  airconditioner_on: !1,
  airconditioner_off: !1,
  mixing_normal: !1,
  mixing_mix: !1,
  mixing_discharge: !1,
  mifi_on: !1,
  mifi_off: !1,
};
var searchOption1 = 0,
  searchOption2 = 0,
  searchOption3 = 0,
  searchOption4 = 0,
  searchOption5 = 0,
  searchOption6 = 0,
  searchOption7 = 0,
  searchOption8 = 0,
  searchOption9 = 0,
  searchOption10 = 0,
  searchOption11 = 0;
searchOption12 = 0;
searchOption13 = 0;
containerSensorName = [
  11, 17, 19, 27, 28, 33, 34, 35, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
];
sensorLiter = [
  10, 20, 21, 22, 26, 29, 30, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 64, 65,
];
vehicleFields = [];
vehicleFieldCounter = 300;
ssmdvr = "";
var mdvr = null,
  data = "",
  paging = {
    page: 0,
    pageSize: 10,
    total: 0,
  },
  photos = [];
displayVehicleBillingExpiredStatus = !0;
MIFI_VEHICLE = 0;
MIFI_TIME = 0;
let isRequestInProgress = !1;
