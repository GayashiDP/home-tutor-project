package com.hometutor.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class SchemaInitializer implements ApplicationRunner {
  private static final Logger logger = LoggerFactory.getLogger(SchemaInitializer.class);

  private final JdbcTemplate jdbcTemplate;

  public SchemaInitializer(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public void run(ApplicationArguments args) {
    try {
      jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active'");
      jdbcTemplate.execute("UPDATE users SET status = 'Active' WHERE status IS NULL OR status = '' OR status NOT IN ('Active', 'Suspended')");
      jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check");
      jdbcTemplate.execute(
          "ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('Active', 'Suspended'))");
      jdbcTemplate.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_price NUMERIC(10,2)");
      jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS slip_file_name VARCHAR(255)");
      jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS slip_content_type VARCHAR(120)");
      jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS slip_data BYTEA");
      jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS slip_uploaded_at TIMESTAMPTZ");
      jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL");
      jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ");
      jdbcTemplate.execute("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check");
      jdbcTemplate.execute(
          "ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN ('Pending', 'Paid', 'Completed', 'PendingApproval', 'Rejected', 'Refunded'))");
      jdbcTemplate.execute(
          """
          CREATE TABLE IF NOT EXISTS live_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
            tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(140) NOT NULL,
            description TEXT,
            platform VARCHAR(40) NOT NULL DEFAULT 'Google Meet',
            meeting_link TEXT NOT NULL,
            scheduled_start TIMESTAMPTZ NOT NULL,
            scheduled_end TIMESTAMPTZ NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT live_sessions_time_check CHECK (scheduled_end > scheduled_start),
            CONSTRAINT live_sessions_status_check CHECK (status IN ('Scheduled', 'Live', 'Completed', 'Cancelled'))
          )
          """);
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS title VARCHAR(140) NOT NULL DEFAULT 'Live Lecture'");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS description TEXT");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS platform VARCHAR(40) NOT NULL DEFAULT 'Google Meet'");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS meeting_link TEXT");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Scheduled'");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP");
      jdbcTemplate.execute("UPDATE live_sessions SET meeting_link = '' WHERE meeting_link IS NULL");
      jdbcTemplate.execute("UPDATE live_sessions SET scheduled_start = CURRENT_TIMESTAMP WHERE scheduled_start IS NULL");
      jdbcTemplate.execute("UPDATE live_sessions SET scheduled_end = scheduled_start + INTERVAL '1 hour' WHERE scheduled_end IS NULL OR scheduled_end <= scheduled_start");
      jdbcTemplate.execute("ALTER TABLE live_sessions ALTER COLUMN meeting_link SET NOT NULL");
      jdbcTemplate.execute("ALTER TABLE live_sessions ALTER COLUMN scheduled_start SET NOT NULL");
      jdbcTemplate.execute("ALTER TABLE live_sessions ALTER COLUMN scheduled_end SET NOT NULL");
      jdbcTemplate.execute("ALTER TABLE live_sessions DROP CONSTRAINT IF EXISTS live_sessions_time_check");
      jdbcTemplate.execute("ALTER TABLE live_sessions ADD CONSTRAINT live_sessions_time_check CHECK (scheduled_end > scheduled_start)");
      jdbcTemplate.execute("ALTER TABLE live_sessions DROP CONSTRAINT IF EXISTS live_sessions_status_check");
      jdbcTemplate.execute(
          "ALTER TABLE live_sessions ADD CONSTRAINT live_sessions_status_check CHECK (status IN ('Scheduled', 'Live', 'Completed', 'Cancelled'))");
      jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS live_sessions_booking_id_key ON live_sessions(booking_id)");
      jdbcTemplate.execute(
          "CREATE INDEX IF NOT EXISTS idx_live_sessions_tutor_time ON live_sessions(tutor_id, scheduled_start, scheduled_end)");
      jdbcTemplate.execute(
          "CREATE INDEX IF NOT EXISTS idx_live_sessions_student_time ON live_sessions(student_id, scheduled_start, scheduled_end)");
      jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS reviews_booking_student_unique ON reviews(booking_id, student_id)");
    } catch (DataAccessException exception) {
      logger.warn("Could not initialize user status schema: {}", exception.getMessage());
    }
  }
}
