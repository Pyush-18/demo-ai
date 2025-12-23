import { ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const CustomSelector = ({
  options,
  selectedValue,
  onSelect,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const selectorRef = useRef(null);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen && selectorRef.current) {
      const rect = selectorRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const estimatedHeight = Math.min(options.length * 48 + 16, 300); 
      const spaceBelow = viewportHeight - rect.bottom;
      
      setOpenUpward(spaceBelow < estimatedHeight); 
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  const Icon = selectedOption ? selectedOption.icon : null;

  return (
    <div className="relative w-full font-sans group " ref={selectorRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative flex items-center justify-between w-full max-w-[300px]
          h-[45px] /* Fixed height for consistency */
          px-4 text-[15px] font-medium transition-all duration-300 ease-out
          rounded-xl border backdrop-blur-xl
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-purple-500/50"}
          ${isOpen 
            ? "bg-[#1e1b2e] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
          }
        `}
      >
        <span className="flex items-center gap-3 truncate">
          {Icon ? (
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-300
              ${isOpen ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-zinc-400 group-hover:text-purple-300"}
            `}>
              <Icon className="w-5 h-5" />
            </div>
          ) : (
             <div className="w-1" /> 
          )}
          
          <span className={`truncate tracking-wide transition-colors ${selectedOption ? "text-white" : "text-zinc-500"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180 text-purple-400" : "group-hover:text-zinc-300"
          }`}
        />
      </button>

      <div
        ref={dropdownRef}
        className={`
          absolute left-0 z-[100] max-w-[300px] w-full
          bg-[#0d0c15]
          border border-white/10 
          rounded-xl shadow-2xl shadow-black/80
          transition-all duration-200 origin-top
          ${isOpen 
            ? "opacity-100 scale-100 translate-y-2 visible" 
            : "opacity-0 scale-95 translate-y-0 invisible pointer-events-none"
          }
          ${openUpward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"}
        `}
      >
        <ul className="max-h-52 overflow-y-auto py-2 px-1 custom-scrollbar">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            const OptionIcon = option.icon;

            return (
              <li key={option.value} className="mb-1 last:mb-0">
                <button
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full flex items-center justify-between px-3 py-3
                    text-sm rounded-lg transition-all duration-200 group/item
                    ${isSelected 
                      ? "bg-purple-600/20 text-white border border-purple-500/30" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {OptionIcon && (
                      <OptionIcon 
                        className={`
                          w-4 h-4 transition-colors
                          ${isSelected ? "text-purple-400" : "text-zinc-600 group-hover/item:text-purple-300"}
                        `} 
                      />
                    )}
                    <span className="font-medium">{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};