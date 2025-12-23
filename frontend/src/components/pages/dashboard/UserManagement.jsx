import {
  User,
  Plus,
  Key,
  LogOut,
  Copy,
  Check,
  AlertCircle,
  EyeOff,
  Eye,
  Shield,
  Smartphone,
  Mail,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  createSubUser,
  fetchSubUsers,
  switchToSubUser,
  switchToPrimaryUser,
} from "../../../redux/features/authSlice";

export const UserManagement = () => {
  const dispatch = useDispatch();
  const {
    user,
    userType,
    personalInfo,
    subUsers,
    currentSubUser,
    isPrimaryUser,
    loading,
    activeUserName,
  } = useSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [inviteCode, setInviteCode] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState({});
  const [copiedPasswords, setCopiedPasswords] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    if (user?.uid && userType === "primary") {
      dispatch(fetchSubUsers());
    }
  }, [dispatch, user, userType]);

  const handleCreateSubUser = async () => {
    if (!newUserData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!newUserData.email.trim()) {
      toast.error("Email is required for sub-user authentication");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const result = await dispatch(createSubUser(newUserData));
    if (result.payload && result.payload.inviteCode) {
      setGeneratedCredentials({
        email: newUserData.email,
        password: result.payload.temporaryPassword,
        inviteCode: result.payload.inviteCode,
        name: newUserData.name,
      });
      setNewUserData({ name: "", email: "", mobile: "" });
    }
  };

  const handleSwitchToSubUser = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    const result = await dispatch(switchToSubUser(inviteCode));
    if (result.payload) {
      setShowSwitchModal(false);
      setInviteCode("");
    }
  };

  const handleSwitchToPrimary = () => {
    dispatch(switchToPrimaryUser());
  };

  const copyToClipboard = (text, type = "general", id = null) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");

    if (type === "code" && id) {
      setCopiedCodes({ ...copiedCodes, [id]: true });
      setTimeout(() => {
        setCopiedCodes({ ...copiedCodes, [id]: false });
      }, 2000);
    } else if (type === "inviteCode") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === "password") {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const displayedUser = () => {
    if (userType === "primary") {
      if (currentSubUser) {
        return {
          displayName: currentSubUser.name,
          email: currentSubUser.email,
          photoURL: null,
          mobile: currentSubUser.mobile,
          isViewingAsSubUser: true,
        };
      } else {
        return {
          displayName: user?.displayName,
          email: user?.email,
          photoURL: user?.photoURL,
          mobile: personalInfo?.mobile,
          isViewingAsSubUser: false,
        };
      }
    } else {
      return {
        displayName: currentSubUser?.name || user?.displayName,
        email: currentSubUser?.email || user?.email,
        photoURL: user?.photoURL,
        mobile: currentSubUser?.mobile || "",
        isViewingAsSubUser: false,
      };
    }
  };

  const currentDisplay = displayedUser();
  const activeDisplayName = activeUserName || currentDisplay.displayName || "User";
  const canManageSubUsers = userType === "primary" && !currentSubUser;
  const isViewingAsSubUser = userType === "primary" && currentSubUser;

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords({
      ...visiblePasswords,
      [userId]: !visiblePasswords[userId],
    });
  };

  const maskPassword = (password) => {
    return "•".repeat(password?.length || 8);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
    
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              User Management
            </h2>
            {(userType === "sub-user" || isViewingAsSubUser) && (
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {userType === "sub-user" ? "Sub-User Mode" : "Viewing Mode"}
              </span>
            )}
          </div>
          <p className="text-v-text-secondary mt-1 flex items-center gap-2 text-sm">
            Active Identity:{" "}
            <span className="text-white font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> {activeDisplayName}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isViewingAsSubUser ? (
            <button
              onClick={handleSwitchToPrimary}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-xl hover:bg-blue-600/30 transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Admin
            </button>
          ) : canManageSubUsers ? (
            <>
              <button
                onClick={() => setShowSwitchModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-v-text-primary rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
              >
                <Key className="w-4 h-4" />
                Switch View
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Create Sub-User
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
    
          <div className="relative group">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl">
              <div className="h-full w-full rounded-[14px] bg-gray-900 flex items-center justify-center overflow-hidden">
                {currentDisplay.photoURL ? (
                  <img
                    src={currentDisplay.photoURL}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {currentDisplay.displayName?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            {(userType === "sub-user" || isViewingAsSubUser) && (
              <div className="absolute -bottom-2 -right-2 bg-gray-900 p-1 rounded-full border border-white/10">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-1">
              <h3 className="text-sm uppercase tracking-wider text-v-text-secondary font-medium">Identity</h3>
              <p className="text-xl font-bold text-white">{currentDisplay.displayName || "N/A"}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-purple-400">
                <Shield className="w-3.5 h-3.5" />
                {userType === "primary" && !currentSubUser ? "Primary Admin" : "Sub-User Access"}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm uppercase tracking-wider text-v-text-secondary font-medium">Contact</h3>
              <div className="flex flex-col gap-1">
                <p className="text-v-text-primary flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {currentDisplay.email || "No email set"}
                </p>
                {currentDisplay.mobile && (
                  <p className="text-v-text-primary flex items-center justify-center md:justify-start gap-2">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    {currentDisplay.mobile}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm uppercase tracking-wider text-v-text-secondary font-medium">Credentials</h3>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className={`px-2.5 py-0.5 rounded text-sm font-mono border ${isViewingAsSubUser || (userType === "sub-user" && currentSubUser) ? "bg-purple-500/10 border-purple-500/30 text-purple-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}>
                   {isViewingAsSubUser || (userType === "sub-user" && currentSubUser) 
                      ? `Code: ${currentSubUser.inviteCode}` 
                      : "Admin Root Access"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {canManageSubUsers && subUsers.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              Managed Accounts
              <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-400">
                {subUsers.length}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subUsers.map((subUser) => (
              <div
                key={subUser.id}
                className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between"
              >
      
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-lg shadow-inner ring-2 ring-white/5">
                      {subUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg leading-tight">{subUser.name}</h4>
                      <p className="text-sm text-gray-400 mt-0.5">{subUser.email}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
                    subUser.authAccountCreated 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${subUser.authAccountCreated ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    {subUser.authAccountCreated ? "Active" : "Pending"}
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
               
                  <div className="flex items-center justify-between group/row">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Invite Code</span>
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-purple-300 tracking-wider">
                        {subUser.inviteCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(subUser.inviteCode, "code", subUser.id)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedCodes[subUser.id] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {!subUser.authAccountCreated && subUser.temporaryPassword && (
                    <div className="flex items-center justify-between group/row border-t border-white/5 pt-2">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Temp Pass</span>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-pink-300">
                                {visiblePasswords[subUser.id] ? subUser.temporaryPassword : maskPassword(subUser.temporaryPassword)}
                            </code>
                            <button
                                onClick={() => togglePasswordVisibility(subUser.id)}
                                className="text-gray-600 hover:text-gray-300 transition-colors"
                            >
                                {visiblePasswords[subUser.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                         </div>
                        <button
                          onClick={() => copyToClipboard(subUser.temporaryPassword, "password", subUser.id)}
                          className="text-gray-500 hover:text-white transition-colors"
                        >
                          {copiedPasswords[subUser.id] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-xl font-semibold text-white">
                {generatedCredentials ? "Account Generated" : "Create Sub-User"}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {generatedCredentials 
                  ? "Share these details securely with the user." 
                  : "Add a new user to your management dashboard."}
              </p>
            </div>

            <div className="p-6">
              {generatedCredentials ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                      <span className="text-sm text-gray-400">Login Email</span>
                      <span className="text-sm font-medium text-white">{generatedCredentials.email}</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-emerald-400/70 uppercase tracking-wide mb-1.5 block">Temporary Password</span>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2.5 border border-emerald-500/20">
                        <code className="text-emerald-300 font-mono tracking-wide">{generatedCredentials.password}</code>
                        <button
                          onClick={() => copyToClipboard(generatedCredentials.password, "password")}
                          className="p-1.5 hover:bg-emerald-500/10 rounded text-emerald-400 transition-colors"
                        >
                          {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-purple-400/70 uppercase tracking-wide mb-1.5 block">Admin Switch Code</span>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2.5 border border-purple-500/20">
                        <code className="text-purple-300 font-mono tracking-wide">{generatedCredentials.inviteCode}</code>
                        <button
                          onClick={() => copyToClipboard(generatedCredentials.inviteCode, "inviteCode")}
                          className="p-1.5 hover:bg-purple-500/10 rounded text-purple-400 transition-colors"
                        >
                          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs text-amber-400/80 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>The user must change their password upon first login.</span>
                  </div>

                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setGeneratedCredentials(null);
                      setCopiedCode(false);
                      setCopiedPassword(false);
                    }}
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <input
                      type="text"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <input
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="user@company.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Mobile (Optional)</label>
                    <input
                      type="tel"
                      value={newUserData.mobile}
                      onChange={(e) => setNewUserData({ ...newUserData, mobile: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewUserData({ name: "", email: "", mobile: "" });
                      }}
                      className="flex-1 py-3 bg-transparent border border-white/10 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateSubUser}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">Switch Profile</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Enter the 6-digit invite code to access the sub-user's dashboard view.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[0.2em] font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-gray-700"
                  placeholder="000000"
                  maxLength={6}
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSwitchModal(false);
                      setInviteCode("");
                    }}
                    className="flex-1 py-3 bg-transparent border border-white/10 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSwitchToSubUser}
                    disabled={loading}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? "Accessing..." : "Access View"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};