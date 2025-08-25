import axios from 'axios';

// 1. API 엔드포인트
// const url = 'https://api.gachita.site:8443/api/book';
const url = 'http://localhost:8080/api/book';

// 2. 실제 주소 리스트
    // 병원 배열
    const hospitals = [
      { name: "인제대학교상계백병원", roadAddress: "동일로 1342", lat: 37.6485819883224, lng: 127.063115737673 },
      { name: "서울스카이정형외과의원", roadAddress: "동일로 1405", lat: 37.6538310278932, lng: 127.06017787506 },
      { name: "노원을지대학교병원", roadAddress: "한글비석로 68", lat: 37.6361106543284, lng: 127.06968108866 },
      { name: "노원365온한의원", roadAddress: "노원로 456", lat: 37.6574506244607, lng: 127.066727527743 },
      { name: "상계성모정형외과의원", roadAddress: "동일로 1643", lat: 37.674798, lng: 127.054854 },
      { name: "새서울연합의원", roadAddress: "동일로 1678", lat: 37.6780947400484, lng: 127.055706735633 },
      { name: "세이유외과의원 서울노원점", roadAddress: "동일로 1413", lat: 37.6547688511508, lng: 127.060019298479 },
      { name: "월계보건지소", roadAddress: "월계로 378", lat: 37.6314500319871, lng: 127.061591110372 },
      { name: "공릉보건지소", roadAddress: "공릉로 166-1", lat: 37.6247880837939, lng: 127.08000297878 },
      { name: "상계보건지소", roadAddress: "상계로 118", lat: 37.673864, lng: 127.077103 },
      { name: "평화치과의원", roadAddress: "공릉로46길 3", lat: 37.6271656479512, lng: 127.079141072247 },
      { name: "해독한의원 노원점", roadAddress: "공릉로 187", lat: 37.626426, lng: 127.078959 },
      { name: "공릉성모마취통증의학과의원", roadAddress: "공릉로 181", lat: 37.6259363374297, lng: 127.079415945795 }
    ];


    // 집 배열
    const homes = [
      { name: "월계주공2단지아파트", roadAddress: "초안산로1길 18", lat: 37.6291554160494, lng: 127.051603822219 },
      { name: "효성아파트", roadAddress: "화랑로 556", lat: 37.6212874655188, lng: 127.087753447955 },
      { name: "중계주공2단지아파트", roadAddress: "한글비석로14길 8", lat: 37.6574763373212, lng: 127.077434215909 },
      { name: "상계주공10단지아파트", roadAddress: "노원로 564", lat: 37.6616521070339, lng: 127.05612466376 },
      { name: "극동늘푸른아파트", roadAddress: "동일로246길 39", lat: 37.6770848451421, lng: 127.057187114254 },
      { name: "상록수1단지아파트", roadAddress: "동일로239나길 31", lat: 37.6773714294384, lng: 127.051556487898 },
      { name: "상계현대2차아파트", roadAddress: "동일로231길 86", lat: 37.671735799494, lng: 127.049890428436 },
      { name: "보람아파트", roadAddress: "한글비석로 479", lat: 37.6644977270046, lng: 127.064483155729 },
      { name: "노원아이파크아파트", roadAddress: "상계로23다길 13-8", lat: 37.6598474260427 , lng: 127.068904053591 },
      { name: "조은주택", roadAddress: "상계로23가길 19", lat: 37.6591244710147, lng: 127.069987958617 },
      { name: "성북맨션", roadAddress: "석계로 107", lat: 37.6259363374297, lng: 127.060418607051 },
      { name: "월계풍림아이원아파트", roadAddress: "화랑로47길 38", lat: 37.6164824350017, lng: 127.065675585768 },
      { name: "대주파크빌아파트", roadAddress: "섬밭로 52", lat: 37.6213557475708, lng: 127.072073463595 },
      { name: "은빛1단지아파트", roadAddress: "동일로245길 162", lat: 37.6808384621835  , lng: 127.0542198702 },
      { name: "두산아파트", roadAddress: "동일로241길 53", lat: 37.6780189926554  , lng: 127.052913393102 },
      { name: "상계주공4단지아파트", roadAddress: "동일로 1356", lat: 37.6498808620377  , lng: 127.062236934343 },
      { name: "노원에너지제로아파트", roadAddress: "한글비석로 97", lat: 37.6382367673341  , lng: 127.072572646722 },
      
    ];


// 3. 랜덤 선택 함수
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomTime = () => {
    const hour = Math.floor(Math.random() * 6) + 12; // 12~17시
    const minute = Math.floor(Math.random() * 6) * 10; // 0,10,20,30,40,50
    return `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
}

const randomName = () => {
  const firstNames = ['김','이','박','최','정','강','조','윤','장','임'];
  const lastNames = ['민준','서연','도윤','하윤','예준','지우','하은','준서','예린','서준'];
  return randomChoice(firstNames) + randomChoice(lastNames);
};

const randomPhone = () => `010-${Math.floor(Math.random()*9000+1000)}-${Math.floor(Math.random()*9000+1000)}`;


// 요청 보내기 (한 번만)
async function sendOneRandomRequest() {
  let start = randomChoice(homes).roadAddress;
  let end;
  do {
    end = randomChoice(hospitals).roadAddress;
  } while (end === start);

  const body = {
    bookName: randomName(),
    bookTel: randomPhone(),
    hospitalDate: "2025-08-26",
    hospitalTime: randomTime(),
    startAddr: start,
    endAddr: end,
    walker: Math.random() < 0.5
  };

  try {
    console.log(body);
    const res = await axios.post(url, body);
    console.log("요청 성공:", res.data);
  } catch (err) {
    console.error("요청 실패:", err.response?.data || err.message);
  }
}

// 실행
sendOneRandomRequest();
