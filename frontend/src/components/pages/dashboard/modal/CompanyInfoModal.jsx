import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  Building2,
  Briefcase,
  Users,
  MapPin,
  CheckCircle2,
  Globe,
  Wallet,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateCompanyInfo } from "../../../../redux/features/authSlice";
import toast from "react-hot-toast";

export const CompanyInfoModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { companyInfo, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    companyName: "",
    represents: "Accounting Firm",
    profession: "Other",
    employees: "1",
    gstNumber: "",
    noGst: false,
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
  });

  const [gstDisabled, setGstDisabled] = useState(false);

  useEffect(() => {
    if (companyInfo) {
      setFormData((prev) => ({
        ...prev,
        companyName: companyInfo.companyName || "",
        represents: companyInfo.represents || "Accounting Firm",
        profession: companyInfo.profession || "Other",
        employees: companyInfo.employees || "1",
        gstNumber: companyInfo.gstNumber || "",
        noGst: companyInfo.noGst || false,
        address: companyInfo.address || "",
        pincode: companyInfo.pincode || "",
        city: companyInfo.city || "",
        state: companyInfo.state || "",
        country: companyInfo.country || "India",
      }));
      setGstDisabled(companyInfo.noGst || false);
    }
  }, [companyInfo]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
      if (name === "noGst") {
        setGstDisabled(checked);
        if (checked) setFormData((prev) => ({ ...prev, gstNumber: "" }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRepresentsChange = (val) => {
    setFormData({ ...formData, represents: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state ||
      !formData.pincode.trim()
    ) {
      toast.error("Please fill in all address fields");
      return;
    }

    try {
      await dispatch(updateCompanyInfo(formData)).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update company info:", error);
    }
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              Edit Company Details
            </h2>
            <p className="text-sm text-zinc-400">
              Update your public profile information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="company-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400">
                Who do you represent?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Accounting Firm", "Business"].map((type) => (
                  <div
                    key={type}
                    onClick={() => handleRepresentsChange(type)}
                    className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      formData.represents === type
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        formData.represents === type
                          ? "border-violet-500"
                          : "border-zinc-600"
                      }`}
                    >
                      {formData.represents === type && (
                        <div className="w-2.5 h-2.5 bg-violet-500 rounded-full" />
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        formData.represents === type
                          ? "text-white"
                          : "text-zinc-400"
                      }`}
                    >
                      {type}
                    </span>
                    {formData.represents === type && (
                      <CheckCircle2
                        className="absolute right-4 text-violet-500"
                        size={18}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputGroup label="Company Name" required>
                  <ModernInput
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Corp"
                    icon={Building2}
                  />
                </InputGroup>
              </div>

              <InputGroup label="Profession" required>
                <ModernSelect
                  options={["Other", "IT", "Finance", "Developer"]}
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                  placeholder="Select Profession"
                  icon={Briefcase}
                />
              </InputGroup>

              <InputGroup label="Team Size" required>
                <ModernSelect
                  options={["1", "2-10", "11-50", "50+"]}
                  value={formData.employees}
                  onChange={(e) =>
                    setFormData({ ...formData, employees: e.target.value })
                  }
                  placeholder="Select Size"
                  icon={Users}
                />
              </InputGroup>

              <div className="md:col-span-2">
                <InputGroup
                  label="GST Number"
                  subLabel={
                    <label className="inline-flex items-center gap-2 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          formData.noGst
                            ? "bg-violet-500 border-violet-500"
                            : "border-zinc-600 group-hover:border-zinc-500"
                        }`}
                      >
                        {formData.noGst && (
                          <CheckCircle2 size={12} className="text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        name="noGst"
                        checked={formData.noGst}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        I don't have a GST Number
                      </span>
                    </label>
                  }
                >
                  <ModernInput
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    disabled={gstDisabled}
                    icon={Wallet}
                    style={{ opacity: gstDisabled ? 0.5 : 1 }}
                  />
                </InputGroup>
              </div>
            </div>

            <div className="w-full h-px bg-zinc-800" />

            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <InputGroup label="Full Address" required>
                    <ModernInput
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address, Suite, Unit"
                      icon={MapPin}
                    />
                  </InputGroup>
                </div>

                <InputGroup label="City" required>
                  <ModernInput
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </InputGroup>

                <InputGroup label="Pincode" required>
                  <ModernInput
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                  />
                </InputGroup>

                <InputGroup label="State" required>
                  <ModernSelect
                    options={["Delhi", "Maharashtra", "Karnataka"]}
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="Select State"
                  />
                </InputGroup>

                <InputGroup label="Country" required>
                  <ModernSelect
                    options={["India"]}
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="Select Country"
                    icon={Globe}
                  />
                </InputGroup>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="company-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, required, children, subLabel }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-zinc-400">
      {label} {required && <span className="text-violet-400">*</span>}
    </label>
    {children}
    {subLabel && <div className="mt-1">{subLabel}</div>}
  </div>
);

const ModernInput = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    {Icon && (
      <Icon
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors"
      />
    )}
    <input
      {...props}
      className={`w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 ${
        Icon ? "pl-10 pr-3" : "px-3"
      }`}
    />
  </div>
);

const ModernSelect = ({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => (
  <div className="relative group">
    {Icon && (
      <Icon
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors z-10"
      />
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg py-2.5 text-zinc-100 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 cursor-pointer ${
        Icon ? "pl-10 pr-10" : "px-3 pr-10"
      }`}
    >
      <option value="" disabled className="bg-zinc-900">
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-zinc-900">
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown
      size={18}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
    />
  </div>
);
