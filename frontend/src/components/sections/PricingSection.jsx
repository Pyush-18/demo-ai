import { CheckCircle } from "lucide-react";
import { GlassCard, NeonButton } from "../index.js";
import { pricingTiers } from "../../data/index.js";

export const PricingSection = () => (
    <section className="py-24 relative z-10 max-w-7xl mt-20 mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">No hidden fees. Pick the plan that fits your business size and complexity.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
                <GlassCard key={index} className={`flex flex-col items-center text-center p-8 transition duration-300 ${tier.highlight ? 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)]' : ''}`}>
                    

                    <div className="flex flex-col items-center justify-center w-full mb-6">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 mb-1">{tier.name}</h3>
                        {tier.highlight && (
                            <span className="text-xs font-semibold uppercase text-purple-200 bg-purple-700/50 px-3 py-1 rounded-full">Most Popular</span>
                        )}
                    </div>

             
                    <div className="flex flex-col items-center justify-center mb-8">
                    
                        {tier.originalPrice && (
                            <p className="text-sm font-medium text-gray-500 line-through mb-1">
                                {tier.originalPrice}
                            </p>
                        )}
                        
                        <div className="text-5xl font-extrabold text-white">
                            {tier.price}
                        </div>
                        
                        <span className="text-lg font-medium text-gray-400">
                            {tier.price !== 'Custom' ? 'Per Year' : 'Custom Pricing'}
                        </span>
                        
                        {tier.discount && (
                            <div className="mt-3 text-sm font-semibold text-pink-400 bg-pink-900/40 px-3 py-1 rounded-full border border-pink-600/50">
                                {tier.discount} OFF
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 flex-grow w-full text-left">
                        {tier.features.map((feature, i) => (
                            <div key={i} className="flex items-start text-gray-300">
                                <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 mr-3 ${tier.highlight ? 'text-pink-400' : 'text-purple-400'}`} />
                                <span className="text-base">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 w-full">
                        <NeonButton primary={tier.highlight} className="w-full">
                            {tier.highlight ? 'Get Started Today' : 'Select Plan'}
                        </NeonButton>
                    </div>
                </GlassCard>
            ))}
        </div>
    </section>
);