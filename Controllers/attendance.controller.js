const AttendanceModel = require("../models/attendance.model");
const moment = require("moment-timezone");
const logger = require("../utils/logger");

// ==============================
// 🤜 GET PUNCH ENDPOINT 
// POST /api/attendance/punch
// ==============================
exports.punch = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const companyId = req.user.company_id || req.company?.id;

    const now = moment().tz("Asia/Kolkata");
    const today = now.format("YYYY-MM-DD");
    const currentTime = now.format("YYYY-MM-DD HH:mm:ss");

    // Check if master record exists for today
    const [existingMasterRows] = await AttendanceModel.findMasterByUserAndDate(userId, today);
    let masterRecord = null;
    let isNewMaster = false;

    if (existingMasterRows.length === 0) {
      // Create master record on first punch of the day
      const limitSetting = process.env.CHECKIN_TIME || "10:00:00";
      const checkInLimit = moment.tz(`${today} ${limitSetting}`, "YYYY-MM-DD HH:mm:ss", "Asia/Kolkata");
      const isLate = now.isAfter(checkInLimit);

      const [insertResult] = await AttendanceModel.createMaster({
        user_id: userId,
        company_id: companyId,
        date: today,
        late: isLate,
        status: "Absent", // Start as absent, will become Half-day/Present upon punch out.
        total_hours: 0,
      });


      // Refetch to get the full record
      const [newMasterRows] = await AttendanceModel.findMasterByUserAndDate(userId, today);
      masterRecord = newMasterRows[0];
      isNewMaster = true;
    } else {
      masterRecord = existingMasterRows[0];
    }

    const attendanceId = masterRecord.id;

    const action = req.body.action; // should be 'punch_in' or 'punch_out'
    if (!action || (action !== "punch_in" && action !== "punch_out")) {
        return res.status(400).json({ success: false, message: "Please provide a valid action ('punch_in' or 'punch_out') in the request body." });
    }

    // Check last history punch
    const [historyRows] = await AttendanceModel.findLastHistory(attendanceId);
    const lastPunch = historyRows.length > 0 ? historyRows[0] : null;

    // Strict Validations
    if (action === "punch_in") {
        if (lastPunch && lastPunch.type === "punch_in") {
            return res.status(400).json({ success: false, message: "Already punched in. Please punch out first." });
        }
    } else if (action === "punch_out") {
        if (!lastPunch || lastPunch.type === "punch_out") {
            return res.status(400).json({ success: false, message: "Cannot punch out. You must punch in first." });
        }
    }

    const newPunchType = action;

    // Add new punch to history
    await AttendanceModel.addHistory(attendanceId, newPunchType, currentTime);

    // If this was a punch out, update the master record's total hours and status
    let updatedTotalHours = parseFloat(masterRecord.total_hours);
    let updatedStatus = masterRecord.status;

    if (newPunchType === "punch_out" && lastPunch) {
        const lastPunchTime = moment.tz(lastPunch.punch_time, "Asia/Kolkata");
        const currentPunchTime = moment.tz(currentTime, "Asia/Kolkata");
        const duration = moment.duration(currentPunchTime.diff(lastPunchTime));
        
        // Add duration in hours to existing total hours
        const sessionHours = duration.asHours();
        updatedTotalHours += sessionHours;
        updatedTotalHours = parseFloat(updatedTotalHours.toFixed(2));

        // Calculate Status based on Total Hours
        if (updatedTotalHours < 4) {
            updatedStatus = 'Absent';
        } else if (updatedTotalHours < 8) {
            updatedStatus = 'Half-day';
        } else {
            updatedStatus = 'Present';
        }

        // Update the Master Record in Database
        await AttendanceModel.updateMaster(attendanceId, {
            total_hours: updatedTotalHours,
            status: updatedStatus
        });
    }

    // Get the Daily Report to send back the complete history and count
    const dailyReport = await AttendanceModel.getDailyReport(userId, today);
    const punchCount = dailyReport.history.length;
    const isPunchedIn = newPunchType === "punch_in";

    logger.info(`User ${newPunchType}`, { userId, date: today });

    return res.status(200).json({
        success: true,
        message: `Successfully ${newPunchType === 'punch_in' ? 'Punched In' : 'Punched Out'}`,
        data: {
          punch_action: newPunchType,
          punch_time: currentTime,
          is_currently_punched_in: isPunchedIn,
          today_total_hours: updatedTotalHours,
          today_status: updatedStatus,
          punch_count: punchCount,
          history: dailyReport.history
        }
      });

  } catch (error) {
    logger.error("Punch error:", { error: error.message });
    res.status(500).json({ success: false, message: "Internal server error", data: {} });
  }
};


