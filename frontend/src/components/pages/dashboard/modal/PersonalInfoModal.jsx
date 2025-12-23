import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePersonalInfo,
  updateUserPassword,
} from "../../../../redux/features/authSlice";

const FormInput = ({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  readOnly,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-v-text-secondary mb-1"
    >
      {required && "*"}
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      readOnly={readOnly}
      className="w-full bg-v-glass-hover border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-v-accent"
    />
  </div>
);

export const PersonalInfoModal = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { user, personalInfo, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user || personalInfo) {
      setFormData((prev) => ({
        ...prev,
        name: user?.displayName || personalInfo?.displayName || "",
        email: user?.email || personalInfo?.email || "",
        mobile: personalInfo?.mobile || "",
      }));
    }
  }, [user, personalInfo]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { mobile, currentPassword, newPassword, confirmPassword } = formData;

    const originalMobile = personalInfo?.mobile || "";

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword && !currentPassword) {
      toast.error("Please enter your current password to set a new one.");
      return;
    }
    if (
      (newPassword || currentPassword || confirmPassword) &&
      (!newPassword || !currentPassword || !confirmPassword)
    ) {
      toast.error(
        "To change your password, you must fill out Current Password, New Password, and Confirm New Password."
      );
      return;
    }

    const isMobileChanged = mobile !== originalMobile;
    const isPasswordChangeAttempt = newPassword && currentPassword;

    if (!isMobileChanged && !isPasswordChangeAttempt) {
      toast("No changes were made.", { icon: "ℹ️" });
      onClose();
      return;
    }

    try {
      if (isMobileChanged) {
        await dispatch(
          updatePersonalInfo({
            mobile: mobile,
          })
        ).unwrap();
      }

      if (isPasswordChangeAttempt) {
        await dispatch(
          updateUserPassword({
            currentPassword,
            newPassword,
          })
        ).unwrap();
      }
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      onClose();
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-v-glass backdrop-blur-lg border border-white/10 rounded-2xl w-full max-w-lg m-4 p-6 sm:p-8 text-v-text-primary transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Personal Info</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-v-text-secondary hover:bg-v-glass-hover hover:text-v-text-primary"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <FormInput
            id="name"
            name="name"
            label="Full Name"
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleInputChange}
            required
            readOnly
          />
          <FormInput
            id="email"
            name="email"
            label="Email ID"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            readOnly
          />
          <FormInput
            id="mobile"
            name="mobile"
            label="Mobile Number"
            type="tel"
            placeholder="Your mobile number"
            value={formData.mobile}
            onChange={handleInputChange}
            required
          />

          <div className="pt-4 mt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-v-text-secondary mb-2">
              Change Password
            </h3>
            <p className="text-xs text-v-text-secondary/70 mb-4">
              Leave these fields blank if you don't want to change your
              password.
            </p>
            <div className="space-y-4">
              <FormInput
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleInputChange}
              />
              <FormInput
                id="newPassword"
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-v-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-v-accent/80 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
