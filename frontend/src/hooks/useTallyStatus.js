import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendTallyRequest } from "../utils/tallyUtils";
import { setTallyConnected } from "../redux/features/dashboardSlice";

export function useTallyStatus(pollInterval = 1000) {
  const dispatch = useDispatch();
  const { isTallyConnected } = useSelector((state) => state.dashboard);

  const pollTallyStatus = async () => {
    const requestXml = `
      <ENVELOPE>
        <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME></REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;

    try {
      await sendTallyRequest(requestXml);
      if (!isTallyConnected) dispatch(setTallyConnected(true));
    } catch (error) {
      if (isTallyConnected) dispatch(setTallyConnected(false));
    }
  };

  useEffect(() => {
    pollTallyStatus();
    const interval = setInterval(pollTallyStatus, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return { isTallyConnected, pollTallyStatus };
}
