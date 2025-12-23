import { ArrowRight, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format, isSameDay } from "date-fns";

const CalendarPicker = ({ date, onSelect, onClose, position = "start" }) => {
  const [currentMonth, setCurrentMonth] = useState(
    date instanceof Date && !isNaN(date)
      ? date.getMonth()
      : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    date instanceof Date && !isNaN(date)
      ? date.getFullYear()
      : new Date().getFullYear()
  );

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const prevMonthDays = getDaysInMonth(
    (currentMonth + 11) % 12,
    currentMonth === 0 ? currentYear - 1 : currentYear
  );

  const daysArray = [];

  for (let i = startDay; i > 0; i--) {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    daysArray.push({
      day: prevMonthDays - i + 1,
      inactive: true,
      date: new Date(prevYear, prevMonth, prevMonthDays - i + 1),
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      day: i,
      inactive: false,
      date: new Date(currentYear, currentMonth, i),
    });
  }

  let nextMonthDay = 1;
  while (daysArray.length < 42) {
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    daysArray.push({
      day: nextMonthDay,
      inactive: true,
      date: new Date(nextYear, nextMonth, nextMonthDay),
    });
    nextMonthDay++;
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") handlePrevMonth();
    if (e.key === "ArrowRight") handleNextMonth();
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-full mt-2 ${position === "start" ? "left-0" : "right-0"} z-[100] bg-gray-900/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-fuchsia-500/30 min-w-[280px]`}
    >
     
      <div className="flex justify-between items-center mb-3">
        <button
          type="button"
          className="text-fuchsia-400 p-1.5 hover:bg-gray-800 rounded-full transition"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePrevMonth();
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-white select-none">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          className="text-fuchsia-400 p-1.5 hover:bg-gray-800 rounded-full transition"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNextMonth();
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <span key={day} className="text-gray-400 font-bold py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {daysArray.map(({ day, inactive, date: d }) => (
          <button
            type="button"
            key={d.toISOString()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (inactive) return;
              onSelect(d);
              onClose();
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition text-sm
              ${
                inactive
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-white hover:bg-gray-700/50"
              }
              ${
                !inactive && date && isSameDay(d, date)
                  ? "bg-fuchsia-600 text-white font-bold ring-2 ring-fuchsia-400/50"
                  : ""
              }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export const DateRangeInput = ({ onChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const containerRef = useRef(null);

  const handleDateSelect = (date) => {
    if (activeField === "start") {
      setStartDate(date);
      setTimeout(() => setActiveField("end"), 100);
    } else if (activeField === "end") {
      setEndDate(date);
    }

    const newStart = activeField === "start" ? date : startDate;
    const newEnd = activeField === "end" ? date : endDate;
    if (onChange) onChange({ startDate: newStart, endDate: newEnd });
  };

  const formattedStartDate = startDate ? format(startDate, "dd-MM-yyyy") : "";
  const formattedEndDate = endDate ? format(endDate, "dd-MM-yyyy") : "";

  const handleClearDate = (field, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (field === "start") {
      setStartDate(null);
      if (onChange) onChange({ startDate: null, endDate });
    } else {
      setEndDate(null);
      if (onChange) onChange({ startDate, endDate: null });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1.5">
        Extraction Period{" "}
        <span className="text-gray-400 text-xs">[DD-MM-YYYY] (optional)</span>
      </label>
      <div
        ref={containerRef}
        className="relative"
      >
        <div className="flex items-center space-x-2 bg-gray-700/50 border border-gray-600 rounded-xl p-2">
       
          <div className="flex-1 relative">
            <input
              type="text"
              readOnly
              placeholder="Start date"
              value={formattedStartDate}
              onClick={(e) => {
                e.stopPropagation();
                setActiveField(activeField === "start" ? null : "start");
              }}
              className={`bg-transparent text-white w-full focus:outline-none cursor-pointer p-2 rounded-lg transition ${
                activeField === "start"
                  ? "border border-fuchsia-500 bg-gray-700"
                  : "border border-transparent"
              }`}
            />
            {formattedStartDate && (
              <button
                type="button"
                onClick={(e) => handleClearDate("start", e)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
            {activeField === "start" && (
              <CalendarPicker
                date={startDate}
                onSelect={handleDateSelect}
                onClose={() => setActiveField(null)}
                position="start"
              />
            )}
          </div>

          <span className="text-gray-400">
            <ArrowRight size={18} />
          </span>

          <div className="flex-1 relative">
            <input
              type="text"
              readOnly
              placeholder="End date"
              value={formattedEndDate}
              onClick={(e) => {
                e.stopPropagation();
                setActiveField(activeField === "end" ? null : "end");
              }}
              className={`bg-transparent text-white w-full focus:outline-none cursor-pointer p-2 rounded-lg transition ${
                activeField === "end"
                  ? "border border-fuchsia-500 bg-gray-700"
                  : "border border-transparent"
              }`}
            />
            {formattedEndDate && (
              <button
                type="button"
                onClick={(e) => handleClearDate("end", e)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
            {activeField === "end" && (
              <CalendarPicker
                date={endDate}
                onSelect={handleDateSelect}
                onClose={() => setActiveField(null)}
                position="end"
              />
            )}
          </div>

          <Calendar size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};