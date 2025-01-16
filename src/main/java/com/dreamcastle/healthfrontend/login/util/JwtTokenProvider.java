package com.dreamcastle.healthfrontend.login.util;

import java.util.Base64;
import java.util.Date;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.dreamcastle.healthfrontend.login.dto.UserDto;
import com.dreamcastle.healthfrontend.response.exception.UnathorizedException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.extern.slf4j.Slf4j;



@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.header}")
    private String header;

    /**
     * 초기화
     * 생성자가 호출되는 시점은 빈이 초기화되기전 이므로 @postconstruct 사용하여 딱한번만 초기화
     * SecretKey Base64로 인코딩 초기화
     */
    @PostConstruct  //DI 이후 실행되는 초기화 어노테이션 
    protected void init() {
        secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes()); 
    }

    
    /**
	 * token validation
     * 예외가 발생하면 AuthenticationEntryPoint
	 * @param token
	 * @return
	 */
	public boolean validateToken(String token) {
		
		try {
            Jws<Claims> claims = Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);

            return !claims.getBody().getExpiration().before(new Date());
        } catch (SecurityException | MalformedJwtException | IllegalArgumentException | SignatureException exception) {
            log.info("잘못된 Jwt 토큰입니다");
        } catch (ExpiredJwtException exception) {
            log.info("만료된 Jwt 토큰입니다");
        } catch (UnsupportedJwtException exception) {
            log.info("지원하지 않는 Jwt 토큰입니다");
        }
		
		return false;
	}
    /**
     * 토큰정보로 사용자 정보 반환
     * 아이디, 권한롤, 이름
     */
    public UserDto getUserInfoByToken(String token){

        //토큰 유효성 체크
        if(!validateToken(token)){
            //로그인 오류발생
            throw new UnathorizedException();
        }

        UserDto userInfo = new UserDto();

        String id = Jwts.parser()
                            .setSigningKey(secretKey)
                            .parseClaimsJws(token)
                            .getBody()
                            .getSubject();
        String role = Jwts.parser()
                            .setSigningKey(secretKey)
                            .parseClaimsJws(token)
                            .getBody()
                            .get("role").toString();
        String name = Jwts.parser()
                            .setSigningKey(secretKey)
                            .parseClaimsJws(token)
                            .getBody()
                            .get("name").toString();
        
        String tel = Jwts.parser()
                            .setSigningKey(secretKey)
                            .parseClaimsJws(token)
                            .getBody()
                            .get("tel").toString();

        String entdt = Jwts.parser()
                            .setSigningKey(secretKey)
                            .parseClaimsJws(token)
                            .getBody()
                            .get("entdt").toString();
        
        String jan = Jwts.parser()
                        .setSigningKey(secretKey)
                        .parseClaimsJws(token)
                        .getBody()
                        .get("jan").toString();
        
        String no = Jwts.parser()
                        .setSigningKey(secretKey)
                        .parseClaimsJws(token)
                        .getBody()
                        .get("no").toString();

        
        userInfo.setUserId(id);
        userInfo.setRole(role);
        userInfo.setTel(tel);
        userInfo.setUsername(name);
        userInfo.setEntdt(entdt);
        userInfo.setJan(jan);
        userInfo.setNo(no);

        return userInfo;
    }


}
