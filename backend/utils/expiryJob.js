const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const sendEmail = require('./sendEmail');

/**
 * Automates appointment status management.
 * 1. Checks for appointments whose date has passed.
 * 2. Updates status to 'no-show' (Expired).
 * 3. Sends an automated email to the patient to prompt rescheduling.
 */
const scheduleExpiryCheck = () => {
  // Run every hour to keep the system clean
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      
      // Find appointments that are past their date and still in pending/confirmed status
      const expiredAppointments = await Appointment.find({
        date: { $lt: now },
        status: { $in: ['pending', 'confirmed'] }
      }).populate('patient', 'name email').populate('doctor', 'name');

      for (const appt of expiredAppointments) {
        appt.status = 'no-show'; 
        await appt.save();

        if (appt.patient && appt.patient.email) {
          const subject = `Your appointment with ${appt.doctor?.name || 'Doctor'} has expired`;
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
          } catch (err) {
            // Silently fail or log to a file in production
          }
        }
      }
    } catch (error) {
      // Silently handle errors to keep terminal clean
    }
  });
};

module.exports = scheduleExpiryCheck;
