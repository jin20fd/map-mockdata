const XLSX = require('xlsx');
const fs = require('fs');

// 엑셀 파일 읽기
const workbook = XLSX.readFile('노인복지센터(좌표추가).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

// INSERT SQL 빌드
const values = rows.map(row => {
  const name = row['이름'] || '';
  const tel = row['전화번호'] || '';
  const addr = row['주소'] || '';
  const lat = row['위도'] != null ? row['위도'] : 'NULL';
  const lon = row['경도'] != null ? row['경도'] : 'NULL';

  // 작은따옴표 이스케이프 처리
  const esc = str => String(str).replace(/'/g, "\\'");
  return `('${esc(name)}', '${esc(tel)}', '${esc(addr)}', ${lat}, ${lon})`;
}).join(',\n       ');

// 전체 SQL 조립
const sql = `INSERT INTO \`center\` (\`center_name\`, \`center_tel\`, \`center_addr\`, \`lat\`, \`lon\`)
VALUES ${values};`;

// 출력
// console.log(sql);

// 원하면 파일로 저장도 가능
fs.writeFileSync('insert-centers.sql', sql);