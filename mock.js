const axios = require('axios');
const XLSX = require('xlsx');

const API_KEY = '0B89C3CB-2405-3A7E-9742-982865CEE92D';
const API_URL = 'https://api.vworld.kr/req/address';

async function getCoords(address) {
  try {
    const response = await axios.get(API_URL, {
      params: {
        service: 'address',
        request: 'getcoord',
        version: '2.0',
        crs: 'epsg:4326',
        address,
        refine: 'true',
        simple: 'false',
        format: 'json',
        type: 'road',
        key: API_KEY,
      },
    });
    const data = response.data;
    if (data.response.status === 'OK') {
      const point = data.response.result.point;
      return { lat: parseFloat(point.y), lon: parseFloat(point.x) };
    }
  } catch (error) {
    console.error(`Error for address "${address}":`, error.message);
  }
  return { lat: null, lon: null };
}

async function processExcel(inputFile, outputFile, addressCol = '주소') {
  const workbook = XLSX.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  for (const row of data) {
    const address = row[addressCol];
    if (address) {
      const coords = await getCoords(address);
      row['위도'] = coords.lat;
      row['경도'] = coords.lon;
      console.log(`Processed: ${address} -> ${coords.lat}, ${coords.lon}`);
    } else {
      row['위도'] = null;
      row['경도'] = null;
    }
  }

  const newSheet = XLSX.utils.json_to_sheet(data);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
  XLSX.writeFile(newWorkbook, outputFile);
  console.log(`Saved results to ${outputFile}`);
}

// 실행 예시
processExcel('노원구주간보호센터.xlsx', 'output.xlsx');
