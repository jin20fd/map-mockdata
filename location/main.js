// --- 1. 초기 설정 ---
const map = L.map('map').setView([37.6543, 127.0565], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const fullAddressDiv = document.getElementById("full-address");
const roadAddressDiv = document.getElementById("road-address");
const coordList = document.getElementById("coord-list");
const coordsOutput = document.getElementById("coords-output");
const copyBtn = document.getElementById("copy-btn");
const clearBtn = document.getElementById("clear-btn");

let selectedPlaces = []; // {id, lat, lng, marker} 객체 저장

// --- 2. 노원구 경계 시각화 ---
fetch('./hangjeongdong_서울특별시.geojson')
    .then(res => res.ok ? res.json() : Promise.reject('GeoJSON 파일을 불러올 수 없습니다.'))
    .then(geojson => {
        const nowonGeo = geojson.features.filter(f => f.properties.adm_nm?.includes("노원구"));
        const layer = L.geoJSON(nowonGeo, { style: { color: 'blue', weight: 2, fillOpacity: 0.1 } }).addTo(map);
        map.fitBounds(layer.getBounds());
    })
    .catch(err => {
        console.error(err);
        // 파일 로딩 실패 시 예비 경계 표시
        const fallbackBoundary = [[37.6926, 127.0465], [37.6895, 127.0778], [37.6490, 127.0955], [37.6285, 127.0767], [37.6337, 127.0445], [37.6767, 127.0315]];
        L.polygon(fallbackBoundary, { color: 'red', weight: 2, fillOpacity: 0.1 }).addTo(map);
    });

// --- 3. 주소 변환 함수 (도로명 주소 분리) ---
async function getAddress(lat, lng) {
    try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("주소 API 호출 실패");
    const data = await res.json();
    
    const fullAddress = data.display_name || "주소를 찾을 수 없음";
    const details = data.address;
    let roadAddress = "도로명 주소 없음";
    if (details && details.road) {
        roadAddress = `${details.road} ${details.house_number || ''}`.trim();
    }
    
    return { fullAddress, roadAddress };
    } catch (error) {
    console.error("주소 변환 오류:", error);
    return { fullAddress: "주소 변환 실패", roadAddress: "주소 변환 실패" };
    }
}

// --- 4. UI 업데이트 함수 ---
function updatePanel() {
    // 좌표 배열 (JSON) 업데이트
    coordsOutput.value = JSON.stringify(
        selectedPlaces.map(({ lat, lng }) => ({ lat, lng })), null, 2
    );

    // 좌표 목록 (HTML) 업데이트
    coordList.innerHTML = "";
    selectedPlaces.forEach((place, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${index + 1}. (${place.lat}, ${place.lng})</span>
            <button class="delete-btn" data-id="${place.id}">삭제</button>
        `;
        coordList.appendChild(li);
    });
}

// --- 5. 지도 클릭 이벤트 (마커 및 정보 추가) ---
map.on("click", async function(e) {
    const lat = parseFloat(e.latlng.lat.toFixed(6));
    const lng = parseFloat(e.latlng.lng.toFixed(6));
    
    const addresses = await getAddress(lat, lng);
    
    // 마지막 클릭 위치 정보 업데이트
    fullAddressDiv.innerHTML = `<strong>전체 주소:</strong> ${addresses.fullAddress}`;
    roadAddressDiv.innerHTML = `<strong>도로명 주소:</strong> ${addresses.roadAddress}`;
    
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<b>${addresses.roadAddress}</b><br>${addresses.fullAddress}`).openPopup();

    const newPlace = {
        id: Date.now(), // 고유 ID로 사용
        lat,
        lng,
        marker
    };

    selectedPlaces.push(newPlace);
    updatePanel();
});

// --- 6. 좌표 목록에서 항목 삭제 ---
coordList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const placeId = Number(e.target.dataset.id);
        const placeToRemove = selectedPlaces.find(p => p.id === placeId);
        
        if (placeToRemove) {
            // 지도에서 마커 제거
            map.removeLayer(placeToRemove.marker);
            
            // 배열에서 데이터 제거
            selectedPlaces = selectedPlaces.filter(p => p.id !== placeId);
            
            // 패널 업데이트
            updatePanel();
        }
    }
});

// --- 7. 복사 및 전체 지우기 버튼 ---
copyBtn.addEventListener('click', () => {
    if(!coordsOutput.value) return;
    coordsOutput.select();
    navigator.clipboard.writeText(coordsOutput.value).then(() => {
        copyBtn.textContent = '복사 완료!';
        setTimeout(() => { copyBtn.textContent = '복사하기'; }, 2000);
    });
});

clearBtn.addEventListener('click', () => {
    selectedPlaces.forEach(p => map.removeLayer(p.marker));
    selectedPlaces = [];
    updatePanel();
    fullAddressDiv.innerHTML = `<strong>전체 주소:</strong> 지도를 클릭하세요.`;
    roadAddressDiv.innerHTML = `<strong>도로명 주소:</strong> 지도를 클릭하세요.`;
});