import { Link } from "lucide-react";

export const StatusBar = ({ isTallyConnected, connectivity = {} }) => {
  const effectiveConnectivity = {
    tallyConnector: {
      ...connectivity.tallyConnector,
      status: isTallyConnected ? "Connected" : "Disconnected",
      details: isTallyConnected
        ? "Tally is active (IP: localhost | Port: 9000)"
        : "Tally not responding. Please open Tally Prime or Connector.",
    },
    vouchritServer: connectivity.vouchritServer || { status: "Connected" },
  };

  return (
    <div  className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div id="tally-connection-status" className="lg:col-span-1 bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-indigo-400/20">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Link size={24} className="text-fuchsia-400 mr-2" /> Connection Status
        </h2>

        <div className="space-y-4">
          <div className="flex items-center p-3 rounded-lg bg-gray-700/50">
            <span
              className={`h-3 w-3 rounded-full mr-3 ${
                isTallyConnected
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500 animate-pulse"
              }`}
            ></span>
            <div>
              <p className="text-lg font-medium text-white">Tally Connector</p>
              <p className="text-sm text-gray-400">
                {effectiveConnectivity.tallyConnector.status}
                <span className="text-xs ml-2 text-fuchsia-300">
                  ({effectiveConnectivity.tallyConnector.details})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 rounded-lg bg-gray-700/50">
            <span
              className={`h-3 w-3 rounded-full mr-3 ${
                effectiveConnectivity.vouchritServer.status === "Connected"
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500 animate-pulse"
              }`}
            ></span>
            <div>
              <p className="text-lg font-medium text-white">Shulekhanan Server</p>
              <p className="text-sm text-gray-400">
                {effectiveConnectivity.vouchritServer.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="invite-bonus-card" className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-fuchsia-900 p-8 rounded-2xl shadow-2xl shadow-fuchsia-900/40 relative overflow-hidden transform transition-transform duration-300 hover:scale-[1.005]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative flex justify-between items-center">
          <div className="max-w-xl">
            <h3 className="text-3xl font-extrabold text-white mb-2">
              Invite & Earn{" "}
              <span className="text-yellow-300">10% Cash Bonus</span> 💰
            </h3>
            <p className="text-lg text-fuchsia-200 mb-6">
              Share Shulekhanan with your network. Simply WhatsApp the name and
              contact details to{" "}
              <strong className="text-white">98765 43210</strong>.
            </p>
            <div className="bg-white/20 p-3 rounded-xl inline-flex items-center">
              <span className="text-white text-lg font-mono tracking-widest font-bold">
                CODE: DAED1237
              </span>
            </div>
            <p className="text-sm mt-3 text-yellow-400 font-semibold">
              Limited till 31st Oct 2025. Don't miss out!
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-2xl flex-shrink-0">
            <div className="h-24 w-24 bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-mono">
              [Mock QR]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
