import { motion } from "motion/react";
import { CheckCircle, Mail, Phone, ArrowRight } from "lucide-react";

export const ContactUs = () => {
  return (
    <section className="py-24 relative mt-16 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative group lg:col-span-12 p-8 lg:p-16 rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-6">
                  Let&apos;s build
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="block py-2 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
                  >
                    something great.
                  </motion.span>
                </h1>
                <p className="text-lg text-gray-400 max-w-md leading-relaxed mb-10">
                  Have a question or a project in mind? Reach out and our team
                  will get back to you within 12 hours.
                </p>
              </motion.div>

              <div className="space-y-4">
                {[
                  "Response within 12 hours",
                  "Dedicated consultant specialists",
                  "Technical support 24/7",
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center text-gray-300 gap-3"
                  >
                    <div className="p-1 rounded-full bg-green-500/10">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-sm font-medium">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <ContactCard
                icon={<Mail className="w-5 h-5" />}
                label="Email ID"
                value="team@Shulekhanan.com"
                href="mailto:team@Shulekhanan.com"
                delay={0.3}
              />
              <ContactCard
                icon={<Phone className="w-5 h-5" />}
                label="Sales & Product"
                value="+91 7262002003"
                href="tel:+917262002003"
                delay={0.4}
              />
              <ContactCard
                icon={<Phone className="w-5 h-5" />}
                label="Technical Enquiry"
                value="+91 7262002004"
                href="tel:+917262002004"
                delay={0.5}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ContactCard = ({ icon, label, value, href, delay }) => (
  <motion.a
    href={href}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 group/card"
    whileHover={{
      x: 12,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(236, 72, 153, 0.3)",
    }}
    transition={{
      delay,
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.5,
    }}
  >
    <div className="flex items-center gap-5">
      <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 group-hover/card:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">
          {label}
        </p>
        <p className="text-lg font-semibold text-white tracking-tight">
          {value}
        </p>
      </div>
    </div>

    <motion.div
      variants={{
        initial: { x: 0, opacity: 0.5 },
        hover: { x: 5, opacity: 1 },
      }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <ArrowRight className="w-5 h-5 text-gray-500 group-hover/card:text-pink-400" />
    </motion.div>
  </motion.a>
);
