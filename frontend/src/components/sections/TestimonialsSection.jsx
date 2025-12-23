import { GlassCard } from "../index.js";
import {testimonials} from "../../data/index.js"

export const TestimonialsSection = () => (
    <section id="testimonials" className="py-24 relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Hear What Our Clients Say</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">We're proud to support thousands of businesses.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
                <GlassCard key={index} className="flex flex-col justify-between hover:scale-[1.02] transition duration-300 h-full">
                    <p className="text-lg italic text-gray-200 mb-6">"{t.quote}"</p>
                    <div className="pt-4 border-t border-purple-500/20">
                        <p className="text-base font-semibold text-pink-400">{t.author}</p>
                        <p className="text-sm text-gray-400">{t.role}</p>
                    </div>
                </GlassCard>
            ))}
        </div>
    </section>
);