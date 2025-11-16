-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    start_date_time VARCHAR(100) NOT NULL,
    end_date_time VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedules_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedules_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedules_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX idx_schedules_event_id ON schedules(event_id);
CREATE INDEX idx_schedules_task_id ON schedules(task_id);
CREATE INDEX idx_schedules_member_id ON schedules(member_id);
CREATE INDEX idx_schedules_start_date_time ON schedules(start_date_time);

