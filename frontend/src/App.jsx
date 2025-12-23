import React from "react";
import { Footer, Header } from "./components/index";
import { Outlet } from "react-router";

function App() {
  
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans relative overflow-x-hidden ">
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-80 "
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

      <Header />  
      <main className="relative z-10 ">
       <Outlet />
      </main>


      <Footer />
    </div>
  );
}

export default App;
