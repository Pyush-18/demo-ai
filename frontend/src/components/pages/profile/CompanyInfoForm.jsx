import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCompanyInfo } from "../../../redux/features/authSlice.js";
import toast from "react-hot-toast";
import { ChevronDown, Loader2 } from "lucide-react";
const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-v-text-secondary mb-2">
      {label}
      {required && <span className="text-v-accent">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-v-glass-hover border border-white/20 rounded-lg py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-v-accent text-v-text-primary"
      >
        <option value="" disabled className="bg-v-dark text-v-text-secondary">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt}
            value={opt}
            className="bg-v-dark text-v-text-primary"
          >
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={20}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-v-text-secondary pointer-events-none"
      />
    </div>
  </div>
);

export const CompanyInfoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    represents: "Accounting Firm",
    profession: "",
    employees: "",
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.profession || !formData.employees) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      dispatch(setCompanyInfo(formData));
      await onSubmit(formData);
      toast.success("Company info saved successfully!");
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-v-text-primary">
          3. Fill Company Information
        </h1>
        <p className="text-v-text-secondary mt-1">
          Just a few more details about your business.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-grow flex flex-col space-y-6"
      >
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-v-text-secondary mb-2"
          >
            Company Name<span className="text-v-accent">*</span>
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={handleInputChange}
            id="companyName"
            name="companyName"
            placeholder="Company Name"
            required
            className="w-full bg-v-glass-hover border border-white/20 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-v-accent text-v-text-primary placeholder-v-text-secondary/70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-v-text-secondary mb-3">
            What represents you best?
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="represents"
                value="Accounting Firm"
                checked={formData.represents === "Accounting Firm"}
                onChange={handleInputChange}
                className="hidden"
              />
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.represents === "Accounting Firm"
                    ? "border-v-accent"
                    : "border-v-text-secondary/50"
                }`}
              >
                {formData.represents === "Accounting Firm" && (
                  <span className="w-2.5 h-2.5 bg-v-accent rounded-full"></span>
                )}
              </span>
              <span className="ml-3 text-v-text-primary">Accounting Firm</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="represents"
                value="Business"
                checked={formData.represents === "Business"}
                onChange={handleInputChange}
                className="hidden"
              />
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.represents === "Business"
                    ? "border-v-accent"
                    : "border-v-text-secondary/50"
                }`}
              >
                {formData.represents === "Business" && (
                  <span className="w-2.5 h-2.5 bg-v-accent rounded-full"></span>
                )}
              </span>
              <span className="ml-3 text-v-text-primary">Business</span>
            </label>
          </div>
        </div>

        <CustomSelect
          label="Profession"
          required={true}
          options={["Accountant", "Developer", "Designer", "Manager", "Other"]}
          value={formData.profession}
          onChange={(e) =>
            setFormData({ ...formData, profession: e.target.value })
          }
          placeholder="Profession"
        />
        <CustomSelect
          label="No of Employees"
          required={true}
          options={["1-10", "11-50", "51-200", "201-500", "500+"]}
          value={formData.employees}
          onChange={(e) =>
            setFormData({ ...formData, employees: e.target.value })
          }
          placeholder="Employees"
        />

        <div className="mt-auto pt-6">
          <button
            type="submit"
            className="w-full bg-v-accent text-white justify-center font-bold py-3 px-6 rounded-lg hover:bg-v-accent/80 transition-colors duration-300 flex items-center gap-3"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin mr-2 w-5 h-5" />}
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};
