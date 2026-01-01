package com.zjgsu.librarymanagement.config;

import com.volcengine.ark.runtime.service.ArkService;
//import com.volcengine.ark.runtime.service.ark.ArkServiceBuilder;
import okhttp3.ConnectionPool;
import okhttp3.Dispatcher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class AiConfig {

    @Value("${ai.apiKey:a4e45feb-0218-4cc0-839b-ef7dc33d03d2}")
    private String apiKey;

    @Value("${ai.baseUrl:https://ark.cn-beijing.volces.com/api/v3/}")
    private String baseUrl;

    @Bean
    public ArkService arkService() {
        ConnectionPool connectionPool = new ConnectionPool(5, 1, TimeUnit.SECONDS);
        Dispatcher dispatcher = new Dispatcher();

        return ArkService.builder()
                .dispatcher(dispatcher)
                .connectionPool(connectionPool)
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .build();
    }
}