

import {
  generateFetchLedgersXML,
  generateFetchStockItemsXML,
  generateFetchCompaniesXML,
  generateSalesVoucherXML,
  generatePurchaseVoucherXML,
  generateBankingVoucherXML,
  generateBatchVouchersXML,
  parseLedgers,
  parseStockItems,
  parseCompanies,
  xmlToJson,
  getTallyError,
  validateInvoiceData,
  isTallyResponseSuccess,
} from './tallyUtils';

import {
  setLedgers,
  setBankLedgers,
  setAvailableCompanies,
  addToHistory,
  addToSavedTransactions,
  bulkAddToHistory,
  bulkAddToSavedTransactions,
} from '../redux/features/tallySlice';


const PROXY_URL = 'http://localhost:3000/tally';
const POLLING_INTERVAL = 5000;
const REQUEST_TIMEOUT = 30000; // 30 seconds

export const sendTallyRequest = async (xmlRequest, timeout = REQUEST_TIMEOUT) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xmlRequest,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy error: ${errorText}`);
    }

    return await response.text();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check if Tally is running.');
    }
    console.error('sendTallyRequest failed:', error);
    throw error;
  }
};


export const checkTallyConnection = async () => {
  try {
    const xml = generateFetchCompaniesXML();
    await sendTallyRequest(xml, 5000); 
    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};


export const fetchLedgersAndUpdate = (companyId) => async (dispatch) => {
  try {
    const xml = generateFetchLedgersXML();
    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

 
    if (jsonResponse.RESPONSE && jsonResponse.RESPONSE.STATUS?._text === "0") {
      throw new Error(getTallyError(jsonResponse));
    }


    const ledgerData = parseLedgers(jsonResponse);

    dispatch(setLedgers({ 
      companyId, 
      ledgers: ledgerData.allLedgers 
    }));

    dispatch(setBankLedgers({ 
      companyId, 
      bankLedgers: ledgerData.partyLedgers 
    }));

    return {
      success: true,
      data: ledgerData,
      companyName: jsonResponse?.ENVELOPE?.BODY?.EXPORTDATA?.REQUESTDESC?.STATICVARIABLES?.SVCURRENTCOMPANY?._text
    };
  } catch (error) {
    console.error('fetchLedgersAndUpdate failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


export const fetchStockItems = async () => {
  try {
    const xml = generateFetchStockItemsXML();
    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

    const stockItems = parseStockItems(jsonResponse);

    return {
      success: true,
      data: stockItems
    };
  } catch (error) {
    console.error('fetchStockItems failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


export const fetchCompaniesAndUpdate = () => async (dispatch) => {
  try {
    const xml = generateFetchCompaniesXML();
    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

    const companies = parseCompanies(jsonResponse);


    dispatch(setAvailableCompanies(companies));

    return {
      success: true,
      data: companies
    };
  } catch (error) {
    console.error('fetchCompaniesAndUpdate failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


export const postSalesInvoice = (invoiceData) => async (dispatch) => {
  try {
  
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

  
    const xml = generateSalesVoucherXML(invoiceData);

 
    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

   
    if (isTallyResponseSuccess(jsonResponse)) {
     
      dispatch(addToSavedTransactions({
        ...invoiceData,
        type: 'sales',
        tallyResponse: jsonResponse
      }));

     
      dispatch(addToHistory({
        ...invoiceData,
        type: 'sales',
        status: 'success',
        tallyResponse: jsonResponse
      }));

      return {
        success: true,
        voucherNo: invoiceData.voucherNo,
        response: jsonResponse
      };
    } else {
      const error = getTallyError(jsonResponse);
      
     
      dispatch(addToHistory({
        ...invoiceData,
        type: 'sales',
        status: 'failed',
        error: error
      }));

      return {
        success: false,
        error: error
      };
    }
  } catch (error) {
    console.error('postSalesInvoice failed:', error);
    
    
    dispatch(addToHistory({
      ...invoiceData,
      type: 'sales',
      status: 'failed',
      error: error.message
    }));

    return {
      success: false,
      error: error.message
    };
  }
};


export const postPurchaseInvoice = (invoiceData) => async (dispatch) => {
  try {
 
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

L
    const xml = generatePurchaseVoucherXML(invoiceData);

    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

 
    if (isTallyResponseSuccess(jsonResponse)) {
      
      dispatch(addToSavedTransactions({
        ...invoiceData,
        type: 'purchase',
        tallyResponse: jsonResponse
      }));

   
      dispatch(addToHistory({
        ...invoiceData,
        type: 'purchase',
        status: 'success',
        tallyResponse: jsonResponse
      }));

      return {
        success: true,
        voucherNo: invoiceData.voucherNo,
        response: jsonResponse
      };
    } else {
      const error = getTallyError(jsonResponse);
      
    
      dispatch(addToHistory({
        ...invoiceData,
        type: 'purchase',
        status: 'failed',
        error: error
      }));

      return {
        success: false,
        error: error
      };
    }
  } catch (error) {
    console.error('postPurchaseInvoice failed:', error);
    
  
    dispatch(addToHistory({
      ...invoiceData,
      type: 'purchase',
      status: 'failed',
      error: error.message
    }));

    return {
      success: false,
      error: error.message
    };
  }
};


export const postBankingTransaction = (transactionData) => async (dispatch) => {
  try {

    const xml = generateBankingVoucherXML(transactionData);

    
    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

    if (isTallyResponseSuccess(jsonResponse)) {
     
      dispatch(addToSavedTransactions({
        ...transactionData,
        type: 'banking',
        tallyResponse: jsonResponse
      }));

      
      dispatch(addToHistory({
        ...transactionData,
        type: 'banking',
        status: 'success',
        tallyResponse: jsonResponse
      }));

      return {
        success: true,
        voucherNo: transactionData.voucherNo,
        response: jsonResponse
      };
    } else {
      const error = getTallyError(jsonResponse);
      
      
      dispatch(addToHistory({
        ...transactionData,
        type: 'banking',
        status: 'failed',
        error: error
      }));

      return {
        success: false,
        error: error
      };
    }
  } catch (error) {
    console.error('postBankingTransaction failed:', error);
    
  
    dispatch(addToHistory({
      ...transactionData,
      type: 'banking',
      status: 'failed',
      error: error.message
    }));

    return {
      success: false,
      error: error.message
    };
  }
};


export const postBulkSalesInvoices = (invoicesData) => async (dispatch) => {
  try {
   
    const validInvoices = [];
    const invalidInvoices = [];

    invoicesData.forEach(invoice => {
      const validation = validateInvoiceData(invoice);
      if (validation.isValid) {
        validInvoices.push(invoice);
      } else {
        invalidInvoices.push({
          invoice,
          errors: validation.errors
        });
      }
    });

    if (validInvoices.length === 0) {
      return {
        success: false,
        error: 'No valid invoices to post',
        invalidInvoices
      };
    }

    const xml = generateBatchVouchersXML(validInvoices, 'Sales');


    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

    const created = parseInt(jsonResponse?.RESPONSE?.CREATED?._text || 0);

    if (created > 0) {
   
      dispatch(bulkAddToSavedTransactions(
        validInvoices.map(inv => ({
          ...inv,
          type: 'sales',
          tallyResponse: jsonResponse
        }))
      ));

  
      dispatch(bulkAddToHistory(
        validInvoices.map(inv => ({
          ...inv,
          type: 'sales',
          status: 'success',
          tallyResponse: jsonResponse
        }))
      ));

      return {
        success: true,
        created: created,
        total: validInvoices.length,
        invalidInvoices,
        response: jsonResponse
      };
    } else {
      const error = getTallyError(jsonResponse);
      
   
      dispatch(bulkAddToHistory(
        validInvoices.map(inv => ({
          ...inv,
          type: 'sales',
          status: 'failed',
          error: error
        }))
      ));

      return {
        success: false,
        error: error,
        invalidInvoices
      };
    }
  } catch (error) {
    console.error('postBulkSalesInvoices failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


export const postBulkPurchaseInvoices = (invoicesData) => async (dispatch) => {
  try {
    
    const validInvoices = [];
    const invalidInvoices = [];

    invoicesData.forEach(invoice => {
      const validation = validateInvoiceData(invoice);
      if (validation.isValid) {
        validInvoices.push(invoice);
      } else {
        invalidInvoices.push({
          invoice,
          errors: validation.errors
        });
      }
    });

    if (validInvoices.length === 0) {
      return {
        success: false,
        error: 'No valid invoices to post',
        invalidInvoices
      };
    }

    
    const xml = generateBatchVouchersXML(validInvoices, 'Purchase');


    const response = await sendTallyRequest(xml);
    const jsonResponse = xmlToJson(response);

    const created = parseInt(jsonResponse?.RESPONSE?.CREATED?._text || 0);

    if (created > 0) {
     
      dispatch(bulkAddToSavedTransactions(
        validInvoices.map(inv => ({
          ...inv,
          type: 'purchase',
          tallyResponse: jsonResponse
        }))
      ));

    
      dispatch(bulkAddToHistory(
        validInvoices.map(inv => ({
          ...inv,
          type: 'purchase',
          status: 'success',
          tallyResponse: jsonResponse
        }))
      ));

      return {
        success: true,
        created: created,
        total: validInvoices.length,
        invalidInvoices,
        response: jsonResponse
      };
    } else {
      const error = getTallyError(jsonResponse);
      
      
      dispatch(bulkAddToHistory(
        validInvoices.map(inv => ({
          ...inv,
          type: 'purchase',
          status: 'failed',
          error: error
        }))
      ));

      return {
        success: false,
        error: error,
        invalidInvoices
      };
    }
  } catch (error) {
    console.error('postBulkPurchaseInvoices failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

let pollingInterval = null;

export const startTallyPolling = (onStatusChange) => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  const poll = async () => {
    const status = await checkTallyConnection();
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

 
  poll();

  pollingInterval = setInterval(poll, POLLING_INTERVAL);

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
};


export const stopTallyPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};


export const initializeTallyConnection = (companyId) => async (dispatch) => {
  try {
  
    const connectionStatus = await checkTallyConnection();
    if (!connectionStatus.connected) {
      return {
        success: false,
        error: connectionStatus.error
      };
    }

 
    const companiesResult = await dispatch(fetchCompaniesAndUpdate());
    if (!companiesResult.success) {
      return {
        success: false,
        error: 'Failed to fetch companies: ' + companiesResult.error
      };
    }

    if (companyId) {
      const ledgersResult = await dispatch(fetchLedgersAndUpdate(companyId));
      if (!ledgersResult.success) {
        return {
          success: false,
          error: 'Failed to fetch ledgers: ' + ledgersResult.error
        };
      }
    }

    
    const stockItemsResult = await fetchStockItems();

    return {
      success: true,
      companies: companiesResult.data,
      stockItems: stockItemsResult.data,
      connected: true
    };
  } catch (error) {
    console.error('initializeTallyConnection failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


export default {

  sendTallyRequest,
  checkTallyConnection,
  
  fetchLedgersAndUpdate,
  fetchStockItems,
  fetchCompaniesAndUpdate,
  

  postSalesInvoice,
  postPurchaseInvoice,
  postBankingTransaction,
  postBulkSalesInvoices,
  postBulkPurchaseInvoices,
  
  startTallyPolling,
  stopTallyPolling,
  
  initializeTallyConnection,
};