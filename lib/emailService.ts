import nodemailer from 'nodemailer';
import { UpskillPlan, UpskillInputs } from './types';

// Create Gmail transporter
function getEmailTransporter() {
  // Support both GMAIL_* and SMTP_* env variables
  const email = process.env.GMAIL_USER || process.env.SMTP_USER;
  const password = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!email || !password) {
    throw new Error('Email credentials not configured. Set GMAIL_USER + GMAIL_APP_PASSWORD or SMTP_USER + SMTP_PASS in .env.local');
  }

  console.log('[Email] Initializing transport for:', email);

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password.trim(), // Remove spaces from app password
    },
  });
}

// Format plan as HTML email
function formatPlanAsHTML(plan: UpskillPlan, inputs: UpskillInputs, planLink?: string): string {
  const skillsHTML = plan.prioritized_skills
    .map(
      (skill) => `
      <div style="margin-bottom: 15px; padding: 15px; background-color: #EFF6FF; border-left: 4px solid #2563EB; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px;">
          ${skill.priority}. ${skill.skill}
        </h3>
        <p style="margin: 0; color: #4B5563; font-size: 14px;">${skill.reason}</p>
      </div>
    `
    )
    .join('');

  const weeksHTML = plan.week_plan
    .map(
      (week) => `
      <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #E5E7EB; border-radius: 4px;">
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #2563EB; font-size: 14px;">Week ${week.week}</span>
        </div>
        <h4 style="margin: 0 0 8px 0; color: #1F2937; font-size: 15px;">${week.focus}</h4>
        <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">${week.outcome}</p>
        <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 8px; border-radius: 4px;">
          <p style="margin: 0; color: #065F46; font-size: 12px; font-weight: 500;">
            📦 Project: ${week.mini_project}
          </p>
        </div>
      </div>
    `
    )
    .join('');

  const scheduleHTML = plan.weekly_schedule
    .map(
      (schedule) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; font-weight: 500; color: #1F2937;">
          ${schedule.day}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #4B5563;">
          ${schedule.slot}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #4B5563;">
          ${schedule.duration_min} min
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #4B5563;">
          ${schedule.task}
        </td>
      </tr>
    `
    )
    .join('');

  const tipsHTML = plan.burnout_tips
    .map(
      (tip) => `
      <li style="margin-bottom: 8px; color: #4B5563; font-size: 14px;">${tip}</li>
    `
    )
    .join('');

  const actionsHTML = plan.next_actions
    .map(
      (action) => `
      <div style="margin-bottom: 15px; padding: 15px; background-color: #F9FAFB; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #1F2937; font-size: 15px;">${action.title}</h4>
        <p style="margin: 0; color: #6B7280; font-size: 13px;">${action.description}</p>
      </div>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Learning Plan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">
        🎯 Your Personalized AI Learning Plan
      </h1>
      <p style="margin: 10px 0 0 0; color: #DBEAFE; font-size: 16px;">
        Hi ${inputs.fullName}, here's your roadmap to ${inputs.targetGoal}
      </p>
    </div>

    <!-- Summary -->
    <div style="padding: 30px;">
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
          ${plan.summary}
        </p>
      </div>

      ${planLink ? `
      <!-- View Online Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${planLink}" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          📱 View Your Plan Online
        </a>
        <p style="margin: 12px 0 0 0; color: #6B7280; font-size: 13px;">
          Access your plan on any device with this link
        </p>
      </div>
      ` : ''}

      <!-- Priority Skills -->
      <h2 style="color: #1F2937; font-size: 22px; margin: 0 0 20px 0; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">
        🎯 Top 5 Priority Skills
      </h2>
      ${skillsHTML}

      <!-- 12-Week Roadmap -->
      <h2 style="color: #1F2937; font-size: 22px; margin: 30px 0 20px 0; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">
        📅 12-Week Learning Roadmap
      </h2>
      ${weeksHTML}

      <!-- Weekly Schedule -->
      <h2 style="color: #1F2937; font-size: 22px; margin: 30px 0 20px 0; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">
        🗓️ Your Weekly Study Schedule
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #E5E7EB; border-radius: 8px;">
        <thead>
          <tr style="background-color: #F3F4F6;">
            <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; border-bottom: 2px solid #D1D5DB;">Day</th>
            <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; border-bottom: 2px solid #D1D5DB;">Time</th>
            <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; border-bottom: 2px solid #D1D5DB;">Duration</th>
            <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; border-bottom: 2px solid #D1D5DB;">Task</th>
          </tr>
        </thead>
        <tbody>
          ${scheduleHTML}
        </tbody>
      </table>

      <!-- Burnout Prevention -->
      <h2 style="color: #1F2937; font-size: 22px; margin: 30px 0 20px 0; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">
        🛡️ Burnout Prevention Tips
      </h2>
      <ul style="padding-left: 20px; margin: 0 0 30px 0;">
        ${tipsHTML}
      </ul>

      <!-- Next Actions -->
      <h2 style="color: #1F2937; font-size: 22px; margin: 30px 0 20px 0; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">
        🚀 Next Actions
      </h2>
      ${actionsHTML}
    </div>

    <!-- Footer -->
    <div style="background-color: #F3F4F6; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
        You received this email because you requested your personalized learning plan.
      </p>
      <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
        © ${new Date().getFullYear()} AI Upskill Planner. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

// Send plan via email
export async function sendPlanEmail(
  recipientEmail: string,
  plan: UpskillPlan,
  inputs: UpskillInputs,
  planToken?: string
): Promise<void> {
  const transporter = getEmailTransporter();
  
  // Build plan link if token provided
  const planLink = planToken 
    ? `${process.env.APP_BASE_URL}/p/${planToken}` 
    : undefined;
  
  const htmlContent = formatPlanAsHTML(plan, inputs, planLink);

  const mailOptions = {
    from: `"AI Upskill Planner" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `🎯 Your Personalized Learning Plan - ${inputs.targetGoal}`,
    html: htmlContent,
  };

  console.log('[Email] Sending email to:', recipientEmail);
  if (planLink) {
    console.log('[Email] Plan link:', planLink);
  }
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Email sent successfully. Message ID:', info.messageId);
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    throw error;
  }
}
