const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const sendEmail = require('./sendEmail');

const scheduleExpiryCheck = () => {
  // Run every minute for immediate check
  cron.schedule('* * * * *', async () => {
    console.log('[ExpiryJob] Running hourly appointment expiry check...');
    try {
      const now = new Date();
      
      // Find appointments that are past their date, and not completed/cancelled/expired
      // Also ensure we only pick up those that are 'pending' or 'confirmed'
      const expiredAppointments = await Appointment.find({
        date: { $lt: now },
        status: { $in: ['pending', 'confirmed'] }
      }).populate('patient', 'name email').populate('doctor', 'name');

      for (const appt of expiredAppointments) {
        appt.status = 'no-show'; // Using no-show as the internal state for expired/missed
        await appt.save();

        // Send Reschedule Email
        if (appt.patient && appt.patient.email) {
          const subject = `Your appointment with Dr. ${appt.doctor?.name || 'Doctor'} has expired`;
          const message = `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">Appointment Expired</h2>
              <p>Hello <strong>${appt.patient.name}</strong>,</p>
              <p>Your appointment scheduled for <strong>${new Date(appt.date).toLocaleDateString()} at ${appt.timeSlot}</strong> has passed without being completed.</p>
              
              <div style="background: #f5f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 20px 0;">
                <p style="margin: 0;">Don't worry! You can easily <strong>reschedule</strong> this appointment from your dashboard to pick a new time that works for you.</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/patient/appointments" 
                   style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                   Reschedule Now
                </a>
              </div>
              
              <p style="margin-top: 30px; font-size: 13px; color: #666;">This is an automated notification from MediMeet Healthcare.</p>
              <hr style="border: 0; border-top: 1px solid #eee;" />
              <p style="text-align: center; font-weight: bold; color: #0f172a;">MediMeet Healthcare</p>
            </div>
          `;

          try {
            await sendEmail({ email: appt.patient.email, subject, message });
            console.log(`[ExpiryJob] Expiry email sent to ${appt.patient.email} for appt ${appt._id}`);
          } catch (err) {
            console.error(`[ExpiryJob] Failed to send email to ${appt.patient.email}:`, err.message);
          }
        }
      }

      if (expiredAppointments.length > 0) {
        console.log(`[ExpiryJob] Processed ${expiredAppointments.length} expired appointments.`);
      }
    } catch (error) {
      console.error('[ExpiryJob] Error during expiry check:', error.message);
    }
  });
};

module.exports = scheduleExpiryCheck;
