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
    } catch (DataAccessException exception) {
      logger.warn("Could not initialize user status schema: {}", exception.getMessage());
    }
  }
}
