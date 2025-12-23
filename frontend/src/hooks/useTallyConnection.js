import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTallyConnected } from "../redux/features/dashboardSlice.js";
import { sendTallyRequest } from "../utils/tallyUtils.js";
import toast from "react-hot-toast";

export function useTallyConnection() {
  const dispatch = useDispatch();
  const { isTallyConnected } = useSelector((state) => state.dashboard);

  const toggleTallyConnection = useCallback(async () => {
    if (isTallyConnected) {
      dispatch(setTallyConnected(false));
      toast.success("🔌 Tally disconnected successfully.");
      return;
    }

    const testXml = `
      <ENVELOPE>
        <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>List of Companies</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>`;

    try {
      const response = await sendTallyRequest(testXml);

      if (response?.length > 0) {
        dispatch(setTallyConnected(true));
        toast.success("Connected to Tally successfully!");
      } else {
        throw new Error("Empty response from Tally");
      }
    } catch (error) {
      dispatch(setTallyConnected(false));
      toast.error(
        "Unable to connect to Tally. Please ensure Tally Prime or the Connector is open."
      );
      console.error("Tally connection failed:", error);
    }
  }, [isTallyConnected, dispatch]);

  return {
    isTallyConnected,
    toggleTallyConnection,
  };
}
