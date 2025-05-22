
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

enum AuthView {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
}

const AuthPage = () => {
  const [currentView, setCurrentView] = useState<AuthView>(AuthView.LOGIN);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 casino-gradient">
      <div className="w-full max-w-md">
        {currentView === AuthView.LOGIN && (
          <LoginForm
            onToggleForm={() => setCurrentView(AuthView.REGISTER)}
            onForgotPassword={() => setCurrentView(AuthView.FORGOT_PASSWORD)}
          />
        )}
        {currentView === AuthView.REGISTER && (
          <RegisterForm onToggleForm={() => setCurrentView(AuthView.LOGIN)} />
        )}
        {currentView === AuthView.FORGOT_PASSWORD && (
          <ForgotPasswordForm onBack={() => setCurrentView(AuthView.LOGIN)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