// ==============================
// 📊 GET REPORT
// GET /api/attendance/report/:userId
// ==============================
exports.getReport = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (!targetUserId) {
        return res.status(400).json({ success: false, message: "User ID is required", data: {} });
    }

    const now = moment().tz("Asia/Kolkata");
    const year = req.query.year || now.year();
    const month = req.query.month || (now.month() + 1);

    const [masterRecords] = await AttendanceModel.getMonthlyReport(targetUserId, year, month);

    const summary = {
      presentDays: 0,
      absentDays: 0,
      halfDays: 0,
      lateDays: 0,
      totalWorkingHours: 0,
      totalOvertimeHours: 0
    };

    // Enrich master records with history
    const populatedRecords = [];

    for (let r of masterRecords) {
      if (r.status === 'Present') summary.presentDays++;
      if (r.status === 'Absent') summary.absentDays++;
      if (r.status === 'Half-day') summary.halfDays++;
      if (r.late) summary.lateDays++;
      
      const hours = parseFloat(r.total_hours) || 0;
      summary.totalWorkingHours += hours;
      
      // Calculate overtime (if hours > 9)
      if (hours > 9) {
          summary.totalOvertimeHours += (hours - 9);
      }

      // Fetch history for this record
      const [historyRows] = await AttendanceModel.getHistoryByMasterId(r.id);
      
      populatedRecords.push({
          ...r,
          history: historyRows,
          punch_count: historyRows.length
      });
    }
    
    // Formatting Overtime
    summary.totalOvertimeHours = parseFloat(summary.totalOvertimeHours.toFixed(2));
    summary.totalWorkingHours = parseFloat(summary.totalWorkingHours.toFixed(2));

    return res.status(200).json({
      success: true,
      message: "Report generated successfully",
      data: {
        summary,
        records: populatedRecords
      }
    });

  } catch (error) {
    logger.error("Report extraction error:", { error: error.message });
    res.status(500).json({ success: false, message: "Internal server error", data: {} });
  }
};

// ==============================
// 🏢 Company Daily Attendance (Admin / HR / Manager)
// GET /api/attendance/company?date=2026-04-22
// ==============================
exports.getCompanyAttendance = async (req, res) => {
  try {
    const companyId = req.user.company_id || req.company?.id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company ID not found in token", data: {} });
    }

    const now = moment().tz("Asia/Kolkata");
    const date = req.query.date || now.format("YYYY-MM-DD");

    const [masterRecords] = await AttendanceModel.getCompanyAttendanceByDate(companyId, date);

    const summary = {
      totalEmployeesWithPunches: masterRecords.length,
      present: masterRecords.filter(r => r.status === "Present").length,
      absent: masterRecords.filter(r => r.status === "Absent").length,
      halfDay: masterRecords.filter(r => r.status === "Half-day").length,
      late: masterRecords.filter(r => r.late).length,
    };

    // Enrich with history
    const populatedRecords = [];
    for (let r of masterRecords) {
         // Fetch history for this record
      const [historyRows] = await AttendanceModel.getHistoryByMasterId(r.id);
      
      populatedRecords.push({
          id: r.id,
          user_id: r.user_id,
          name: r.name,
          email: r.email,
          date: r.date,
          status: r.status,
          total_hours: r.total_hours,
          late: r.late,
          punch_count: historyRows.length,
          history: historyRows
      });
    }

    return res.status(200).json({
      success: true,
      message: `Attendance report for ${date}`,
      data: {
        date,
        summary,
        records: populatedRecords
      }
    });

  } catch (error) {
    logger.error("Company attendance fetch error:", { error: error.message });
    res.status(500).json({ success: false, message: "Internal server error", data: {} });
  }
};
