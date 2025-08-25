const bookNames = [
  ["권민혁", "이정빈", "성유진"],
  ["김명균", "최재현", "한경준"],
  ["김수환", "신지수", "임규현"],
  ["박세연", "이성훈", "백승진"],
  ["조은진", "유태승", "홍규진"],
  ["소보길", "유재민", "최지애"],
  ["박종성", "정연주", "김미소"],
  ["배연준", "김민정", "시보성"],
];

const roads = ["동일로", "상계로", "한글비석로", "공릉로", "덕릉로", "노해로", "광운로"];
const statuses = ["FIXED", "FAIL"];

const startDate = new Date(2025, 7, 1); // 2025-08-01
const endDate = new Date(2025, 7, 22);  // 2025-08-22

// 일요일 제외한 랜덤 날짜
function randomDate(start, end) {
  while (true) {
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    if (d.getDay() !== 0) return d;
  }
}

// created_at 이후, 같은 주(월~토) 안에서 랜덤 hospital_date
function randomHospitalDate(createdAt) {
  const day = createdAt.getDay();
  const monday = new Date(createdAt);
  monday.setDate(createdAt.getDate() - (day === 0 ? 6 : day - 1));
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  while (true) {
    const d = new Date(createdAt.getTime() + Math.random() * (saturday.getTime() - createdAt.getTime()));
    if (d > createdAt && d.getDay() !== 0) return d;
  }
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateTime(d) {
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

// SQL 생성
let sqls = [];
for (let i = 0; i < 20; i++) {
  const createdAt = randomDate(startDate, endDate);
  createdAt.setHours(Math.floor(Math.random() * 23), Math.random() < 0.5 ? 0 : 30);

  const hospitalDate = randomHospitalDate(createdAt);
  const hospitalTime = `${pad(8 + Math.floor(Math.random() * 9))}:${Math.random() < 0.5 ? "00" : "30"}`;

  const name = bookNames[Math.floor(Math.random() * bookNames.length)][Math.floor(Math.random() * 3)];
  const tel = `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const startAddr = `${roads[Math.floor(Math.random() * roads.length)]} ${Math.floor(Math.random() * 2000)}`;
  const endAddr = `${roads[Math.floor(Math.random() * roads.length)]} ${Math.floor(Math.random() * 2000)}`;

  const lat = (37.62 + Math.random() * 0.07).toFixed(6);
  const lng = (127.02 + Math.random() * 0.07).toFixed(6);

  const walker = Math.random() < 0.5 ? "true" : "false";
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  sqls.push(`('${name}', '${tel}', '${formatDate(hospitalDate)}', '${hospitalTime}',
    '${startAddr}', '${endAddr}', ${walker}, '${formatDateTime(createdAt)}',
    '${formatDateTime(hospitalDate)}',
    ${lat}, ${lng}, ${(parseFloat(lat) + 0.002).toFixed(6)}, ${(parseFloat(lng) + 0.002).toFixed(6)},
    '${status}')`);
}

const output = `
INSERT INTO book (
  book_name, book_tel, hospital_date, hospital_time,
  start_addr, end_addr, walker, created_at, deadline,
  start_lat, start_lng, end_lat, end_lng, book_status
) VALUES
${sqls.join(",\n")};
`;