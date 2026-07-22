import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useLanguage, type Language } from "../../../stores/languageStore";
import { loginWithEmailAndPassword } from "../api/login";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { AuthUser } from "../types";
import { getApiErrorMessage } from "../../../lib/axios";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { language, setLanguage, t } = useLanguage();

  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginWithEmailAndPassword({ email, password });

      if (
        response.user.roleName !== "Admin" &&
        response.user.roleName !== "Staff"
      ) {
        setError(t.auth.accessDenied);
        setIsLoading(false);
        return;
      }

      const user: AuthUser = {
        accountId: response.user.accountId,
        username: response.user.username,
        email: response.user.email,
        roleId: response.user.roleId,
        roleName: response.user.roleName || "",
      };

      login(response.token, user);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      console.error("Login failed", error);
      setError(getApiErrorMessage(error, t.auth.loginFailed));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            {t.auth.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t.auth.loginSubtitle}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t.auth.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder={t.auth.emailPlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t.auth.password}
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder={t.auth.passwordPlaceholder}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              {t.auth.forgotPassword}
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  {t.auth.loggingIn}
                </span>
              ) : (
                t.auth.login
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
