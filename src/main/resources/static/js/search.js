"use strict";

let mapContainer = document.getElementById('map');      //지도를 담을 영역의 DOM 레퍼런스
let mapOption = {                          //지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(33.450701, 126.570667),                      //지도의 중심좌표
    level: 3                                                                   //지도의 레벨(확대, 축소 정도)
};
let map = new kakao.maps.Map(mapContainer, mapOption);         //지도 생성 및 객체 리턴

let searchText = "";                                                                    // URL 장소 검색 파라미터
let inputObjSearchText = document.getElementById("searchText");         // 검색어
let btnSearch = document.getElementById("btnSearch");                   // 검색 버튼
let latPoint = "";  // 위도
let lonPoint = "";  // 경도
let xPoint = "";    // 격자 x 포인트
let yPoint = "";    // 격자 y 포인트
let divObjt1h = document.getElementById("t1h"); // 온도
let divObjrn1 = document.getElementById("rn1"); // 강수
let divObjreh = document.getElementById("reh"); // 습도
let divObjvec = document.getElementById("vec"); // 풍향
let divObjwsd = document.getElementById("wsd"); // 풍속
let pObjgpty = document.getElementById("pty");  // 강수형태
let wt1 = document.getElementById("wt1");
let wt5 = document.getElementById("wt5");
let wt7 = document.getElementById("wt7");
let wt9 = document.getElementById("wt9");
let wt12 = document.getElementById("wt12");
let wt14 = document.getElementById("wt14");


/** Initialize */
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContent");
    /* CRUD 버튼 이벤트 등록 */
    addEventListenerCRUDBtn();

    /* Search Condition 이벤트 등록 */
    addEventListenerSearchCondition();

    /* 장소 검색하기 */
    fnSearchLocation();

    /* 날씨 API */
    //fnSearchWeater();
});


/** 장소 검색하기 */
function fnSearchLocation() {
    console.log("fnSearchLocation");

    let locationParam = new URLSearchParams(window.location.search).get('location');
    searchText = locationParam;
    console.log("locationParam: " + locationParam);
    console.log("searchText: " + searchText);

    inputObjSearchText.value = searchText;

    // 주소-좌표 변환 객체를 생성합니다
    let geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(searchText, function(result, status) {

        // 정상적으로 검색이 완료됐으면
        if (status === kakao.maps.services.Status.OK) {

            console.log("정상적으로 검색");

            // 위도, 경도
            let xValue = parseFloat(result[0].x);
            let yValue = parseFloat(result[0].y);

            latPoint = yValue;  // 위도
            lonPoint = xValue;  // 경도

            fnSearchWeater();

            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 결과값으로 받은 위치를 마커로 표시합니다
            var marker = new kakao.maps.Marker({
                map: map,
                position: coords
            });

            // 인포윈도우로 장소에 대한 설명을 표시합니다
            var infowindow = new kakao.maps.InfoWindow({
                content: '<div style="width:150px;text-align:center;padding:6px 0;">'+searchText+'</div>'
            });
            infowindow.open(map, marker);

            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(coords);
        }else {
            console.log("검색 안됨");
            if(navigator.geolocation){
                console.log("허용");

                inputObjSearchText.value = "현재 위치";

                // GeoLocation을 이용해서 접속 위치를 얻어옵니다
                navigator.geolocation.getCurrentPosition(function (position){
                    let lat = position.coords.latitude;     // 위도
                    let lon = position.coords.longitude;    // 경도

                    coords = new kakao.maps.LatLng(lat, lon);

                    latPoint = lat;  // 위도
                    lonPoint = lon;  // 경도

                    fnSearchWeater();

                    // 마커 표시
                    marker = new kakao.maps.Marker({
                        map: map,
                        position: coords
                    });

                    // 인포윈도우 표시
                    infowindow = new kakao.maps.InfoWindow({
                        content: '<div style="width:150px;text-align:center;padding:6px 0;">현재 위치</div>'
                    })
                    infowindow.open(map, marker);

                    // 지도 중심좌표 이동이키기
                    map.setCenter(coords);

                }, function (error) {
                    alert("현재 위치 검색을 허용해주십시오");
                    console.log("Error: 위치 액세스 거부");
                })
            }
        }
    });
}

