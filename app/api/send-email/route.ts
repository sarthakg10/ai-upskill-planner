import { NextRequest, NextResponse } from 'next/server';
import { loadPlan } from '@/lib/storage';
import nodemailer from 'nodemailer';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const plan = loadPlan();
    if (!plan) {
      return NextResponse.json(
        { error: 'No plan found' },
        { status: 400 }
      );
    }

    // Format plan data for email
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; }
    .section { margin: 25px 0; }
    .section h3 { color: #667eea; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .week { margin: 15px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #667eea; border-radius: 4px; }
    .week h4 { margin: 0 0 10px 0; color: #667eea; font-size: 16px; }
    .week p { margin: 5px 0; font-size: 14px; }
    .skill { display: inline-block; background: #667eea; color: white; padding: 5px 10px; margin: 5px 5px 5px 0; border-radius: 20px; font-size: 12px; }
    .info-box { background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .info-box strong { color: #667eea; }
    .cta { display: inline-block; background: #667eea; color: white; padding: 12px 30px; margin-top: 20px; border-radius: 5px; text-decoration: none; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    .tip { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 10px 0; border-radius: 4px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Your Personalized Learning Plan</h1>
      <p>Your ${plan.target_role || 'Career'} Transformation Starts Here!</p>
    </div>

    <div class="content">
      <p>Hello! 👋</p>
      <p>Your 12-week personalized learning plan is ready. Here's your complete roadmap to transform your career:</p>

      <div class="section">
        <h3>📝 Plan Overview</h3>
        <div class="info-box">
          <p><strong>Current Role:</strong> ${plan.current_role || 'Not specified'}</p>
          <p><strong>Target Role:</strong> ${plan.target_role || 'Not specified'}</p>
          <p><strong>Weekly Hours:</strong> ${plan.weekly_hours || 5} hours</p>
        </div>
        <p><strong>Your Journey:</strong></p>
        <p>"${plan.summary}"</p>
      </div>

      <div class="section">
        <h3>🎯 Priority Skills (Top 5)</h3>
        ${plan.prioritized_skills.map((skill: any) => `
          <div style="margin: 12px 0; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <strong style="color: #667eea;">P${skill.priority}. ${skill.skill}</strong><br>
            <small>${skill.reason}</small>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h3>📅 12-Week Learning Path</h3>
        ${plan.week_plan.map((week: any) => `
          <div class="week">
            <h4>📌 Week ${week.week}: ${week.focus}</h4>
            <p><strong>Outcome:</strong> ${week.outcome}</p>
            <p><strong>Build:</strong> ${week.mini_project}</p>
            ${week.topics && week.topics.length > 0 ? `
              <p><strong>Topics:</strong></p>
              <div>
                ${week.topics.slice(0, 3).map((topic: any) => `<span class="skill">${topic.title}</span>`).join('')}
                ${week.topics.length > 3 ? `<span class="skill">+${week.topics.length - 3} more</span>` : ''}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h3>🗓️ Weekly Schedule Example</h3>
        ${plan.weekly_schedule.slice(0, 3).map((schedule: any) => `
          <div class="info-box">
            <strong>${schedule.day}</strong><br>
            ${schedule.slot} | ${schedule.duration_min} min<br>
            ${schedule.task}
          </div>
        `).join('')}
        <p style="font-size: 13px; color: #666;"><em>Full schedule available in your dashboard</em></p>
      </div>

      <div class="section">
        <h3>💪 Burnout Prevention Tips</h3>
        ${plan.burnout_tips.slice(0, 3).map((tip: any) => `
          <div class="tip">✓ ${tip}</div>
        `).join('')}
      </div>

      <div class="section">
        <h3>🎓 Next Steps</h3>
        <ol style="padding-left: 20px;">
          <li>Log in to your dashboard to start tracking progress</li>
          <li>Complete your first week of learning (${plan.weekly_schedule?.[0]?.task || 'Start with fundamentals'})</li>
          <li>Build your first mini-project</li>
          <li>Share your progress and unlock premium features</li>
        </ol>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.APP_BASE_URL}/plan" class="cta">View Full Plan →</a>
      </div>

      <div class="footer">
        <p>Questions? Reply to this email or visit our help center.</p>
        <p>You're receiving this because you requested your learning plan.</p>
        <p>&copy; 2026 AI Upskill Planner. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `🚀 Your ${plan.target_role || 'AI/ML'} 12-Week Learning Plan is Ready!`,
      html: emailHTML,
      text: `Your ${plan.target_role} learning plan is ready. Log in to view the full plan at ${process.env.APP_BASE_URL}/plan`,
    });

    console.log(`Email sent successfully to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Plan sent to your email successfully!',
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}
