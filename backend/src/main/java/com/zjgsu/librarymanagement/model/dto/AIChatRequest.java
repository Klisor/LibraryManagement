package com.zjgsu.librarymanagement.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIChatRequest {

    @NotBlank(message = "消息内容不能为空")
    private String message;

    private Long bookId;

    private String conversationId;
}