/** 검색 버튼으로 장소 검색하기 */
function fnSearchLocation2() {
    console.log("inputObjSearchText.value.trim(): " + inputObjSearchText.value.trim());
    if(inputObjSearchText.value.trim() != "") {
        // 입력한 검색어를 url 파라미터 수정
        let url = new URL(window.location.href);
        url.searchParams.set("location", inputObjSearchText.value.trim());
        window.history.replaceState({}, "", url);

        // 현재 윈도우를 새로고침
        window.location.reload();

    }else {
        alert("장소를 검색해주세요!");
    }
}

/** 날씨 API */
function fnSearchWeater() {

    console.log("out of function latPoint: " + latPoint);
    console.log("out of function lonPoint: " + lonPoint);


    // 오늘 날짜 구하기
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    let day = ('0' + currentDate.getDate()).slice(-2);

    let formattedDate = year + month + day;

    console.log("formattedDate: " + formattedDate);

    // 현재 시간에서 -30분 시간 구하기 (30분마다 데이터 갱신)
    // 시간 구하기
    let hours = ('0' + currentDate.getHours()).slice(-2);
    let minutes = ('0' + (currentDate.getMinutes() - 30)).slice(-2);

    // 만약 minutes가 30보다 작으면 hours에서 1을 빼주기
    if (currentDate.getMinutes() < 30) {
        hours = ('0' + (currentDate.getHours() - 1)).slice(-2);
        minutes = ('0' + (currentDate.getMinutes() + 30)).slice(-2);
    }

    let formattedTime = hours + minutes;
    console.log("formattedTime: " + formattedTime);

    // 좌표를 격자 x,y point로 바꾸기
    let result = dfs_xy_conv("toXY", latPoint, lonPoint);
    console.log("X:", result.x, "Y:", result.y);

    xPoint = result.x;
    yPoint = result.y;

    var xhr = new XMLHttpRequest();
    var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst'; /*URL*/
    var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'5CZW8vE4f16CFpvpKdt5RwisoNCWGjCG%2FlZqcpESy8NaGCdcB8vPI6aDpHCKyQcqTImAERfoVVHuzLJsaDHitg%3D%3D'; /*Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지 번호 */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /* 한 페이지 결과 수 */
    queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 응답자료형식 */
    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(formattedDate); /* 발표일자 */
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(formattedTime); /* 발표시각 */
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(xPoint); /* 예보지점 X 좌표 */
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(yPoint); /* 예보지점 Y 좌표 */
    xhr.open('GET', url + queryParams);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log("Success!");

                // JSON 파싱
                var jsonResponse = JSON.parse(this.responseText);

                // 필요한 정보 추출
                var items = jsonResponse.response.body.items.item;

                console.log("items length: " + items.length);

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];

                    let intBaseTime =  Number(item.baseTime);

                    // 시간과 분으로 나누어 계산
                    let hours = Math.floor(intBaseTime / 100);
                    let minutes = intBaseTime % 100;

                    // 시간을 분 단위로 변환하고 30분을 더함
                    let adjustedTime = (hours * 60 + minutes + 30) % 2400;

                    // 시간과 분으로 다시 변환
                    let adjustedHours = Math.floor(adjustedTime / 60);
                    let adjustedMinutes = adjustedTime % 60;

                    // 문자열로 변환하여 예보시각으로 설정
                    let plusBaseTime = ('00' + adjustedHours).slice(-2) + ('00' + adjustedMinutes).slice(-2);

                    if(item.fcstTime == plusBaseTime) {

                        console.log("--------------------------------");
                        console.log("item: " + JSON.stringify(item));
                        /*
                        console.log("자료구분코드: " + item.category);
                        console.log("예보일자: " + item.fcstDate);
                        console.log("예보시각: " + item.fcstTime);
                        console.log("예보값: " + item.fcstValue);
                        */


                        // 기온
                        if(item.category === 'T1H') {
                            divObjt1h.innerText = item.fcstValue;
                        }
                        // 강수량
                        if(item.category === 'RN1') {
                            divObjrn1.innerText = item.fcstValue;
                        }
                        // 습도
                        if(item.category === 'REH') {
                            divObjreh.innerText = item.fcstValue;
                        }
                        // 풍향
                        if(item.category === 'VEC') {

                            let intVec = parseInt(item.fcstValue);
                            let windDirection = Math.floor(((intVec + 22.5 * 0.5)/ 22.5));
                            console.log("windDirection: " + windDirection);
                            if(windDirection === 0) {
                                divObjvec.innerText = "북풍";
                            }else if(windDirection === 1) {
                                divObjvec.innerText = "북북동풍";
                            }else if(windDirection === 2) {
                                divObjvec.innerText = "북동";
                            }else if(windDirection === 3) {
                                divObjvec.innerText = "동북동풍";
                            }else if(windDirection === 4) {
                                divObjvec.innerText = "동풍";
                            }else if(windDirection === 5) {
                                divObjvec.innerText = "동남동풍";
                            }else if(windDirection === 6) {
                                divObjvec.innerText = "남동풍";
                            }else if(windDirection === 7) {
                                divObjvec.innerText = "남남동풍";
                            }else if(windDirection === 8) {
                                divObjvec.innerText = "남풍";
                            }else if(windDirection === 9) {
                                divObjvec.innerText = "남남서풍";
                            }else if(windDirection === 10) {
                                divObjvec.innerText = "남서풍";
                            }else if(windDirection === 11) {
                                divObjvec.innerText = "서남풍";
                            }else if(windDirection === 12) {
                                divObjvec.innerText = "서풍";
                            }else if(windDirection === 13) {
                                divObjvec.innerText = "서북서풍";
                            }else if(windDirection === 14) {
                                divObjvec.innerText = "북서풍";
                            }else if(windDirection === 15) {
                                divObjvec.innerText = "북북서풍";
                            }else if(windDirection === 16) {
                                divObjvec.innerText = "북풍";
                            }

                        }
                        // 풍속
                        if(item.category === 'WSD') {
                            divObjwsd.innerText = item.fcstValue;
                        }

                        // 강수형태
                        if(item.category === 'PTY') {
                            //pObjgpty
                            if(item.fcstValue === '1'){
                                pObjgpty.innerText = "비";
                                wt9.style.display = "";
                            }else if(item.fcstValue === '2'){
                                pObjgpty.innerText = "비/눈";
                                wt14.style.display = "";
                            }else if(item.fcstValue === '3'){
                                pObjgpty.innerText = "눈";
                                wt12.style.display = "";
                            }else if(item.fcstValue === '5'){
                                pObjgpty.innerText = "빗방울";
                                wt9.style.display = "";
                            }else if(item.fcstValue === '6'){
                                pObjgpty.innerText = "빗방울 눈날림";
                                wt14.style.display = "";
                            }else if(item.fcstValue === '7'){
                                pObjgpty.innerText = "눈날림";
                                wt12.style.display = "";
                            }else if(item.fcstValue === '0'){
                                pObjgpty.innerText = "맑음";
                                wt1.style.display = "";
                            }
                        }


                    }
                }

            } else {
                console.log("Error: " + this.status);
            }
        }
    };

    xhr.send('');
}

