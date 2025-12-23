import { useState } from "react";
import { frequentlyAskedQuestions } from "../../data/index.js";
import { ChevronDown } from "lucide-react";

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <section id="faq" className="py-24 relative z-10 max-w-5xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Answers to common questions about entry consumption and plans.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {frequentlyAskedQuestions.map((item, index) => (
          <div
            key={item.question}
            className={`rounded-xl overflow-hidden shadow-xl transition-all duration-300 ${
              openIndex === index
                ? "bg-black/40 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                : "bg-gray-900/70 border border-purple-800/50 hover:border-purple-500/70"
            }`}
          >
            <button
              className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span
                className={`text-lg font-semibold transition-colors duration-300 ${
                  openIndex === index ? "text-white" : "text-gray-200"
                }`}
              >
                {item.question}
              </span>
              <ChevronDown
                className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
                  openIndex === index
                    ? "rotate-180 text-pink-400"
                    : "text-purple-400"
                }`}
              />
            </button>

            <div
              id={`faq-answer-${index}`}
              role="region"
              className={`grid transition-all duration-500 ease-in-out ${
                openIndex === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p
                  className="px-6 pb-6 text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: item.answer.replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong class="text-pink-300">$1</strong>'
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};