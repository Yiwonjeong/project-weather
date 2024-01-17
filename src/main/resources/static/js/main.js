"use strict";

let inputObjSearchText = document.getElementById("searchText");         // 검색어
let btnSearch = document.getElementById("btnSearch");                   // 검색 버튼

/** Initialize */
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContent");

    /* CRUD 버튼 이벤트 등록 */
    addEventListenerCRUDBtn();

    /* Search Condition 이벤트 등록 */
    addEventListenerSearchCondition();
});

/** 검색하기 */
function fnSearch() {
    console.log("fnSearch");
    // 검색어가 비어있지 않다면
    if(inputObjSearchText.value.trim() != "") {
        //console.log("searchText: " + searchText.value);
        window.location.href = "/search?location=" + encodeURIComponent(searchText.value);
    }else {
        alert("장소를 검색해주세요!");
    }
}

/** CRUD 버튼 이벤트 등록 */
function addEventListenerCRUDBtn(){
    //btnKakaoLogin.addEventListener("click", fnKakaoLogin);
    btnSearch.addEventListener("click", fnSearch);
}

/** Search Condition 이벤트 등록 */
function addEventListenerSearchCondition() {
    inputObjSearchText.addEventListener("keyup", function (event){
        if(event.key === 'Enter') {
            fnSearch();
        }
    })
}