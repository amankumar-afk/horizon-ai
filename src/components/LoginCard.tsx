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

  return (
    <div className="relative animate-fade-in-up">
      {/* Card border trace animation */}
      <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 rounded-2xl border-trace-animation" />
      </div>

      <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl p-10 md:p-12 shadow-card border border-border/50 w-full max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Login with your Rista account
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          Enter your details below to login to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted-foreground text-sm transition-all duration-300 outline-none ${
                focusedField === "account"
                  ? "border-primary shadow-[0_0_0_3px_rgba(210,48,48,0.1)]"
                  : "border-border hover:border-muted-foreground/40"
              }`}
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
              className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted-foreground text-sm transition-all duration-300 outline-none ${
                focusedField === "user"
                  ? "border-primary shadow-[0_0_0_3px_rgba(210,48,48,0.1)]"
                  : "border-border hover:border-muted-foreground/40"
              }`}
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
              className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder:text-muted-foreground text-sm transition-all duration-300 outline-none ${
                focusedField === "pin"
                  ? "border-primary shadow-[0_0_0_3px_rgba(210,48,48,0.1)]"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            />
          </div>

          <button
            ref={buttonRef}
            type="submit"
            onClick={handleButtonClick}
            className="relative w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_-5px_rgba(210,48,48,0.4)] active:scale-[0.98]"
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

        <p className="text-center text-xs text-muted-foreground mt-6">
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
