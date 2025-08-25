// DOM이 완전히 로드된 후에 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. 기본 변수 및 지도 초기 설정 ---
  const map = L.map('map').setView([37.6543, 127.0565], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  const coordsOutput = document.getElementById("coords-output");
  const lastAddressDiv = document.getElementById("last-address");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");

  let selectedCoords = [];
  let userMarkers = []; // 사용자가 클릭한 마커 저장
  let centerMarkersLayer = L.layerGroup().addTo(map); // 복지센터 마커 레이어

  // --- 2. 함수 정의 ---

  /** 노인복지센터 데이터를 지도에 마커로 표시하는 함수 */
  function plotCenters(centers) {
    const centerIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    centers.forEach(center => {
      const name = center['이름'];
      const lat = center['위도'];
      const lng = center['경도'];

      if (name && lat && lng) {
        L.marker([lat, lng], { icon: centerIcon })
          .bindPopup(`<b>${name}</b>`)
          .addTo(centerMarkersLayer);
      }
    });
  }

  /** (비동기) 엑셀 파일을 읽어와서 마커 표시 함수를 호출하는 함수 */
  async function loadAndPlotCenters() {
    try {
      const response = await fetch('노인복지센터.xlsx');
      if (!response.ok) throw new Error('네트워크 응답이 올바르지 않습니다.');
      
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      plotCenters(jsonData);
    } catch (error) {
      console.error(error);
      alert('노인복지센터.xlsx 파일을 찾을 수 없거나 읽는 중 오류가 발생했습니다.');
    }
  }

  /** (비동기) 위도, 경도를 주소로 변환하는 함수 */
  async function getAddress(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url);
      if (!res.ok) return "주소 API 호출 실패";
      const data = await res.json();
      return data.display_name || "주소를 찾을 수 없음";
    } catch (error) {
      return "주소 변환 중 오류 발생";
    }
  }

  /** 좌표 목록 UI를 업데이트하는 함수 */
  function updateOutput() {
    coordsOutput.value = JSON.stringify(selectedCoords, null, 2);
  }

  // --- 3. 이벤트 리스너 설정 ---

  /** 지도 클릭 이벤트 */
  map.on("click", async function(e) {
    const lat = parseFloat(e.latlng.lat.toFixed(6));
    const lng = parseFloat(e.latlng.lng.toFixed(6));
    const newCoord = { lat, lng };
    
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>주소 로딩 중...</b>").openPopup();
    
    const address = await getAddress(lat, lng);
    marker.getPopup().setContent(`<b>${address}</b><br>(${lat}, ${lng})`);
    lastAddressDiv.textContent = address;
    
    marker.customData = newCoord;
    marker.on('click', function(event) {
        L.DomEvent.stopPropagation(event);
        map.removeLayer(this);
        userMarkers = userMarkers.filter(m => m !== this);
        selectedCoords = selectedCoords.filter(coord => coord !== this.customData);
        updateOutput();
    });
    
    userMarkers.push(marker);
    selectedCoords.push(newCoord);
    updateOutput();
  });

  /** 복사하기 버튼 클릭 이벤트 */
  copyBtn.addEventListener('click', () => {
    coordsOutput.select();
    navigator.clipboard.writeText(coordsOutput.value).then(() => {
        copyBtn.textContent = '복사 완료!';
        setTimeout(() => { copyBtn.textContent = '복사하기'; }, 2000);
    });
  });

  /** 모두 지우기 버튼 클릭 이벤트 */
  clearBtn.addEventListener('click', () => {
    userMarkers.forEach(marker => map.removeLayer(marker));
    userMarkers = [];
    selectedCoords = [];
    updateOutput();
    lastAddressDiv.textContent = "지도를 클릭하여 주소를 확인하세요.";
  });

  // --- 4. 초기 실행 코드 ---
  
  // 노원구 경계 GeoJSON 데이터 불러오기
  fetch('./hangjeongdong_서울특별시.geojson')
    .then(res => res.ok ? res.json() : Promise.reject('GeoJSON 로딩 실패'))
    .then(geojson => {
        const nowonGeo = geojson.features.filter(f => f.properties.adm_nm?.includes("노원구"));
        const layer = L.geoJSON(nowonGeo, { style: { color: 'blue', weight: 2, fillOpacity: 0.1 } }).addTo(map);
        map.fitBounds(layer.getBounds());
    })
    .catch(console.error);

  // 엑셀 파일 읽어서 센터 마커 표시
  loadAndPlotCenters();

});