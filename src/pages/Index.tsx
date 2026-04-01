import WaveNetwork from "@/components/WaveNetwork";
import LoginCard from "@/components/LoginCard";
import logo from "@/assets/dotpe-horizon-logo.svg";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Left side: Branding + Wave Terrain */}
      <div className="fixed inset-0 flex">
        {/* Left panel — terrain lives here */}
        <div className="relative w-[58%] hidden lg:block">
          <WaveNetwork />

          {/* Branding overlay — sits above terrain */}
          <div className="relative z-10 flex flex-col justify-start px-12 xl:px-16 pt-16 xl:pt-20 max-w-2xl">
            <img
              src={logo}
              alt="dotpe Horizon"
              className="h-10 xl:h-12 mb-12 animate-logo-enter self-start"
              style={{ animationDelay: "1.8s" }}
            />

            <h1
              className="text-3xl xl:text-[2.5rem] font-bold leading-tight mb-5 opacity-0"
              style={{
                color: "#1A1A1A",
                animation: "fadeInUp 0.7s ease-out 2s forwards",
              }}
            >
              See what needs attention in your restaurant
            </h1>

            <p
              className="text-base xl:text-[17px] leading-relaxed opacity-0 max-w-lg"
              style={{
                color: "#777",
                animation: "fadeInUp 0.7s ease-out 2.2s forwards",
              }}
            >
              Act on the issues that matter first, with a clear view of performance changes, unusual business activity, and the priorities that need your attention.
            </p>
          </div>
        </div>

        {/* Right panel — login card */}
        <div className="w-full lg:w-[42%] flex items-center justify-center px-6 md:px-12">
          {/* Mobile-only branding */}
          <div className="lg:hidden absolute top-0 left-0 right-0 px-6 pt-8">
            <img
              src={logo}
              alt="dotpe Horizon"
              className="h-8 mb-4 animate-logo-enter"
            />
          </div>
          <LoginCard />
        </div>
      </div>
    </div>
  );
};

export default Index;
