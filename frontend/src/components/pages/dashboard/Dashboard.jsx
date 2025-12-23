import React from "react";
import { Page } from "../../../data/index.js";
import { Download } from "lucide-react";
import { GlassCard } from "../../index.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const activityData = [
  { name: "Mon", entries: 20 },
  { name: "Tue", entries: 45 },
  { name: "Wed", entries: 60 },
  { name: "Thu", entries: 30 },
  { name: "Fri", entries: 50 },
  { name: "Sat", entries: 15 },
  { name: "Sun", entries: 5 },
];

export const Dashboard = ({ setActivePage }) => {
  const handleDownload = () => {
    const downloadUrl =
      "https://storage.googleapis.com/vouchrit-public-resources/VouchrItTallyConnectorInstaller.exe";
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "VouchrItTallyConnectorInstaller.exe";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return (
    <div className="space-y-8">
      <section id="tally-integration">
        <h2 className="text-2xl font-semibold mb-4 text-[#f0f2f5]">
          Integrate with Tally in 3 mins
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="flex items-center justify-center bg-white/10 h-12 w-12 rounded-full text-xl font-bold mb-4">
              1
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#f0f2f5]">
              Download & Install Tally Connector
            </h3>
            <p className="text-[#a9a2c2] text-sm mb-4">
              Run the installer and follow the on-screen instructions.
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center w-full bg-fuchsia-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-fuchsia-600/80 transition"
            >
              <Download size={20} className="mr-2" />
              Download
            </button>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-center bg-white/10 h-12 w-12 rounded-full text-xl font-bold mb-4">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#f0f2f5]">
              Run Tally Connector
            </h3>
            <p className="text-[#a9a2c2] text-sm">
              Click on the shortcut icon on your desktop or search for Tally
              Connector in your start menu.
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-center bg-white/10 h-12 w-12 rounded-full text-xl font-bold mb-4">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#f0f2f5]">
              Open Tally (Prime)
            </h3>
            <p className="text-[#a9a2c2] text-sm">
              Open the desired company to change lo/Port according to your
              needs.
            </p>
            <p className="text-sm mt-2 text-[#a9a2c2]">
              IP:{" "}
              <span className="font-mono bg-black/20 px-2 py-1 rounded">
                localhost
              </span>{" "}
              Port:{" "}
              <span className="font-mono bg-black/20 px-2 py-1 rounded">
                9000
              </span>
            </p>
          </GlassCard>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard id="weekly-activity"  className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Weekly Activity</h2>
            <p className="text-sm text-v-accent-green">
              +3% increase than last week
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.1)"
                />
                <XAxis
                  dataKey="name"
                  stroke="#a9a2c2"
                  tick={{ fill: "#a9a2c2" }}
                />
                <YAxis stroke="#a9a2c2" tick={{ fill: "#a9a2c2" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(13, 12, 34, 0.8)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "#f0f2f5",
                  }}
                  cursor={{ fill: "rgba(192, 38, 211, 0.1)" }}
                />
                <Bar dataKey="entries" fill="#c026d3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <section className="space-y-8">
          <GlassCard id="current-plan" >
            <h3 className="font-semibold text-lg mb-2 text-v-text-primary">
              Current Plan
            </h3>
            <p className="text-3xl font-bold text-v-accent-green mb-4">
              Free Trial
            </p>
            <div className="space-y-2 text-[#a9a2c2] text-sm">
              <p>
                Remaining Entries:{" "}
                <span className="font-semibold text-v-text-primary">1000</span>
              </p>
              <p>
                Users Allowed:{" "}
                <span className="font-semibold text-v-text-primary">1</span>
              </p>
              <p>
                Valid until:{" "}
                <span className="font-semibold text-v-text-primary">
                  23 Oct 2025
                </span>
              </p>
            </div>
            <button
              onClick={() => setActivePage(Page.MyPlans)}
              className="mt-4 w-full bg-fuchsia-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-fuchsia-600/80 transition"
            >
              Manage Plan
            </button>
          </GlassCard>
          <div id="premium-promo" className="bg-gradient-to-br from-v-accent to-purple-600 p-6 rounded-2xl text-center">
            <h3 className="font-bold text-2xl mb-2 text-white">Go Premium</h3>
            <p className="text-white/80 text-sm mb-4">
              Unlock all features and get unlimited entries.
            </p>
            <button
              onClick={() => setActivePage(Page.MyPlans)}
              className="bg-white text-fuchsia-600 font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform"
            >
              Upgrade Now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
