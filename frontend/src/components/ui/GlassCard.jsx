
export const GlassCard = ({ children, className = '', id='' }) => (
    <div data-id={id} className={`p-6 lg:p-8 bg-white/5 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-2xl ${className}`}>
        {children}
    </div>
);
