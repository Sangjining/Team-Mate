package com.teammate.backend.task.dto;

public class TaskProgressResponse {

    private long totalTasks;
    private long completedTasks;
    private int progress;

    public TaskProgressResponse(
            long totalTasks,
            long completedTasks,
            int progress
    ) {
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.progress = progress;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public int getProgress() {
        return progress;
    }
}