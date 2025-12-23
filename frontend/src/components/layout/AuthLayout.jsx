export const AuthLayout = ({ title, children, imageUrl, imageText }) => {
  return (
    <div className="relative min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, #3a085b 0%, #0d0116 50%, #000 100%)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30"
        style={{
          background:
            "url(https://www.transparenttextures.com/patterns/dark-fish-skin.png)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          zIndex: 0,
        }}
      />

      <div
        className="relative z-10 w-full max-w-6xl flex shadow-2xl rounded-3xl overflow-hidden"
        style={{
          minHeight: "600px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(150, 75, 200, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="hidden lg:block lg:w-1/2 p-10 relative bg-cover bg-center rounded-l-3xl"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRight: "1px solid rgba(150, 75, 200, 0.3)",
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col justify-center h-full text-white">
            <h2 className="text-5xl font-extrabold mb-4 leading-tight">
              AI-Powered Compliance
            </h2>
            <p className="text-xl text-purple-200">{imageText}</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 mb-8">
            {title === "Create Account"
              ? "Start your 14-day free trial today."
              : "Welcome back! Please sign in to continue."}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
};
