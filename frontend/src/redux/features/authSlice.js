import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import toast from "react-hot-toast";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const generateInviteCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTemporaryPassword = () => {
  return (
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
  );
};

export const createSubUser = createAsyncThunk(
  "auth/createSubUser",
  async ({ name, email, mobile }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user || !user.uid) throw new Error("Primary user not authenticated");

      if (!email) {
        throw new Error("Email is required to create a sub-user account");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      const inviteCode = generateInviteCode();
      const temporaryPassword = generateTemporaryPassword();

      const subUserData = {
        name,
        email: email.toLowerCase().trim(),
        mobile: mobile || "",
        inviteCode,
        temporaryPassword,
        primaryUserId: user.uid,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        isActive: true,
        userType: "sub-user",
        authAccountCreated: false,
        passwordChanged: false,
      };

      const subUserRef = await addDoc(collection(db, "subUsers"), subUserData);

      const primaryUserRef = doc(db, "users", user.uid);
      const primaryUserDoc = await getDoc(primaryUserRef);
      const existingSubUsers = primaryUserDoc.data()?.subUsers || [];

      await setDoc(
        primaryUserRef,
        {
          subUsers: [...existingSubUsers, subUserRef.id],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      toast.success(`Sub-user created successfully!`);

      return {
        id: subUserRef.id,
        ...subUserData,
      };
    } catch (error) {
      console.error("Error creating sub-user:", error);
      toast.error(error.message || "Failed to create sub-user");
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubUsers = createAsyncThunk(
  "auth/fetchSubUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user || !user.uid) throw new Error("User not authenticated");

      const q = query(
        collection(db, "subUsers"),
        where("primaryUserId", "==", user.uid),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const subUsers = [];
      querySnapshot.forEach((doc) => {
        subUsers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return subUsers;
    } catch (error) {
      console.error("Error fetching sub-users:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const cleanEmail = email.toLowerCase().trim();

      const subUserQuery = query(
        collection(db, "subUsers"),
        where("email", "==", cleanEmail),
        where("isActive", "==", true)
      );
      const subUserSnapshot = await getDocs(subUserQuery);

      if (!subUserSnapshot.empty) {
        const subUserDoc = subUserSnapshot.docs[0];
        const subUserData = subUserDoc.data();

        if (!subUserData.authAccountCreated) {
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              cleanEmail,
              password
            );

            await updateProfile(userCredential.user, {
              displayName: subUserData.name,
            });

            await setDoc(
              doc(db, "subUsers", subUserDoc.id),
              {
                authUid: userCredential.user.uid,
                authAccountCreated: true,
                passwordChanged: password !== subUserData.temporaryPassword,
                firstLoginAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );

            toast.success(
              `Welcome, ${subUserData.name}! Your account has been activated.`
            );

            return {
              user: {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                emailVerified: userCredential.user.emailVerified,
                photoURL: userCredential.user.photoURL || null,
              },
              userType: "sub-user",
              subUserData: {
                id: subUserDoc.id,
                ...subUserData,
                authUid: userCredential.user.uid,
                authAccountCreated: true,
              },
              primaryUserId: subUserData.primaryUserId,
            };
          } catch (authError) {
            console.error("Error creating Auth account:", authError);

            if (authError.code === "auth/email-already-in-use") {

              try {
                const userCredential = await signInWithEmailAndPassword(
                  auth,
                  cleanEmail,
                  password
                );

                await setDoc(
                  doc(db, "subUsers", subUserDoc.id),
                  {
                    authUid: userCredential.user.uid,
                    authAccountCreated: true,
                    updatedAt: new Date().toISOString(),
                  },
                  { merge: true }
                );

                toast.success(`Welcome back, ${subUserData.name}!`);

                return {
                  user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    emailVerified: userCredential.user.emailVerified,
                    photoURL: userCredential.user.photoURL || null,
                  },
                  userType: "sub-user",
                  subUserData: {
                    id: subUserDoc.id,
                    ...subUserData,
                    authUid: userCredential.user.uid,
                  },
                  primaryUserId: subUserData.primaryUserId,
                };
              } catch (signInError) {
                throw signInError;
              }
            }
            throw authError;
          }
        } else {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            cleanEmail,
            password
          );

          toast.success(`Welcome back, ${subUserData.name}!`);

          return {
            user: {
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              displayName: userCredential.user.displayName,
              emailVerified: userCredential.user.emailVerified,
              photoURL: userCredential.user.photoURL || null,
            },
            userType: "sub-user",
            subUserData: {
              id: subUserDoc.id,
              ...subUserData,
            },
            primaryUserId: subUserData.primaryUserId,
          };
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
        const firebaseUser = userCredential.user;

        const primaryUserDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = primaryUserDoc.exists() ? primaryUserDoc.data() : {};

        toast.success(`Welcome back, ${firebaseUser.displayName || "User"}!`);

        return {
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL || null,
          },
          userType: "primary",
          personalInfo: userData.personalInfo || {},
          companyInfo: userData.companyInfo || {},
        };
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "Incorrect email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const switchToSubUser = createAsyncThunk(
  "auth/switchToSubUser",
  async (inviteCode, { getState, rejectWithValue }) => {
    try {
      const { user, userType } = getState().auth;

      if (userType !== "primary") {
        throw new Error("Only primary users can switch to sub-user accounts");
      }

      if (!user || !user.uid) throw new Error("Primary user not authenticated");

      const q = query(
        collection(db, "subUsers"),
        where("inviteCode", "==", inviteCode),
        where("primaryUserId", "==", user.uid),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid invite code or sub-user not found");
      }

      const subUserDoc = querySnapshot.docs[0];
      const subUserData = {
        id: subUserDoc.id,
        ...subUserDoc.data(),
      };

      toast.success(`Switched to ${subUserData.name}'s profile`);
      return subUserData;
    } catch (error) {
      console.error("Error switching to sub-user:", error);
      toast.error(error.message || "Failed to switch user");
      return rejectWithValue(error.message);
    }
  }
);

export const switchToPrimaryUser = createAsyncThunk(
  "auth/switchToPrimaryUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userType, user } = getState().auth;

      if (userType !== "primary") {
        throw new Error(
          "You do not have permission to switch to primary account"
        );
      }

      if (!user) throw new Error("No user logged in");

      toast.success("Switched back to primary account");
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || null,
      };
    } catch (error) {
      console.error("Error switching to primary user:", error);
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: displayName || "",
        userType: "primary",
        createdAt: new Date().toISOString(),
        personalInfo: {},
        companyInfo: {},
        subUsers: [],
      });

      await sendEmailVerification(user);
      toast.success("Account created! Please verify your email.");

      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName || "",
        emailVerified: user.emailVerified,
        userType: "primary",
      };
    } catch (error) {
      toast.error(error.message || "Signup failed");
      return rejectWithValue(error.message);
    }
  }
);

