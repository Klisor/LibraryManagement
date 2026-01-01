package com.zjgsu.librarymanagement.service;

import com.zjgsu.librarymanagement.model.dto.AIChatRequest;
import com.zjgsu.librarymanagement.model.dto.AIChatResponse;

import java.util.List;

public interface AIChatService {
    AIChatResponse chatWithAI(AIChatRequest request, Long userId);
    List<AIChatResponse> getChatHistory(Long userId, int limit);
    void clearChatHistory(Long userId);
}