let timer,time=0,dis=0,saveTime=0;
let running = false;
let watchID , startTime;
let prevLat = null , prevLon = null;
let nextDistanceStop = 0.01;
let map, routeLine;
let routeCoords = [];


function toRad(deg)
{
    return deg * Math.PI/180;
}

function getDistanceFromLatLon(lat1,lon1,lat2,lon2){
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
     Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

if(navigator.geolocation)
{
    watchID = navigator.geolocation.watchPosition
    (
        (pos) => {
            const {latitude , longitude} = pos.coords;

            if(prevLat !=null && prevLon !=null)
            {
                const d = getDistanceFromLatLon(prevLat , prevLon , latitude , longitude);
                if(d>0.005)
                    {
                        dis +=d;
                        if(dis >= nextDistanceStop)
                        {
                            nextDistanceStop +=0.01;
                            routeCoords.push([latitude ,longitude]);
                        }
                        updateMap(latitude, longitude);
                        updateDisplay();
                    }
            }
            prevLat = latitude;
            prevLon = longitude;
        },
        (err) =>
            {
                console.error("GPS錯誤: ", err.message);
            },
            {enableHighAccuracy:true , maximumAge:1000, timeout:5000}
    );
}else
{
    alert("裝置不支援GPS功能");
}

function updateDisplay()
{
    let timeText = "0:00";
    
    if(startTime){
        const now = new Date();
        const diff =(now - startTime)/1000 + saveTime;
        const minute = Math.floor(diff/60);
        const second =(diff%60).toFixed(2);
        timeText = `${minute}:${second.padStart(5,0)}`;
    }

    document.getElementById("time").textContent = timeText;
    document.getElementById("dis").textContent = dis.toFixed(1);
}

function start()
{
    if(running) return;
    running = true;
    startTime = new Date();

    timer = setInterval(() => {
        const now = new Date();
        const diff = (now - startTime)/1000 + saveTime;
        updateDisplay();
    },10);
        
}

function pause()
{
    if(!running) return;
    running = false;
    clearInterval(timer);

    const now = new Date();
    saveTime += (now - startTime)/1000;
}

function reset()
{
    if(running) return;

    saveTime=0;
    time=0;
    dis=0;
    routeCoords = [];
    routeLine.setLatLngs([]);
    startTime=null;
    updateDisplay();
}

function initMap() {
  map = L.map('map').setView([24.737, 121.738], 17); // 初始中心與縮放

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);

  map.locate({
    setView: true,
    maxZoom: 17,
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });

    map.on('locationfound', function(e) {
    // 在定位位置放小藍點marker
    L.circleMarker(e.latlng, {
      radius: 6,
      fillColor: '#3388ff',
      color: '#3388ff',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);
  });

  map.on('locationerror', function(e) {
    alert("無法取得定位：" + e.message);
  });
}

  showCurrentLocation();


function updateMap(lat, lon) {
  const point = [lat, lon];
  routeLine.setLatLngs(routeCoords);
  map.setView(point); // 鏡頭移動到最新位置
}