export const updateSubUserInfo = createAsyncThunk(
  "auth/updateSubUserInfo",
  async ({ subUserId, updates }, { getState, rejectWithValue }) => {
    try {
      const { userType, user, currentSubUser } = getState().auth;

      if (userType === "sub-user") {
        if (currentSubUser?.id !== subUserId) {
          throw new Error("You can only update your own information");
        }
      }

      const subUserRef = doc(db, "subUsers", subUserId);
      await setDoc(subUserRef, updates, { merge: true });

      if (updates.password) {
        const subUserAuth = auth.currentUser;
        if (subUserAuth && subUserAuth.uid === subUserId) {
          await updatePassword(subUserAuth, updates.password);
          await setDoc(subUserRef, { passwordChanged: true }, { merge: true });
        }
      }

      toast.success("Information updated successfully!");
      return { subUserId, updates };
    } catch (error) {
      console.error("Error updating sub-user:", error);
      toast.error(error.message || "Failed to update information");
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ firstName, lastName, email }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const fullName = `${firstName?.trim() || ""} ${
        lastName?.trim() || ""
      }`.trim();
      await updateProfile(user, { displayName: fullName });

      toast.success("Profile updated!");
      return {
        uid: user.uid,
        displayName: fullName,
        email: email || user.email,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Profile update failed");
      return rejectWithValue(error.message);
    }
  }
);

