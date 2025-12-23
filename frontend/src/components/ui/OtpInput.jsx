import { useState, useRef } from 'react';

export const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

const handleChange = (element, index) => {
    if (isNaN(Number(element.value))) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    if (paste.length === length && /^\d+$/.test(paste)) {
      const newOtp = paste.split('');
      setOtp(newOtp);
      inputRefs.current[length - 1]?.focus();
      onComplete(newOtp.join(''));
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-4">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          name="otp"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          onPaste={handlePaste}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-v-glass-hover border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-v-accent text-v-text-primary transition-all duration-300"
        />
      ))}
    </div>
  );
};
