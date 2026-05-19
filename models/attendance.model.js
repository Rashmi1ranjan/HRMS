const db = require("../config/db");

// ==============================
// 🟢 Initialize Tables
// ==============================
exports.initTable = async () => {
  const sqlMaster = `
    CREATE TABLE IF NOT EXISTS attendance_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      company_id INT NOT NULL,
      date DATE NOT NULL,
      status ENUM('Present', 'Absent', 'Half-day', 'Leave', 'WFH') DEFAULT 'Present',
      total_hours DECIMAL(5,2) DEFAULT 0,
      late BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_date (user_id, date),
      INDEX idx_user_date (user_id, date),
      INDEX idx_company_date (company_id, date)
    )
  `;

  const sqlHistory = `
    CREATE TABLE IF NOT EXISTS attendance_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      attendance_id INT NOT NULL,
      type ENUM('punch_in', 'punch_out') NOT NULL,
      punch_time DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attendance_id) REFERENCES attendance_master(id) ON DELETE CASCADE
    )
  `;

  try {
    await db.query(sqlMaster);
    await db.query(sqlHistory);
    console.log("✅ Attendance Master & History tables initialized");
  } catch (err) {
    console.error("❌ Error initializing attendance tables:", err.message);
  }
};

// ==============================
// 🟢 Find Master By User + Date
// ==============================
exports.findMasterByUserAndDate = async (user_id, date) => {
  const sql = `
    SELECT * FROM attendance_master 
    WHERE user_id = ? AND date = ?
  `;
  return db.execute(sql, [user_id, date]);
};

// ==============================
// 🟢 Find Last History for Master
// ==============================
exports.findLastHistory = async (attendance_id) => {
  const sql = `
    SELECT * FROM attendance_history 
    WHERE attendance_id = ? 
    ORDER BY punch_time DESC 
    LIMIT 1
  `;
  return db.execute(sql, [attendance_id]);
};

// ==============================
// 🟢 Create Master Record
// ==============================
exports.createMaster = async (data) => {
  const sql = `
    INSERT INTO attendance_master 
    (user_id, company_id, date, status, late, total_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  return db.execute(sql, [
    data.user_id,
    data.company_id,
    data.date,
    data.status || "Present",
    data.late || false,
    data.total_hours || 0
  ]);
};

// ==============================
// 🟢 Update Master Record
// ==============================
exports.updateMaster = async (id, payload) => {
  const sql = `
    UPDATE attendance_master 
    SET total_hours = ?, status = ?
    WHERE id = ?
  `;
  return db.execute(sql, [
    payload.total_hours,
    payload.status,
    id
  ]);
};

// ==============================
// 🟢 Add to History
// ==============================
exports.addHistory = async (attendance_id, type, punch_time) => {
  const sql = `
    INSERT INTO attendance_history (attendance_id, type, punch_time)
    VALUES (?, ?, ?)
  `;
  return db.execute(sql, [attendance_id, type, punch_time]);
};

// ==============================
// 🟢 Get Master and History Together
// ==============================
exports.getDailyReport = async (user_id, date) => {
  const masterSql = `SELECT * FROM attendance_master WHERE user_id = ? AND date = ?`;
  const [masterRows] = await db.execute(masterSql, [user_id, date]);

  if (masterRows.length === 0) return null;
  
  const attendance_id = masterRows[0].id;
  const historySql = `SELECT type, punch_time FROM attendance_history WHERE attendance_id = ? ORDER BY punch_time ASC`;
  const [historyRows] = await db.execute(historySql, [attendance_id]);

  return {
    master: masterRows[0],
    history: historyRows
  };
};

// ==============================
// 🟢 Monthly Report
// ==============================
exports.getMonthlyReport = async (user_id, year, month) => {
  const sql = `
    SELECT * FROM attendance_master 
    WHERE user_id = ? 
    AND YEAR(date) = ? 
    AND MONTH(date) = ?
    ORDER BY date ASC
  `;
  return db.execute(sql, [user_id, year, month]);
};

// ==============================
// 🟢 History by Master ID
// ==============================
exports.getHistoryByMasterId = async (attendance_id) => {
    const sql = `
        SELECT type, punch_time FROM attendance_history
        WHERE attendance_id = ?
        ORDER BY punch_time ASC
    `;
    return db.execute(sql, [attendance_id]);
}

// ==============================
// 🟢 Company Daily Attendance
// ==============================
exports.getCompanyAttendanceByDate = async (company_id, date) => {
  const sql = `
    SELECT a.*, u.name, u.email 
    FROM attendance_master a
    JOIN users u ON a.user_id = u.id
    WHERE a.company_id = ? 
    AND a.date = ? 
    ORDER BY a.created_at DESC
  `;
  return db.execute(sql, [company_id, date]);
};

// ==============================
// 🟢 Mark Absent Bulk (Optimized)
// ==============================
exports.markAbsentBulk = async (absentData) => {
  if (absentData.length === 0) return;
  const sql = `
    INSERT IGNORE INTO attendance_master 
    (user_id, company_id, date, status, total_hours)
    VALUES ?
  `;
  const values = absentData.map(d => [d.user_id, d.company_id, d.date, d.status, 0]);
  return db.query(sql, [values]);
};