export const signOutUser = createAsyncThunk("auth/signOutUser", async () => {
  await signOut(auth);
  toast.success("Signed out successfully");
});

export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");
      await user.reload();
      const refreshedUser = auth.currentUser;
      return {
        uid: refreshedUser.uid,
        email: refreshedUser.email,
        displayName: refreshedUser.displayName,
        emailVerified: refreshedUser.emailVerified,
        photoURL: refreshedUser.photoURL || null,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveUserProfile = createAsyncThunk(
  "auth/saveUserProfile",
  async ({ uid, personalInfo, companyInfo }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, { personalInfo, companyInfo }, { merge: true });
      return { personalInfo, companyInfo };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (uid, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return { personalInfo: {}, companyInfo: {} };
      return docSnap.data();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePersonalInfo = createAsyncThunk(
  "auth/updatePersonalInfo",
  async ({ mobile }, { getState, rejectWithValue }) => {
    try {
      const { user, userType, currentSubUser } = getState().auth;
      if (!user || !user.uid) throw new Error("User not authenticated.");

      const personalInfoUpdate = { mobile };

      if (userType === "primary") {
        const docRef = doc(db, "users", user.uid);
        await setDoc(
          docRef,
          { personalInfo: personalInfoUpdate },
          { merge: true }
        );
      } else {
        // Update sub-user info
        const docRef = doc(db, "subUsers", currentSubUser.id);
        await setDoc(docRef, { mobile }, { merge: true });
      }

      toast.success("Mobile number updated successfully!");
      return personalInfoUpdate;
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error(error.message || "Failed to save personal info.");
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPassword = createAsyncThunk(
  "auth/updateUserPassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in.");

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast.success("Password updated successfully!");
      return;
    } catch (error) {
      console.error("Password update error:", error);
      let errorMessage = "Password update failed. Please try again.";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "Incorrect current password. Please try again.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage =
          "Please log out and log back in to change your password.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Choose a stronger password.";
      }
      toast.error(errorMessage);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserAvatar = createAsyncThunk(
  "auth/updateUserAvatar",
  async (photoUrl, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in.");

      await updateProfile(user, { photoURL: photoUrl });
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { photoURL: photoUrl }, { merge: true });

      toast.success("Profile picture updated!");
      return photoUrl;
    } catch (error) {
      console.error("Error updating avatar with URL:", error);
      toast.error("Failed to update profile picture. Try again.");
      return rejectWithValue(error.message);
    }
  }
);

export const updateCompanyInfo = createAsyncThunk(
  "auth/updateCompanyInfo",
  async (companyData, { getState, rejectWithValue }) => {
    try {
      const { user, userType } = getState().auth;
      if (!user || !user.uid) throw new Error("User not authenticated.");

      if (userType !== "primary") {
        throw new Error("Only primary users can update company information");
      }

      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { companyInfo: companyData }, { merge: true });

      toast.success("Company information updated successfully!");
      return companyData;
    } catch (error) {
      console.error("Error updating company info:", error);
      toast.error(error.message || "Failed to save company info.");
      return rejectWithValue(error.message);
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  user: null,
  userType: null, // "primary" or "sub-user"
  personalInfo: {},
  companyInfo: {},
  loading: false,
  error: null,
  subUsers: [],
  currentSubUser: null, // Only when primary user views as sub-user
  isPrimaryUser: true,
  activeUserId: null,
  activeUserName: null,
  primaryUserId: null, // For sub-users, stores their primary user's ID
};

// ==================== SLICE ====================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCompanyInfo: (state, action) => {
      state.companyInfo = action.payload;
    },
    clearAuthState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN USER
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.userType = action.payload.userType;
        state.activeUserId = action.payload.user.uid;
        state.activeUserName = action.payload.user.displayName;

        if (action.payload.userType === "primary") {
          state.isPrimaryUser = true;
          state.personalInfo = action.payload.personalInfo;
          state.companyInfo = action.payload.companyInfo;
          state.currentSubUser = null;
        } else {
          state.isPrimaryUser = false;
          state.currentSubUser = action.payload.subUserData;
          state.primaryUserId = action.payload.primaryUserId;
          state.activeUserName = action.payload.subUserData.name;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // SIGN UP
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = "primary";
        state.isPrimaryUser = true;
        state.activeUserId = action.payload.uid;
        state.activeUserName = action.payload.displayName;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // CREATE SUB-USER
      .addCase(createSubUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubUser.fulfilled, (state, action) => {
        state.loading = false;
        state.subUsers.push(action.payload);
      })
      .addCase(createSubUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH SUB-USERS
      .addCase(fetchSubUsers.fulfilled, (state, action) => {
        state.subUsers = action.payload;
      })
      // SWITCH TO SUB-USER
      .addCase(switchToSubUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(switchToSubUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubUser = action.payload;
        // Note: userType remains "primary" - this is just a view
        state.activeUserId = action.payload.id;
        state.activeUserName = action.payload.name;
      })
      .addCase(switchToSubUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // SWITCH BACK TO PRIMARY
      .addCase(switchToPrimaryUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(switchToPrimaryUser.fulfilled, (state) => {
        state.loading = false;
        state.currentSubUser = null;
        state.activeUserId = state.user.uid;
        state.activeUserName = state.user.displayName;
      })
      .addCase(switchToPrimaryUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE PROFILE
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        if (state.userType === "primary" && !state.currentSubUser) {
          state.activeUserName = action.payload.displayName;
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // SIGN OUT
      .addCase(signOutUser.fulfilled, (state) => {
        return initialState;
      })
      // REFRESH USER
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      // SAVE USER PROFILE
      .addCase(saveUserProfile.fulfilled, (state, action) => {
        state.personalInfo = action.payload.personalInfo;
        state.companyInfo = action.payload.companyInfo;
      })
      // FETCH USER PROFILE
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.personalInfo = action.payload.personalInfo || {};
        state.companyInfo = action.payload.companyInfo || {};
      })
      // UPDATE PERSONAL INFO
      .addCase(updatePersonalInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonalInfo.fulfilled, (state, action) => {
        state.loading = false;
        if (state.userType === "primary") {
          state.personalInfo = { ...state.personalInfo, ...action.payload };
        } else {
          state.currentSubUser = { ...state.currentSubUser, ...action.payload };
        }
      })
      .addCase(updatePersonalInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE PASSWORD
      .addCase(updateUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE AVATAR
      .addCase(updateUserAvatar.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.photoURL = action.payload;
        }
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE SUB-USER INFO
      .addCase(updateSubUserInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subUsers.findIndex(
          (u) => u.id === action.payload.subUserId
        );
        if (index !== -1) {
          state.subUsers[index] = {
            ...state.subUsers[index],
            ...action.payload.updates,
          };
        }
        if (state.currentSubUser?.id === action.payload.subUserId) {
          state.currentSubUser = {
            ...state.currentSubUser,
            ...action.payload.updates,
          };
          if (action.payload.updates.name) {
            state.activeUserName = action.payload.updates.name;
          }
        }
      })
      .addCase(updateSubUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE COMPANY INFO
      .addCase(updateCompanyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.companyInfo = { ...state.companyInfo, ...action.payload };
      })
      .addCase(updateCompanyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCompanyInfo, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
