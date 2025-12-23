export const GradientButton = ({ children, icon: Icon, onClick, id }) => (
  <button
    data-id={id}
    onClick={onClick}
    className="w-full py-4 px-6 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-xl shadow-fuchsia-800/30 hover:shadow-fuchsia-600/50 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
  >
    {Icon && <Icon size={24} />}
    <span>{children}</span>
  </button>
);
