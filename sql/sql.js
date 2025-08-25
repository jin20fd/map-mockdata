function createCarSql() {
    const models = [
        { model_name: "현대 스타리아", capacity: 11, low_floor: true,  car_image: "https://gachita-bucket.s3.ap-northeast-2.amazonaws.com/images/094176c8-c00a-4ade-9afe-ccead2fca88a.png" },
        { model_name: "기아 카니발", capacity: 7,  low_floor: true, car_image: "https://gachita-bucket.s3.ap-northeast-2.amazonaws.com/images/094176c8-c00a-4ade-9afe-ccead2fca88a.png" },
        { model_name: "현대 스타렉스", capacity: 9,  low_floor: true, car_image: "https://gachita-bucket.s3.ap-northeast-2.amazonaws.com/images/094176c8-c00a-4ade-9afe-ccead2fca88a.png" },
        { model_name: "기아 레이", capacity: 4,  low_floor: false, car_image: "https://gachita-bucket.s3.ap-northeast-2.amazonaws.com/images/094176c8-c00a-4ade-9afe-ccead2fca88a.png" },
    ];

    let sql = "INSERT INTO car (center_id, model_name, car_number, capacity, low_floor, car_image, created_at, del_yn)\nVALUES\n";

    let carNumberCounter = 1000; // 차량번호 시퀀스 시작점

    for (let center = 1; center <= 81; center++) {
        models.forEach((car, idx) => {
            carNumberCounter++;
            const carNumber = `${String(center).padStart(2, '0')}가${carNumberCounter}`;
            sql += `(${center}, '${car.model_name}', '${carNumber}', ${car.capacity}, ${car.low_floor}, '${car.car_image}', NOW(), 'N'),\n`;
        });
    }

    sql = sql.slice(0, -2) + ";";

    console.log(sql);
}


function createRentalSql() {
    // 8월 한달
    const startDate = new Date(2025, 7, 1);  // 2025-08-01 (JS의 month는 0부터 시작, 7=8월)
    const endDate = new Date(2025, 7, 31);   // 2025-08-31

    // 센터별로 한대씩
    const carIds = [];
    for (let id = 1; id <= 320; id++) {   // 예시: car_id 1부터 50까지 4씩 증가
        carIds.push(id);
    }

    let values = [];
    for (const carId of carIds) {
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;
            values.push(`(${carId}, '${dateStr}', '10:00:00', '20:00:00')`);
        }
    }

    const sql = `
    INSERT INTO rental (car_id, rental_date, rental_start_time, rental_end_time)
    VALUES
    ${values.join(",\n")};
    `;

    console.log(sql);
}


createCarSql();
// createRentalSql();
