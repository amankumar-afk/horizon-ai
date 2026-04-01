import ParticleNetwork from "@/components/ParticleNetwork";
import LoginCard from "@/components/LoginCard";
import logo from "@/assets/dotpe-horizon-logo.svg";

const GhostChart = ({ delay, className }: { delay: string; className: string }) => (
  <svg
    className={`absolute opacity-0 ${className}`}
    style={{ animation: `ghostFade 6s ease-in-out ${delay} infinite` }}
    width="120"
    height="50"
    viewBox="0 0 120 50"
  >
    <polyline
      fill="none"
      stroke="rgba(210,48,48,0.1)"
      strokeWidth="1.5"
      points="0,40 20,35 40,25 60,30 80,15 100,20 120,10"
    />
  </svg>
);

const GhostPercentage = ({ value, delay, className }: { value: string; delay: string; className: string }) => (
  <span
    className={`absolute text-2xl font-bold ${className}`}
    style={{
      color: "rgba(210,48,48,0.08)",
      animation: `ghostFade 8s ease-in-out ${delay} infinite`,
    }}
  >
    {value}
  </span>
);

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden" style={{ pointerEvents: "auto" }}>
      {/* Particle Network Background */}
      <ParticleNetwork />

      {/* Subtle gradient overlay for depth */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 30%, rgba(247,247,247,0.3) 100%)",
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 lg:px-20 gap-12 lg:gap-20">
        {/* Left: Branding */}
        <div className="flex-1 max-w-xl animate-slide-in-left relative">
          {/* Ghost data visualizations */}
          <GhostChart delay="0s" className="top-10 right-0" />
          <GhostChart delay="3s" className="bottom-20 left-10" />
          <GhostPercentage value="+24%" delay="1s" className="top-0 right-20" />
          <GhostPercentage value="↑ 18%" delay="4s" className="bottom-10 right-5" />

          <img
            src={logo}
            alt="dotpe Horizon"
            className="h-12 md:h-16 mb-10 animate-logo-enter"
          />

          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight mb-6">
            See what needs attention in your restaurant
          </h1>

          <p className="text-base md:text-lg leading-relaxed" style={{ color: "#777" }}>
            Act on the issues that matter first, with a clear view of performance changes, unusual business activity, and the priorities that need your attention.
          </p>
        </div>

        {/* Right: Login Card */}
        <div className="flex-shrink-0 w-full max-w-md">
          <LoginCard />
        </div>
      </div>
    </div>
  );
};

export default Index;
