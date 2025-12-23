import { useRef, useState } from "react";
import { Pencil, Phone, Mail, Lock, User, Loader2 } from "lucide-react";
import { PersonalInfoModal } from "./modal/PersonalInfoModal";
import { useDispatch, useSelector } from "react-redux";
import { updateUserAvatar } from "../../../redux/features/authSlice";
import {
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../../config/cloudinaryConfig";
import toast from "react-hot-toast";
import axios from "axios";
import imageCompression from 'browser-image-compression';

const InfoItem = ({ title, value, icon, isProtected = false, onEditClick }) => (
  <div className="flex items-center justify-between p-4 rounded-lg bg-v-glass-hover">
    <div className="flex items-center">
      <div className="text-v-accent mr-4">{icon}</div>
      <div>
        <p className="text-sm text-v-text-secondary">{title}</p>
        <p
          className={`font-semibold text-v-text-primary ${
            isProtected ? "tracking-widest" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

export const PersonalInfo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    user: { email, displayName, photoURL, loading: authLoading },
    personalInfo,
  } = useSelector((state) => state.auth);
  const handleEditClick = () => setIsModalOpen(true);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = null;
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      file = await imageCompression(file, {
        maxSizeMB: 1, 
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading avatar to Cloudinary...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.loading(`Uploading... ${percent}%`, { id: toastId });
          }
        },
      });

      const newPhotoUrl = response.data.secure_url;
      await dispatch(updateUserAvatar(newPhotoUrl)).unwrap();

      toast.dismiss(toastId);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.dismiss(toastId);

      if (error.code === "ECONNABORTED") {
        toast.error("Upload timed out. Try a smaller image.");
      } else if (error.response) {
        toast.error(
          `Upload failed: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        toast.error(error.message || "Upload failed. Please try again.");
      }

      console.error("Avatar upload error:", error);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const currentLoading = authLoading || isUploading;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-v-text-primary">
        Personal Info
      </h2>

      <div className="bg-v-glass backdrop-blur-lg border border-white/10 p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center border-b border-white/10 pb-8 mb-8">
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <div className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center font-bold text-4xl text-v-dark flex-shrink-0">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="rounded-full h-full w-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-purple-500/40">
                  <User className="w-10 h-10" />
                </div>
              )}
              {currentLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={authLoading}
            />

            <button
              onClick={() => fileInputRef.current.click()}
              disabled={currentLoading}
              className="absolute -bottom-1 -right-1 bg-v-accent p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil size={16} className="text-white" />
            </button>
          </div>
          <div className="flex-grow text-center sm:text-left">
            <h3 className="text-3xl font-bold text-v-text-primary">
              {displayName}
            </h3>
            <p className="text-v-text-secondary">{email}</p>
          </div>
          <button
            onClick={handleEditClick}
            className="mt-4 sm:mt-0 bg-v-accent text-white font-semibold py-2 px-5 rounded-lg hover:bg-v-accent/80 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            title="Mobile Number"
            value={personalInfo?.mobile || "91xxx-xxxx"}
            icon={<Phone size={24} />}
            onEditClick={handleEditClick}
          />
          <InfoItem
            title="Email ID"
            value={email}
            icon={<Mail size={24} />}
            onEditClick={handleEditClick}
          />
          <div className="md:col-span-2">
            <InfoItem
              title="Password"
              value="••••••••••••"
              isProtected={true}
              icon={<Lock size={24} />}
              onEditClick={handleEditClick}
            />
          </div>
        </div>
      </div>
      <PersonalInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={{
          name: displayName,
          email: email,
          mobile: personalInfo?.mobile,
        }}
      />
    </div>
  );
};
