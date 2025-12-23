import { mainFeatures } from "../../data/index.js";
import {GlassCard} from "../index.js"

export const FeaturesSection = () => (
    <section id="features" className="py-24 relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Core Compliance Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Built for maximum automation and guaranteed compliance.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainFeatures.map((feature, index) => (
                <GlassCard key={index} className="flex flex-col items-start p-6 hover:border-pink-500 transition duration-300">
                    <feature.icon className="w-8 h-8 text-pink-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                </GlassCard>
            ))}
        </div>
        
        <div className="mt-20 text-center">
            <h3 className="text-2xl font-semibold text-white mb-8">Trusted by leading technology platforms</h3>
            <div className="flex justify-center items-center space-x-12 opacity-80">
                <p className="text-3xl font-bold text-gray-300">Microsoft</p>
                <p className="text-3xl font-bold text-gray-300">Azure</p>
                <p className="text-3xl font-bold text-gray-300">AWS</p>
                <p className="text-3xl font-bold text-gray-300">Google Cloud</p>
            </div>
        </div>
    </section>
);