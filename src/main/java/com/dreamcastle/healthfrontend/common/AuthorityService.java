package com.dreamcastle.healthfrontend.common;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.ObjectUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dreamcastle.healthfrontend.common.AuthorityDto.Authority;
import com.dreamcastle.healthfrontend.common.AuthorityDto.BodyData;
import com.dreamcastle.healthfrontend.login.dto.UserDto;
import com.dreamcastle.healthfrontend.login.util.JwtTokenProvider;
import com.dreamcastle.healthfrontend.restapi.service.RestApiService;
import com.dreamcastle.healthfrontend.utils.JsonUtils;
/**
 * 페이지 호출이나 api 호출시 프로그램 권한level과 lock 여부를 반환
 * viewController 를 통한 페이지 반환시 권한레벨(authLevel)로 javascript로 컨트롤하고
 * restapi를 보낼때 lock 여부를 조회해서 lock이 설정된 경우 막는다.
 */
@Service
@Slf4j
public class AuthorityService {

    //private final FeignClientBuilder feignClientBuilder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestApiService restApiService;
    
    // public AuthorityService(ApplicationContext appContext, JwtTokenProvider jwtTokenProvider){ 
    //     this.feignClientBuilder = new FeignClientBuilder(appContext);
    //     this.jwtTokenProvider = jwtTokenProvider;
    // }

    public AuthorityService(JwtTokenProvider jwtTokenProvider,RestApiService restApiService){ 
        this.jwtTokenProvider = jwtTokenProvider;
        this.restApiService = restApiService;
    }

    public AuthorityDto getAuthority(HttpServletRequest request, String url) {

        //token에서 사용자 정보 추출
        UserDto userDto =  jwtTokenProvider.getUserInfoByToken(getToken(request));

        //첫페이지(index),대시보드,  고객일경우 모든권한을 준다.
        if(url.equalsIgnoreCase("index") || url.equalsIgnoreCase("dashboard/dashboard") ||
            userDto.getRole().equalsIgnoreCase("USER_ROLE")){
            Authority authority = Authority.builder().athIns("Y").athDel("Y").athLock("N").build();
            BodyData bodyData = BodyData.builder().authority(authority).build();
            AuthorityDto authorityDto = AuthorityDto.builder()
                                                    .status(true)
                                                    .data(bodyData)
                                                    .build();
            
            return authorityDto;
        }

        Map<String,Object> param = new HashMap<String,Object>();
        param.put("menuUrl", url);
        param.put("jan", userDto.getJan());
        
        //본인의 해당프로그램의 권한레벨
        String uri = "system/authorities/"+userDto.getUserId(); 

        ResponseEntity<?> responseEntity = restApiService.getRestAPI(param, uri);
        AuthorityDto authorityDto = JsonUtils.deserialize(responseEntity.getBody(), AuthorityDto.class);

        return authorityDto;
    }
    

    private String getToken(HttpServletRequest request) {

        String token = null;
		
		//토큰받아오기
		if(!ObjectUtils.isEmpty(request.getCookies())) {
			token = Arrays.stream(request.getCookies())
				.filter(c->c.getName().equals("dreamcastle-health")) //람다식
				.findFirst()	//하나만 반환
				.map( Cookie::getValue) // map: 원하는 형태로 변환, 더블콜론(람다식( (cookie)->cookie.getValue() )을 간결한 표시로 변경) 
				.orElse(null);
		}
        return token;
    }

}
