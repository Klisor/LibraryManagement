package com.zjgsu.librarymanagement.service.impl;

import com.volcengine.ark.runtime.model.bot.completion.chat.BotChatCompletionRequest;
import com.volcengine.ark.runtime.model.bot.completion.chat.BotChatCompletionResult;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessage;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessageRole;
import com.volcengine.ark.runtime.service.ArkService;
import com.zjgsu.librarymanagement.model.dto.AIChatRequest;
import com.zjgsu.librarymanagement.model.dto.AIChatResponse;
import com.zjgsu.librarymanagement.service.AIChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIChatServiceImpl implements AIChatService {

    private final Map<Long, List<AIChatResponse>> chatHistory = new HashMap<>();

    @Value("${ai.botId:bot-20251212101211-mxjmz}")
    private String botId;

    private final ArkService arkService;

    @Override
    public AIChatResponse chatWithAI(AIChatRequest request, Long userId) {
        try {
            log.info("用户 {} 发送消息: {}", userId, request.getMessage());

            String aiResponse = callVolcanoBotAPI(request.getMessage());

            AIChatResponse response = createResponse(request, userId, aiResponse, "volcano-ark");

            saveToHistory(userId, response);

            log.info("AI回复成功");
            return response;

        } catch (Exception e) {
            log.error("AI对话处理失败，使用模拟回复", e);
            return createMockResponse(request, userId);
        }
    }

    /**
     * 使用SDK的正确方式调用火山方舟Bot API
     */
    private String callVolcanoBotAPI(String userMessage) {
        try {
            log.info("调用火山方舟Bot API，botId: {}", botId);

            // 构建消息列表
            List<ChatMessage> messages = new ArrayList<>();

            // 系统消息
            ChatMessage systemMessage = ChatMessage.builder()
                    .role(ChatMessageRole.SYSTEM)
                    .content("你是一个专业的图书管理员助手，帮助用户解答图书相关问题。请用中文回答，回答要简洁、准确、有帮助。")
                    .build();
            messages.add(systemMessage);

            // 用户消息
            ChatMessage userChatMessage = ChatMessage.builder()
                    .role(ChatMessageRole.USER)
                    .content(userMessage)
                    .build();
            messages.add(userChatMessage);

            // 构建Bot请求 - 这是关键！
            BotChatCompletionRequest chatCompletionRequest = BotChatCompletionRequest.builder()
                    .botId(botId)  // 使用botId，不是model
                    .messages(messages)
                    .build();

            log.info("发送BotChatCompletionRequest: {}", chatCompletionRequest);

            // 发送请求
            BotChatCompletionResult result = arkService.createBotChatCompletion(chatCompletionRequest);

            log.info("收到BotChatCompletionResult: {}", result);

            if (result != null &&
                    result.getChoices() != null &&
                    !result.getChoices().isEmpty()) {

                String content = (String) result.getChoices().get(0).getMessage().getContent();
                log.info("AI回复内容长度: {}", content.length());
                return content;
            }

            throw new RuntimeException("API响应为空");

        } catch (Exception e) {
            log.error("调用火山方舟Bot API失败", e);
            throw new RuntimeException("AI服务调用失败: " + e.getMessage());
        }
    }

    /**
     * 创建响应对象
     */
    private AIChatResponse createResponse(AIChatRequest request, Long userId, String aiResponse, String model) {
        AIChatResponse response = new AIChatResponse();
        response.setId(System.currentTimeMillis());
        response.setUserId(userId);
        response.setUserMessage(request.getMessage());
        response.setAiResponse(aiResponse);
        response.setConversationId(request.getConversationId());
        response.setCreatedAt(LocalDateTime.now());
        response.setModelUsed(model);
        return response;
    }

    /**
     * 创建模拟响应
     */
    private AIChatResponse createMockResponse(AIChatRequest request, Long userId) {
        String mockResponse = generateSmartResponse(request.getMessage());
        return createResponse(request, userId, mockResponse, "smart-mock");
    }

    /**
     * 生成智能模拟响应
     */
    private String generateSmartResponse(String userMessage) {
        String lowerMsg = userMessage.toLowerCase();

        if (containsAny(lowerMsg, "你好", "hello", "hi")) {
            return "您好！我是图书管理员助手，很高兴为您服务！请问您需要什么帮助？";
        }

        if (containsAny(lowerMsg, "在哪里", "位置")) {
            return "您可以通过以下方式查找图书：\n" +
                    "1. 按分类查找（文学区、科技区等）\n" +
                    "2. 使用图书馆检索系统\n" +
                    "3. 咨询前台工作人员";
        }

        return "收到您的查询：" + userMessage + "\n\n" +
                "我是图书管理员助手，可以帮您解答图书相关问题。";
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private void saveToHistory(Long userId, AIChatResponse response) {
        List<AIChatResponse> history = chatHistory.getOrDefault(userId, new ArrayList<>());
        history.add(response);
        chatHistory.put(userId, history);

        if (history.size() > 50) {
            history = history.subList(history.size() - 50, history.size());
            chatHistory.put(userId, history);
        }
    }

    @Override
    public List<AIChatResponse> getChatHistory(Long userId, int limit) {
        List<AIChatResponse> history = chatHistory.getOrDefault(userId, new ArrayList<>());
        int start = Math.max(0, history.size() - limit);
        return history.subList(start, history.size());
    }

    @Override
    public void clearChatHistory(Long userId) {
        chatHistory.remove(userId);
    }
}