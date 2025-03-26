/// <reference path ="../vendors/wijmo/Dist/controls/wijmo.d.ts"/>
/// <reference path ="../vendors/dhtmlx/codebase/dhtmlx.d.ts"/>

const tabs = function(){
    
    const documentElement = document.documentElement;
    let tabbar = new dhtmlXTabBar("cont");

    // 탭활성화시 타이틀 표시
    let typed = new Typed("#menuTitle",{
        strings: ["대시보드"],
        typeSpeed: 30
        //cursorChar: '.'
    });

    
    // 대시보드 탭 추가
    const initTabbar = ()=>{
        let role = $('#data-params').data('params').userInfo.role;
        let title = "대시보드";
        let id = "dashboard/dashboard";
        
        if(role=='USER_ROLE'){
            title = "마이페이지"
            id = "user/mypage"; 
        }

        let urlId = `view?view=${id}&title=${title}&authUrl=${id}`;
        tabbar.addTab(id,title,"150px");
        tabbar.cells(id).attachURL(urlId);
        tabbar.tabs(id).setActive();

        //새로운 탭일경우 타이틀
        typed.strings = [title];
        typed.reset(true);


        resizeContents();
        
    }

    /**
     * 브라우저 사이즈 조절시 사이즈 조정
     */
    const resizeContents = ()=>{
        let navBarWidth =$('#navbar').width()+50;  //메뉴바 사이즈
        let topBarHeight = 100; //상단 메뉴 사이즈
        
        //메뉴바 줄임여부
        let navbarcollapsed = localStorage.getItem("isNavbarVerticalCollapsed");

        //최소화 될경우 100으로 맞춰줌. JSON으로 
        //파싱하는이유는 localstorage는 데이터 타입이Sting으로만 저장된다. 이를 javascript object형태로 역직렬화되어 원본데이터를 얻을수있음.
        if(JSON.parse(navbarcollapsed)) navBarWidth = 100;

        //화면사이즈가 줄어들경우 메뉴바가 없어짐 메뉴바 사이즈를 30으로 초기화
        let mq1 = window.matchMedia("screen and (max-width: 1200px)");
		if(mq1.matches){
			navBarWidth = 25;
		}
        
        //메뉴바가 최소화될때 100으로 맞춰줌.
        //if(navBarWidth==116) navBarWidth = 100;

        $('#cont').width($(window).width()-navBarWidth);  
		$('#cont').height($(window).height()-topBarHeight); 

        //tabbar 내용 사이즈
		$('.dhxtabbar_cont').width($(window).width()-navBarWidth);
		$('.dhxtabbar_cont').height($(window).height());
		
		//tabbar 탭사이즈
		$('.dhxtabbar_tabs').width($(window).width()-navBarWidth);
		$('.dhxtabbar_tabs_base').width($(window).width()-navBarWidth-30);

        //iframe 상위 영역
        $('.dhx_cell_tabbar').width($(window).width()-navBarWidth);
		$('.dhx_cell_tabbar').height($(window).height());
        
		//iframe 상위 영역
		$('.dhx_cell_cont_tabbar').width($(window).width()-navBarWidth);
		$('.dhx_cell_cont_tabbar').height($(window).height());
				
		//iframe
		$('iframe').width($(window).width()-navBarWidth);
		$('iframe').height($(window).height()-topBarHeight);
        
    }

    /**
     * 탭추가
     * @param {String} id 탭 id(url)
     * @param {String} name 탭 이름
     * @param {String} title 상위 title에 표기될 메뉴 경로
     */
    const addTabBar = (id,name,title)=>{
        
        let isSame = false; //동일한 아이디를 가진 탭이 존재하는지 여부

        tabbar.forEachTab((tab)=>{
            let tabId = tab.getId();
            
            //동일한 탭이 이미 있다면 그탭으로 포커스 이동
            if(tabId==id){
                tabbar.tabs(id).setActive();
                isSame = true;
            }
        });

        if(!isSame){
            //view: html 경로, title: 메뉴경로, authUrl: 권한관리 key값
            let url = `view?view=${id}&title=${title}&authUrl=${id}`;
            tabbar.enableTabCloseButton(true);
            tabbar.addTab(id,name,'150px');
            tabbar.cells(id).attachURL(url);
            tabbar.tabs(id).setActive();

            //새로운 탭일경우 타이틀
            typed.strings = [title];
            typed.reset(true);

        }

        $("#navbarVerticalCollapse").collapse('hide'); 

        resizeContents();

    }

    
    
    const handleEvents = ()=>{
        
        //브라우저 사이즈 조절시 사이즈 조정함수 호출
        $(window).on("resize",resizeContents);

        //메뉴바 최소화 토글버튼 클릭시 사이즈 조정함수 호출
        $('.navbar-vertical-toggle').on('click',resizeContents);

        //tab 클릭시 resize해줘야함.
        //tabbar.attachEvent 에 resizeContents를 넣으니 페이지가 바뀌기 전에 이벤트가 호출되어 resizeContents가 안먹힘.
        $(document).on('click','.dhxtabbar_tab',resizeContents);

        //탭선택 이벤트 타이틀 표시
        tabbar.attachEvent("onSelect", (idNew, idOld)=>{
            
            //typed.strings = [tabbar.tabs(idNew).getText()]
            
            //선택되는 탭(iframe)의 title에 접근해서 title 표시
            let ifr = tabbar.tabs(idNew).getFrame();
            let title = ifr.contentWindow.document.title;
            if(title){
                typed.strings = [title]
            }

            typed.reset(true);
            return true; // allow selection
            
        });
        
        //메뉴 클릭시 이벤트
        $(document).on('click','.addTabBar',function(e){
            e.preventDefault(); //a 태그의 href를 막기위함.
            let id = $(this).attr('href');
            let name = $(this).text();

            let titleArray = $(this).data('path').split('>');
            let title = "";
            
            titleArray.forEach((value,index)=>{
                if(index > 1) title = title+" > ";
                if(index > 0) title = title + value;
            });

            if(id.startsWith('http')){
                let posLeft=(screen.availWidth-690)/2;	//중앙위치산출
                let posTop=(screen.availHeight-890)/2;

                window.open(id,"",
                                `toolbar=no, location=no, directories=no, status=yes, 
                                    menubar=no, scrollbars=yes, resizable=no, width=1000, height=${screen.availHeight-200},top=${posTop} left=${posLeft}`);
                return;
            }
            

            
            addTabBar(id,name,title);

        });

        //새창띄우기 버튼
        $(document).on('click','.menuPop',function(e){
            let $element = $(this).parents('li').children('.addTabBar');
            let id = $element.attr('href');
            //let name = $element.text();

            let titleArray = $element.data('path').split('>');
            let title = "";
            
            titleArray.forEach((value,index)=>{
                if(index > 1) title = title+" > ";
                if(index > 0) title = title + value;
            });

            let posLeft=(screen.availWidth-690)/2;	//중앙위치산출
            let posTop=(screen.availHeight-890)/2;

	        window.open(`view?view=${id}&title=${title}&authUrl=${id}`,"",
    		        		  `toolbar=no, location=no, directories=no, status=yes, 
								  menubar=no, scrollbars=yes, resizable=no, width=1600, height=${screen.availHeight-200},top=${posTop} left=${posLeft}`);

        });


        //탭새로고침
        $('#refresh-tab').on('click',()=>{
            let tab = tabbar.getActiveTab();
            let ifr = tabbar.tabs(tab).getFrame();
            ifr.contentDocument.location.reload(true);
        });
        
        //전체화면 
        $('#fullscreen').on('click',()=>{
            if(document.fullscreenElement ===null){
                documentElement.requestFullscreen();
            }else{
                document.exitFullscreen();
            }
        });


    }

    return{
        /**
         * 초기화
         */
        init:()=>{
            initTabbar();
            handleEvents();
            
        },
        addTabBar:(id,name,title)=>{
            addTabBar(id,name,title);
        }

        
        
    };
}();

/**
 * 다른 모듈에서 탭호출을 위한 함수
 * @param {String} id 탭ID
 * @param {String} name 탭이름
 * @param {String} title 타이틀
 */
function addTabBar(id,name,title){
    tabs.addTabBar(id,name,title);
}

//문서 로딩후 시작점
$(()=>{
    tabs.init();
});

