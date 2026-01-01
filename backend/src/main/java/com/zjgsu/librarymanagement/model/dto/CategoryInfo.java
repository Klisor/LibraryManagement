package com.zjgsu.librarymanagement.model.dto;

public class CategoryInfo {
    private int id;
    private String name;
    private long bookCount;
    private long borrowedCount;

    public CategoryInfo(int id, String name, long bookCount, long borrowedCount) {
        this.id = id;
        this.name = name;
        this.bookCount = bookCount;
        this.borrowedCount = borrowedCount;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getBookCount() {
        return bookCount;
    }

    public void setBookCount(long bookCount) {
        this.bookCount = bookCount;
    }

    public long getBorrowedCount() {
        return borrowedCount;
    }

    public void setBorrowedCount(long borrowedCount) {
        this.borrowedCount = borrowedCount;
    }
}