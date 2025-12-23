import { ArrowRight, CheckCircle } from "lucide-react";
import { aboutStats, coreValues, differentiators } from "../../data/index.js";
import { GlassCard } from "../index.js";
import {motion} from "motion/react"

export const AboutUs = () => {
  return (
    <section className="py-24 relative z-10 max-w-7xl mt-20 mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold text-white mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            About Us
          </span>
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Trusted by thousands of professionals and businesses worldwide.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-20">
        {aboutStats.map((stat, index) => (
          <GlassCard
            key={index}
            className="flex flex-col items-center justify-center p-6 text-center bg-purple-900/30 border-purple-500/50 hover:border-pink-500 transition duration-300"
          >
            <stat.icon className="w-8 h-8 text-pink-400 mb-3" />
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-300">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mb-20">
        <h3 className="text-3xl font-bold text-center text-white mb-10">
          Our Mission & Vision
        </h3>
        <div className="grid lg:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h4 className="text-2xl font-semibold text-pink-400 mb-4 border-b border-purple-500/30 pb-3">
              Our Mission
            </h4>
            <p className="text-gray-300 mb-4">
              Our mission is powering growth and compliance with an **AI-enabled
              solution**, that is easy to use and provides high accuracy when
              filing compliance like VAT/GST or corporation tax return in
              countries like UK, India, and more.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Data
                Accuracy
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Ease of
                Usage
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Instant
                Compliance
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Global
                Applicability
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Cost
                Effective
              </li>
            </ul>
          </GlassCard>
          <GlassCard className="p-8">
            <h4 className="text-2xl font-semibold text-pink-400 mb-4 border-b border-purple-500/30 pb-3">
              Our Vision
            </h4>
            <p className="text-gray-300 mb-4">
              Our vision is to be the go-to platform for all matters of tax
              compliance, documentation, and filing, recognized globally for
              setting new benchmarks in accuracy, speed, and security. We
              envision a future where compliance is a simple, automated process
              for businesses of all sizes.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Process
                Automation
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Security
                First
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" />{" "}
                Instantly Delivered
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 text-purple-400 mr-2" /> Globally
                Recognized
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>

      <div className="mb-20">
        <h3 className="text-3xl font-bold text-center text-white mb-10">
          Our Core Values
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          {coreValues.map((value, index) => (
            <GlassCard
              key={index}
              className="flex flex-col items-center text-center p-6 bg-purple-900/30"
            >
              <value.icon className="w-10 h-10 text-pink-400 mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">
                {value.title}
              </h4>
              <p className="text-sm text-gray-400">{value.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="mb-20">
        <h3 className="text-3xl font-bold text-center text-white mb-10">
          Meet the Founders
        </h3>
        <div className="grid lg:grid-cols-2 gap-8">
          <GlassCard className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4">
              KN
            </div>
            <h4 className="text-2xl font-semibold text-pink-400">
              Kalpesh Navandar
            </h4>
            <p className="text-base text-gray-300 mb-4">CEO & Co-founder</p>
            <p className="text-sm text-gray-400">
              Kalpesh is an experienced professional in IT and Finance, focused
              on leveraging technology for business solutions, with deep
              knowledge in compliance, reporting, and regulatory frameworks
              across multiple jurisdictions. He drives the product strategy and
              ensures Shulekhanan remains globally competitive and user-focused.
            </p>
          </GlassCard>
          <GlassCard className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-pink-600 flex items-center justify-center text-3xl font-bold text-white mb-4">
              YP
            </div>
            <h4 className="text-2xl font-semibold text-purple-400">
              Yashraj Patil
            </h4>
            <p className="text-base text-gray-300 mb-4">CTO & Co-founder</p>
            <p className="text-sm text-gray-400">
              Yashraj is a seasoned architect with expertise in MERN stack,
              blockchain, and AI/ML technologies. He is focused on creating a
              seamless, highly scalable, and secure application architecture. He
              drives technological innovation at Shulekhanan, ensuring the platform
              utilizes cutting-edge security and processing speeds.
            </p>
          </GlassCard>
        </div>
      </div>

      <section className="relative py-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-600/10 blur-[100px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-white/[0.02] backdrop-blur-md p-8 lg:p-12 rounded-[2rem] shadow-2xl border border-white/10"
        >
          <div className="text-center mb-12">
            <motion.h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              What makes us{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                Different
              </span>
            </motion.h3>
            <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {differentiators.map((diff, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{
                  y: -5,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="group relative p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col items-center text-center gap-3 relative z-10">
                  <div className="p-2 rounded-full bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors">
                    <CheckCircle className="w-5 h-5 text-pink-400" />
                  </div>
                  <span className="text-sm md:text-base font-semibold tracking-wide text-gray-200 group-hover:text-white transition-colors">
                    {diff}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </section>
  );
};
