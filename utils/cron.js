const cron = require('node-cron');
const moment = require('moment-timezone');
const db = require('../config/db');
const AttendanceModel = require('../models/attendance.model');
const emailService = require('../Service/email.service');
const logger = require('../utils/logger');

// Initialize Cron Jobs
exports.initCronJobs = () => {
    // Run every day at 23:59
    cron.schedule('59 23 * * *', async () => {
        try {
            logger.info("Running Absent Marker Cron Job...");
            const now = moment().tz("Asia/Kolkata");
            const today = now.format('YYYY-MM-DD');
            const checkInTime = `${today} 00:00:00`;

            const sql = `
                SELECT u.id, u.company_id, u.email, u.name 
                FROM users u 
                LEFT JOIN attendance_master a ON u.id = a.user_id AND a.date = ?
                WHERE a.id IS NULL AND u.deleted_at IS NULL AND u.status = 1
            `;
            const [absentUsers] = await db.query(sql, [today]);

            // Bulk Insert Optimized Logic
            const absentData = absentUsers.map(user => ({
                user_id: user.id,
                company_id: user.company_id,
                date: today,
                check_in: checkInTime,
                status: 'Absent'
            }));

            await AttendanceModel.markAbsentBulk(absentData);

            // Sending Emails
            for (const user of absentUsers) {
                if (user.email) {
                    await emailService.sendAbsentNotification(user.email, user.name, today);
                }
            }

            logger.info(`Cron completed. Marked ${absentUsers.length} users absent.`);
        } catch (error) {
            logger.error("Cron Job Error:", { error: error.message });
        }
    });
    logger.info("Cron jobs initialized.");
};