/** 위도, 경도를 x,y 격자 포인트로 변경 */
var RE = 6371.00877; // 지구 반경(km)
var GRID = 5.0; // 격자 간격(km)
var SLAT1 = 30.0; // 투영 위도1(degree)
var SLAT2 = 60.0; // 투영 위도2(degree)
var OLON = 126.0; // 기준점 경도(degree)
var OLAT = 38.0; // 기준점 위도(degree)
var XO = 43; // 기준점 X좌표(GRID)
var YO = 136; // 기1준점 Y좌표(GRID)

// LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
function dfs_xy_conv(code, v1, v2) {
    // LCC DFS 좌표변환을 위한 기초 자료
    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;

    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;

    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    var rs = {};
    if (code == "toXY") {
        rs['lat'] = v1;
        rs['lng'] = v2;
        var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        var theta = v2 * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;
        rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    }
    else {
        rs['x'] = v1;
        rs['y'] = v2;
        var xn = v1 - XO;
        var yn = ro - v2 + YO;
        ra = Math.sqrt(xn * xn + yn * yn);
        if (sn < 0.0) - ra;
        var alat = Math.pow((re * sf / ra), (1.0 / sn));
        alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

        if (Math.abs(xn) <= 0.0) {
            theta = 0.0;
        }
        else {
            if (Math.abs(yn) <= 0.0) {
                theta = Math.PI * 0.5;
                if (xn < 0.0) - theta;
            }
            else theta = Math.atan2(xn, yn);
        }
        var alon = theta / sn + olon;
        rs['lat'] = alat * RADDEG;
        rs['lng'] = alon * RADDEG;
    }
    return rs;

}

/** CRUD 버튼 이벤트 등록 */
function addEventListenerCRUDBtn(){
    btnSearch.addEventListener("click", fnSearchLocation2);
}

/** Search Condition 이벤트 등록 */
function addEventListenerSearchCondition() {
    inputObjSearchText.addEventListener("keyup", function (event){
        if(event.key === 'Enter') {
            fnSearchLocation2();
        }
    })
}