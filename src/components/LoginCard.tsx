import { useState, useRef } from "react";

const LoginCard = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg bg-background border text-sm transition-all duration-200 ease-out outline-none font-[400] ${
      focusedField === field
        ? "border-primary shadow-[0_0_0_3px_rgba(210,48,48,0.08)]"
        : "border-border hover:border-muted-foreground/40"
    }`;

  return (
    <div className="animate-fade-in-up">
      <div
        className="relative bg-card rounded-2xl p-10 md:p-12 w-full max-w-[420px]"
        style={{
          boxShadow: "0 4px 60px -15px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03), 0 0 40px -10px rgba(210,48,48,0.06)",
        }}
      >
        <h2 className="text-[22px] font-bold text-foreground mb-1.5 leading-tight">
          Login with your Rista account
        </h2>
        <p className="text-muted-foreground text-sm mb-8 font-[400]">
          Enter your details below to login to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Account Number
            </label>
            <input
              type="text"
              placeholder="Enter 8 digit account number"
              maxLength={8}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              onFocus={() => setFocusedField("account")}
              onBlur={() => setFocusedField(null)}
              className={inputClass("account")}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              User ID
            </label>
            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onFocus={() => setFocusedField("user")}
              onBlur={() => setFocusedField(null)}
              className={inputClass("user")}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              PIN
            </label>
            <input
              type="password"
              placeholder="Enter 4 digit PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onFocus={() => setFocusedField("pin")}
              onBlur={() => setFocusedField(null)}
              className={inputClass("pin")}
            />
          </div>

          <button
            ref={buttonRef}
            type="submit"
            onClick={handleButtonClick}
            className="relative w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_25px_-5px_rgba(210,48,48,0.4)] active:scale-[0.98]"
          >
            {ripple && (
              <span
                className="absolute rounded-full bg-primary-foreground/30 animate-ripple"
                style={{
                  left: ripple.x - 50,
                  top: ripple.y - 50,
                  width: 100,
                  height: 100,
                }}
              />
            )}
            <span className="relative z-10">Login</span>
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6 font-[400]">
          By clicking continue, you agree to our{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Terms
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
