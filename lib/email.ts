/**
 * Email Service
 * Uses Resend (easier than SendGrid for Next.js)
 * Install: npm install resend
 * Get API key from: https://resend.com
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail({ to, subject, html, replyTo }: EmailParams) {
  try {
    const result = await resend.emails.send({
      from: 'noreply@ideabusiness.com',
      to,
      subject,
      html,
      replyTo: replyTo || 'support@ideabusiness.com',
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email verification
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const html = `
    <h2>تحقق من عنوان بريدك الإلكتروني</h2>
    <p>شكراً لتسجيلك في IDEA BUSINESS</p>
    <p><a href="${verificationUrl}" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">تحقق من بريدك</a></p>
    <p>هذا الرابط صالح لمدة 24 ساعة</p>
  `;

  return sendEmail({
    to: email,
    subject: 'تحقق من عنوان بريدك الإلكتروني - IDEA BUSINESS',
    html,
  });
}

/**
 * Password reset email
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
    <h2>إعادة تعيين كلمة المرور</h2>
    <p>تم طلب إعادة تعيين كلمة المرور لحسابك</p>
    <p><a href="${resetUrl}" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">إعادة تعيين كلمة المرور</a></p>
    <p>هذا الرابط صالح لمدة 1 ساعة</p>
    <p>إذا لم تطلب هذا، تجاهل هذا البريد</p>
  `;

  return sendEmail({
    to: email,
    subject: 'إعادة تعيين كلمة المرور - IDEA BUSINESS',
    html,
  });
}

/**
 * Investment confirmation email
 */
export async function sendInvestmentConfirmationEmail(
  email: string,
  investorName: string,
  projectTitle: string,
  amount: number,
  invoiceUrl: string
) {
  const html = `
    <h2>تم تأكيد استثمارك</h2>
    <p>مرحباً ${investorName}،</p>
    <p>تم تأكيد استثمارك بنجاح في المشروع <strong>${projectTitle}</strong></p>
    <p><strong>المبلغ:</strong> ${amount.toLocaleString()} ريال</p>
    <p><a href="${invoiceUrl}" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">عرض الفاتورة</a></p>
    <p>يمكنك تتبع استثمارك في <a href="https://ideabusiness.com/portfolio">محفظتك</a></p>
  `;

  return sendEmail({
    to: email,
    subject: 'تم تأكيد استثمارك - IDEA BUSINESS',
    html,
  });
}

/**
 * Founder payout notification
 */
export async function sendPayoutNotificationEmail(
  email: string,
  founderName: string,
  amount: number,
  arrivalDate?: Date
) {
  const html = `
    <h2>تم بدء تحويل الأموال</h2>
    <p>مرحباً ${founderName}،</p>
    <p>تم بدء تحويل <strong>${amount.toLocaleString()} ريال</strong> إلى حسابك البنكي</p>
    ${arrivalDate ? `<p><strong>تاريخ الوصول المتوقع:</strong> ${new Date(arrivalDate).toLocaleDateString('ar')}</p>` : ''}
    <p>قد يستغرق التحويل 1-3 أيام عمل</p>
    <p>يمكنك تتبع حالة التحويل في <a href="https://ideabusiness.com/dashboard/founder">لوحة التحكم</a></p>
  `;

  return sendEmail({
    to: email,
    subject: 'تم بدء تحويل الأموال - IDEA BUSINESS',
    html,
  });
}

/**
 * KYC status update email
 */
export async function sendKYCStatusEmail(
  email: string,
  userName: string,
  approved: boolean,
  rejectionReason?: string
) {
  const html = approved
    ? `
      <h2>تم الموافقة على التحقق من الهوية</h2>
      <p>مرحباً ${userName}،</p>
      <p>تهانينا! تم الموافقة على طلب التحقق من الهوية</p>
      <p>يمكنك الآن الاستثمار في المشاريع المتاحة</p>
      <p><a href="https://ideabusiness.com/discover" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">استكشف المشاريع</a></p>
    `
    : `
      <h2>لم يتم قبول طلب التحقق</h2>
      <p>مرحباً ${userName}،</p>
      <p>للأسف، لم يتم الموافقة على طلب التحقق من الهوية</p>
      <p><strong>السبب:</strong> ${rejectionReason || 'بيانات غير صحيحة'}</p>
      <p><a href="https://ideabusiness.com/kyc" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">حاول مرة أخرى</a></p>
    `;

  return sendEmail({
    to: email,
    subject: approved
      ? 'تم الموافقة على التحقق من الهوية - IDEA BUSINESS'
      : 'لم يتم قبول طلب التحقق - IDEA BUSINESS',
    html,
  });
}

/**
 * Project milestone notification
 */
export async function sendProjectMilestoneEmail(
  email: string,
  founderName: string,
  projectTitle: string,
  milestoneType: 'funding_goal_reached' | 'half_funded' | 'new_investor',
  details?: Record<string, any>
) {
  const titles: Record<string, string> = {
    funding_goal_reached: 'تم الوصول إلى هدف التمويل!',
    half_funded: 'تم جمع 50% من الهدف',
    new_investor: 'لديك مستثمر جديد!',
  };

  const messages: Record<string, string> = {
    funding_goal_reached: `تهانينا! تم الوصول إلى هدف التمويل للمشروع "${projectTitle}"`,
    half_funded: `المشروع "${projectTitle}" وصل إلى 50% من الهدف`,
    new_investor: `${details?.investorName || 'مستثمر جديد'} استثمر ${details?.amount?.toLocaleString() || ''} ريال في "${projectTitle}"`,
  };

  const html = `
    <h2>${titles[milestoneType]}</h2>
    <p>مرحباً ${founderName}،</p>
    <p>${messages[milestoneType]}</p>
    <p><a href="https://ideabusiness.com/projects/${details?.projectId}" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">عرض المشروع</a></p>
  `;

  return sendEmail({
    to: email,
    subject: `${titles[milestoneType]} - IDEA BUSINESS`,
    html,
  });
}

/**
 * Weekly portfolio summary for investors
 */
export async function sendWeeklyPortfolioEmail(
  email: string,
  investorName: string,
  totalInvested: number,
  investmentCount: number,
  recentInvestments: any[]
) {
  const html = `
    <h2>ملخص محفظتك الأسبوعي</h2>
    <p>مرحباً ${investorName}،</p>
    <p><strong>إجمالي الاستثمارات:</strong> ${totalInvested.toLocaleString()} ريال</p>
    <p><strong>عدد المشاريع:</strong> ${investmentCount}</p>

    <h3>الاستثمارات الحديثة:</h3>
    <ul>
      ${recentInvestments.map((inv) => `<li>${inv.projectTitle} - ${inv.amount.toLocaleString()} ريال</li>`).join('')}
    </ul>

    <p><a href="https://ideabusiness.com/portfolio" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">عرض المحفظة</a></p>
  `;

  return sendEmail({
    to: email,
    subject: 'ملخص محفظتك الأسبوعي - IDEA BUSINESS',
    html,
  });
}
