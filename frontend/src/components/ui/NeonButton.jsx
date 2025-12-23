
export const NeonButton = ({ children, primary = false, className = '', ...props }) => (
    <button
        className={`
            font-semibold py-3 px-8 rounded-full transition duration-300 shadow-lg
            ${primary
                ? 'bg-pink-600 hover:bg-pink-700 text-white border border-pink-500 shadow-pink-500/50 hover:shadow-pink-400/70'
                : 'bg-transparent text-purple-400 border border-purple-500 hover:bg-purple-900/30'
            }
            ${className}
        `}
        {...props}
    >
        {children}
    </button>
);