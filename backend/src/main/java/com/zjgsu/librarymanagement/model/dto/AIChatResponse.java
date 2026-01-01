package com.zjgsu.librarymanagement.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AIChatResponse {

    private Long id;
    private Long userId;
    private String userMessage;
    private String aiResponse;
    private String conversationId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private String modelUsed;
}