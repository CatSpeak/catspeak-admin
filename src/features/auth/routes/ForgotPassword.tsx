import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  sendForgotPasswordOtp,
  verifyResetOtp,
  resetPassword,
} from "../api/forgotPassword";
import { getApiErrorMessage } from "../../../lib/axios";
import { useLanguage } from "../../../stores/languageStore";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [email, setEmail] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Step 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [otpToken, setOtpToken] = useState("");

  // Auto-redirect on success
  useEffect(() => {
    if (currentStep === "success") {
      const timer = setTimeout(() => navigate("/login"), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, navigate]);

  // --- Step 1: Send OTP ---
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t.auth.enterEmailError);
      return;
    }

    setIsSendingOtp(true);
    try {
      await sendForgotPasswordOtp({ email: email.trim() });
      setCurrentStep("otp");
    } catch (err) {
      setError(getApiErrorMessage(err, t.auth.sendOtpFailed));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError(t.auth.enter6DigitError);
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await verifyResetOtp({
        email: email.trim(),
        otp: otpValue,
      });
      setOtpToken(response.resetToken);
      setCurrentStep("reset");
    } catch (err) {
      setError(getApiErrorMessage(err, t.auth.invalidOtp));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // --- Step 3: Reset Password ---
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError(t.auth.fillBothPasswordsError);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.auth.passwordMinLengthError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatchError);
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword({
        email: email.trim(),
        resetToken: otpToken,
        newPassword,
      });
      setCurrentStep("success");
    } catch (err) {
      setError(getApiErrorMessage(err, t.auth.resetPasswordFailed));
    } finally {
      setIsResetting(false);
    }
  };

  // --- Error Banner ---
  const renderError = () =>
    error && (
      <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{error}</p>
      </div>
    );

  // --- Step 1: Email Form ---
  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t.auth.forgotPasswordTitle}
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          {t.auth.forgotPasswordSubtitle}
        </p>
      </div>

      {renderError()}

      <div>
        <label
          htmlFor="reset-email"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {t.auth.emailAddress}
        </label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
          placeholder={t.auth.emailPlaceholder}
        />
      </div>

      <button
        type="submit"
        disabled={isSendingOtp}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSendingOtp ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.auth.sendingCode}
          </>
        ) : (
          t.auth.sendVerificationCode
        )}
      </button>
    </form>
  );

  // --- Step 2: OTP Form ---
  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <ShieldCheck className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t.auth.checkYourEmail}
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          {t.auth.sentCodeTo}{" "}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {renderError()}

      <div>
        <label className="mb-2 block text-center text-sm font-medium text-gray-700">
          {t.auth.verificationCode}
        </label>
        <div
          className="flex justify-center gap-2 sm:gap-3"
          onPaste={handleOtpPaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                otpRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className="h-12 w-10 rounded-xl border border-gray-300 bg-gray-50/50 text-center text-lg font-bold text-gray-900 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-14 sm:w-12"
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isVerifyingOtp}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isVerifyingOtp ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.auth.verifying}
          </>
        ) : (
          t.auth.verifyCode
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setCurrentStep("email");
          setOtp(["", "", "", "", "", ""]);
          setError(null);
        }}
        className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.auth.useDifferentEmail}
      </button>
    </form>
  );

  // --- Step 3: Reset Password Form ---
  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
          <Lock className="h-7 w-7 text-violet-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t.auth.setNewPasswordTitle}
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          {t.auth.setNewPasswordSubtitle}
        </p>
      </div>

      {renderError()}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {t.auth.newPassword}
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(null);
              }}
              className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 px-4 py-3 pr-11 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
              placeholder={t.auth.newPasswordPlaceholder}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {t.auth.confirmPassword}
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 px-4 py-3 pr-11 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
              placeholder={t.auth.confirmPasswordPlaceholder}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isResetting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isResetting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.auth.updating}
          </>
        ) : (
          t.auth.resetPassword
        )}
      </button>
    </form>
  );

  // --- Step 4: Success ---
  const renderSuccessStep = () => (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t.auth.passwordUpdatedTitle}
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          {t.auth.passwordUpdatedSubtitle}
        </p>
      </div>
      <Link
        to="/login"
        className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
      >
        {t.auth.backToLogin}
      </Link>
    </div>
  );

  // --- Main Render ---
  const stepContent: Record<Step, () => React.JSX.Element> = {
    email: renderEmailStep,
    otp: renderOtpStep,
    reset: renderResetStep,
    success: renderSuccessStep,
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/5">
        {/* Step Content */}
        <div>{stepContent[currentStep]()}</div>

        {/* Back to login link (not shown on success) */}
        {currentStep !== "success" && (
          <div className="text-center text-sm text-gray-500">
            {t.auth.rememberPassword}{" "}
            <Link
              to="/login"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {t.auth.backToLogin}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
