import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { FormInput } from "../../index.js";
import { useLocation } from "react-router";
import { useEffect } from "react";
import { auth } from "../../../firebase.js";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import { updateUserProfile } from "../../../redux/features/authSlice.js";
import { useDispatch } from "react-redux";

export const PersonalInfoForm = ({ onNext }) => {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    loading: false,
  });
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailFromUrl = searchParams.get("email") || "";
    setFormData((prev) => ({ ...prev, email: emailFromUrl }));
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, loading: true }));
    const { firstName, lastName, email } = formData;
    const user = auth.currentUser;

    if (!user) {
      toast.error("No authenticated user found. Please log in again.");
      setFormData((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile(user, { displayName: fullName });
      dispatch(
        updateUserProfile({ firstName, lastName, email, displayName: fullName })
      );

      toast.success("Profile updated successfully!");
      onNext({ firstName, lastName, fullName, email });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setFormData((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-v-text-primary">
          Fill Personal Info
        </h1>
        <p className="text-v-text-secondary mt-1">Let's get you set up.</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-grow flex flex-col space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput
            value={formData.firstName}
            id="firstName"
            name="firstName"
            label="First Name"
            type="text"
            placeholder="First Name"
            required
            onChange={handleChange}
          />
          <FormInput
            value={formData.lastName}
            id="lastName"
            name="lastName"
            label="Last Name"
            type="text"
            placeholder="Last Name"
            required
            onChange={handleChange}
          />
        </div>
        <FormInput
          value={formData.email}
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Email"
          required
          disabled
        />

        <div className="mt-auto pt-6">
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-v-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-v-accent/80 transition-colors duration-300"
            disabled={formData.loading}
          >
            {formData.loading && (
              <Loader2 className="animate-spin mr-2 w-5 h-5" />
            )}
            Proceed
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};
