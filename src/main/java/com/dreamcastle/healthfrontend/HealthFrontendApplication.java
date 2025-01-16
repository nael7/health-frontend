package com.dreamcastle.healthfrontend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

@EnableFeignClients
@ComponentScan(nameGenerator = HealthFrontendBeanNameGenerator.class)
@SpringBootApplication
public class HealthFrontendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HealthFrontendApplication.class, args);
	}

}
