import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SITE = "[LEND GAS]";
const LAST_UPDATED = "May 1, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using ${SITE}, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these Terms, you must discontinue use of the platform immediately.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 13 years old to register and use the platform. By creating an account, you confirm that you meet this minimum age requirement.`,
  },
  {
    title: "3. Account Registration & One Account Policy",
    body: `Each user is permitted to hold only one (1) account on the platform. The creation of multiple accounts by a single individual is strictly prohibited and constitutes a violation of these Terms. Any user found to have created multiple accounts will have all associated accounts permanently suspended, and legal action may be pursued against them to the fullest extent permitted by law.`,
  },
  {
    title: "4. Fees & Charges",
    body: `A 15% processing fee will be deducted from all withdrawal requests at the time of issuance. This fee is non-negotiable and non-refundable. By registering on ${SITE}, you acknowledge and accept this fee structure.`,
  },
  {
    title: "5. Withdrawals",
    body: `All withdrawal requests are subject to a processing period of 24 to 72 hours from the time the request is submitted. Withdrawals will not be processed on weekends or public holidays unless otherwise stated. ${SITE} reserves the right to delay or review any withdrawal flagged for security or compliance reasons.`,
  },
  {
    title: "6. User Conduct",
    body: `You agree not to engage in fraudulent activity, abuse of the platform, harassment of other users, or any behavior that disrupts the normal operation of the site. Violations may result in account suspension or termination without notice.`,
  },
  {
    title: "7. Intellectual Property",
    body: `All content on this platform, including but not limited to logos, text, graphics, and software, is the exclusive property of ${SITE} and may not be copied, reproduced, or distributed without prior written permission.`,
  },
  {
    title: "8. Privacy Policy",
    body: `By using this site, you consent to the collection and use of your personal data as outlined in our Privacy Policy. We do not sell user data to third parties.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `${SITE} shall not be held liable for any indirect, incidental, or consequential damages arising from the use or inability to use the platform, including but not limited to loss of funds due to user error.`,
  },
  {
    title: "10. Account Termination",
    body: `We reserve the right to suspend or permanently terminate any account at our discretion if a user is found to be in violation of these Terms, engaged in suspicious activity, or acting in a manner harmful to the platform or its users.`,
  },
  {
    title: "11. Modifications to Terms",
    body: `${SITE} reserves the right to update or modify these Terms at any time without prior notice. Continued use of the platform after changes are published constitutes acceptance of the revised Terms.`,
  },
  {
    title: "12. Governing Law",
    body: `These Terms shall be governed and interpreted in accordance with applicable laws. Any disputes arising shall be resolved through the appropriate legal channels.`,
  },
  {
    title: "13. Contact Us",
    body: `If you have any questions about these Terms, you may contact our support team via the support panel available within the user interface.`,
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sticky top nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">{SITE}</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Legal</p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 leading-tight"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Terms and Conditions
          </h1>
          <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            Welcome to {SITE}. These Terms and Conditions outline the rules and regulations for the
            use of our platform. Please read them carefully before using our services.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">{s.title}</h2>
              <p className="text-[15px] leading-relaxed text-slate-700">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 p-5 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-600">
            By continuing to use {SITE}, you acknowledge that you have read, understood, and agreed
            to these Terms and Conditions.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {SITE}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
