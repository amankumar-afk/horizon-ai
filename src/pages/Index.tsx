import ParticleNetwork from "@/components/ParticleNetwork";
import LoginCard from "@/components/LoginCard";
import logo from "@/assets/dotpe-horizon-logo.svg";


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
