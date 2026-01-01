package com.zjgsu.librarymanagement.controller;

import com.zjgsu.librarymanagement.model.dto.AIChatRequest;
import com.zjgsu.librarymanagement.model.dto.AIChatResponse;
import com.zjgsu.librarymanagement.response.ApiResponse;
import com.zjgsu.librarymanagement.service.AIChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIChatService aiChatService;

    /**
     * AI对话接口（公开测试，无需token）
     */
    @PostMapping("/chat")
    public ApiResponse<AIChatResponse> chatWithAI(
            @Valid @RequestBody AIChatRequest chatRequest) {

        try {
            log.info("收到AI聊天请求: {}", chatRequest.getMessage());

            // 使用默认用户ID 1
            Long userId = 1L;

            // 调用AI服务
            AIChatResponse response = aiChatService.chatWithAI(chatRequest, userId);

            return ApiResponse.success("AI回复成功", response);
        } catch (Exception e) {
            log.error("AI对话处理失败", e);
            return ApiResponse.error("AI服务处理失败: " + e.getMessage());
        }
    }
    @GetMapping("/test")
    public String test(){
        return "ue";
    }
    /**
     * 获取对话历史（测试用，无需token）
     */
    @GetMapping("/history")
    public ApiResponse<List<AIChatResponse>> getChatHistory(
            @RequestParam(defaultValue = "10") int limit) {

        try {
            // 使用默认用户ID 1
            Long userId = 1L;
            List<AIChatResponse> history = aiChatService.getChatHistory(userId, limit);
            return ApiResponse.success("获取历史成功", history);
        } catch (Exception e) {
            log.error("获取历史失败", e);
            return ApiResponse.error("获取历史失败");
        }
    }

    /**
     * 清除对话历史（测试用，无需token）
     */
    @DeleteMapping("/history")
    public ApiResponse<Void> clearChatHistory() {

        try {
            // 使用默认用户ID 1
            Long userId = 1L;
            aiChatService.clearChatHistory(userId);
            return ApiResponse.success("清除历史成功", null);
        } catch (Exception e) {
            log.error("清除历史失败", e);
            return ApiResponse.error("清除历史失败");
        }
    }
}