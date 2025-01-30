/// <reference path ="../vendors/wijmo/Dist/controls/wijmo.d.ts"/>
/// <reference path ="../vendors/dhtmlx/codebase/dhtmlx.d.ts"/>

import * as ajax from "./common/ajax.js";
import {treeToObject } from "./common/common.js";
import {JQUERYEVENT} from "./common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "./common/msgBox.js";

const index = function(){
    
    
    /**
     * 로그아웃
     */
    const logOut = ()=>{
        location.href ="/log-out";
    }
    /**
     * 비밀번호 변경
     */
    const saveOfPassword = async ()=>{

        let oldPassword= $('#oldPassword').val();
        let newPassword= $('#newPassword').val();
        let newPasswordConfirm= $('#newPasswordConfirm').val();
        
        if(wijmo.isNullOrWhiteSpace(oldPassword)){
            alertWarning('변경불가.','기존 비밀번호를 입력해주세요.',()=>$('#oldPassword').trigger('focus'));
            return;
        }
        if(wijmo.isNullOrWhiteSpace(newPassword)){
            alertWarning('변경불가.','새로운 비밀번호를 입력해주세요.',()=>$('#newPassword').trigger('focus'));
            return;
        }
        if(wijmo.isNullOrWhiteSpace(newPasswordConfirm)){
            alertWarning('변경불가.','비밀번호 확인을 입력해주세요.',()=>$('#newPasswordConfirm').trigger('focus'));
            return;
        }

        if(newPassword != newPasswordConfirm){
            alertWarning('변경불가.','새로운 비밀번호와 비밀번호 확인이 일치하지 않습니다.',()=>$('#newPasswordConfirm').trigger('focus'));
            return;
        }
        
        
        let params = {
            uri: 'login/change-password',
            oldPassword: oldPassword,
            newPassword: newPassword,
        }

        try {
            await ajax.putAjax(params);
            alertInfo('비밀번호 변경','비밀번호가 변경되었습니다.');
        } catch (error) {
            alertError('비밀번호 변경','비밀번호 변경에 실패하였습니다.');
        }

    }

    const handleEvents = ()=>{
        
        $('#btn-setting-save').on('click',saveOfPassword); //비밀번호 변경
        
        $("#btn-logOut").on(JQUERYEVENT.CLICK,logOut);    //로그아웃


    }

    const menuLoad = (menuCode)=>{

        $("#nav-menu").html("");
        // let menu2 = [
        //     {menCode:'INFO',menName:'정보관리',menUpcd:'ROOT',menLock:'N',menIcon:null,	menIndte:'2023-05-19',	menUpdte:'2023-05-22', menSeq:1, level:2},
        //     {menCode:'INFO_MENU',menName:'메뉴관련업무',menUpcd:'INFO', menIcon:'fas fa-file-alt',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/23', menSeq:1,level:3},
        //     {menCode:'INCOEN01',menName:'메뉴관리',menUrl:'info/menu/menu',menUpcd:'INFO_MENU',menIcon:null,menLock:'N', menIndte:'2023-05-19',	menUpdte:'2023/05/20', menSeq:1,level:4}
        // ]
        
        let params = {
            uri: `system/menus/${menuCode}/children`,
        }

        ajax.getAjax(params,true).then((data)=>{
            
            let menu = data['menuList'];

            if(wijmo.isEmpty(menu)) return;

            let menuTree = treeToObject(menu,'menCode','menUpcd');
            // console.debug(menuTree);
            
            let sss = ` <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">${menuTree[0].menName}</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>`;
            sss += renderTree(menuTree[0].children);
            //console.debug(sss);
            $("#nav-menu").html(sss);

            //collapse 에서 펼치기로 설정된 엘리먼트 가져온다.
            let collapseElementList = $('.nav-link[aria-expanded=true]');
            
            //루프를 돌면서 펼치기로 설정되어 있는 자식의 id값을 가져와서 collapse('show')를 사용하여 풀어준다.
            collapseElementList.map((index,element)=>{
                let parentId = $(element).attr('aria-controls');
                $(`#${parentId}`).collapse('show');
            });

            //siteMap(menuTree[0].children);
            
        }).catch((e)=>{});

        
    }

    /**
     * 메뉴 전체보기
     * @param {object} childs 
     */
    const siteMap = (childs)=>{

        const getChildren = (children)=>{
            let sss = "";    
            if(wijmo.isEmpty(children)) return sss;

            children.forEach(item=>{
                sss+=`<a class="addTabBar nav-link py-1 link-600 fw-medium" ${!wijmo.isNullOrWhiteSpace(item.menUrl)?`href="${item.menUrl}" data-path="${item.path}"`:``}>${item.menName}</a>`;
                
                if(!wijmo.isEmpty(children)) sss+=getChildren(item.children);
            });
            return sss;
        }

        let parent = "";
        
        childs.forEach((element,index) => {

            //sitemap 4컬럼으로 
            if(index%4==0){
                if(index > 0) parent += `</div>`;
                parent += `<div class="row">`;
            }
            let children = getChildren(element.children);
            //링크가 없는 부모메뉴
            let alink = `<a class="nav-link text-700 mb-0 fw-bold">${element.menName}</a>`;

            //부모메뉴이지만 링크가 있는경우
            if(!wijmo.isNullOrWhiteSpace(element.menUrl))
                alink = `<a class="nav-link text-700 mb-0 fw-bold addTabBar" href="${element.menUrl}" data-path="${element.path}">${element.menName}</a>`;

            parent+= `  <div class="col-6 col-lg-3 col-xxl-3">
                            <div class="nav flex-column">
                                ${alink}
                                ${children}
                            </div>
                        </div>`;

        });
        parent+=`</div>`;

        //console.debug(parent);
        $('#siteMap').html("").append(parent);

    }

    const renderTree = (child)=>{
        let sss = "";
        let expanded = false;

        child.forEach(item => {
            expanded = false;
            if(wijmo.isEmpty(item.children)){
                
                //새창띄우기 버튼 삽입으로 위코드에서 아래코드로 변경함.
                sss += `<li class="nav-item d-flex flex-between-center hover-actions-trigger">
                            <a class="nav-link addTabBar" ${!wijmo.isNullOrWhiteSpace(item.menUrl)?`href="${item.menUrl}" data-path="${item.path}"`:``}> `;
                if(!wijmo.isNullOrWhiteSpace(item.menIcon)) 
                    sss += `    <span class="nav-link-icon"><span class="${item.menIcon}"></span></span>`;

                sss += `        <span class="nav-link-text ps-1">${item.menName}</span>
                            </a>
                            <div class="hover-actions end-0">
                                <button class="btn fs--2 icon-item-sm btn-link px-0 text-600 menuPop"><span class="fas fa-external-link-alt text-light"></span></button>
                            </div>
                        </li>`
            }else{
                //level 2인 항목만 펼치기 한다. 
                if(item.level==2) expanded = true;
                
                sss += `<li class="nav-item">
                            <a class="nav-link dropdown-indicator" href="#${item.menCode}" role="button" data-bs-toggle="collapse" aria-expanded="${expanded}" aria-controls="${item.menCode}">
                                <div class="d-flex align-items-center">`;
                
                if(!wijmo.isNullOrWhiteSpace(item.menIcon)) 
                    sss += `        <span class="nav-link-icon"><span class="${item.menIcon}"></span></span>`;
                
                sss += `        <span class="nav-link-text ps-1">${item.menName}</span>
                                </div>
                            </a>
                        </li>
                        <ul class="nav collapse" id="${item.menCode}">
                            ${renderTree(item.children)}
                        </ul>`;
            }

        });
        return sss;
    }

    
    
    return{
        /**
         * 초기화
         */
        init:()=>{
            handleEvents();
            let role = $('#data-params').data('params').userInfo.role;
            menuLoad(role); 
            
        }
        
    };
}();


//문서 로딩후 시작점
$(()=>{
    index.init();
});

