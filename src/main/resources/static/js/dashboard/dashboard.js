
import GridFactory from "../common/wijmo/gridFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import { countUp } from "../common/plugin.js";

const dashboard = function(){

    let fileUpload = $('#notice-form').get(0).dropzone;         //파일업로드
    // fileUpload.options.maxFiles = 3;     //파일첨부 가능 갯수(기본은 html 태그 data-options 에 정의함)

    const handleEvent = ()=>{

        

    }
    
    return{
        init:()=>{
            handleEvent();
            
        }
    }
}();


//문서(DOM) 로딩후 시작점
$(()=>{
    dashboard.init();
    
});