import { createSlice } from "@reduxjs/toolkit";
import { Page } from "../../data";

const initialState = {
  activePage: Page.Dashboard,
  isSidebarOpen: false,
  isTallyConnected: false,
  activeCompany: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    toggleTallyConnection: (state) => {
      state.isTallyConnected = !state.isTallyConnected;
      if (!state.isTallyConnected) {
        state.activePage = Page.Dashboard;
      } else {
        state.activePage = Page.TallyDashboard;
      }
    },
    setTallyConnected: (state, action) => {
      state.isTallyConnected = action.payload;
    },
    setActiveCompany: (state, action) => {
      state.activeCompany = action.payload;
    },
    resetActiveCompany: (state) => {
      state.activeCompany = null;
    },
  },
});

export const {
  setActivePage,
  toggleSidebar,
  setSidebarOpen,
  toggleTallyConnection,
  setTallyConnected,
  setActiveCompany,
  resetActiveCompany,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
