import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import tallyReducer from "../features/tallySlice";
import authReducer from "../features/authSlice";
import dashboardReducer from "../features/dashboardSlice";

const rootReducer = combineReducers({
  tally: tallyReducer,
  auth: authReducer,
  dashboard: dashboardReducer,
});

const persistConfig = {
  key: "root",
  storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
