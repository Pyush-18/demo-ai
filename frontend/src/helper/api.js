import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const fetchLedgers = async (companyName = null) => {
  try {
    const company = companyName || getSelectedCompany();
    
    if (!company) {
      throw new Error('No company selected');
    }
    
    const response = await api.get('/api/tally/ledgers', {
      params: { company }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch ledgers');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Fetch ledgers error:', error);
    throw error;
  }
};


export const fetchStockItems = async (companyName = null) => {
  try {
    const company = companyName || getSelectedCompany();
    
    if (!company) {
      throw new Error('No company selected');
    }
    
    const response = await api.get('/api/tally/stock-items', {
      params: { company }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch stock items');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Fetch stock items error:', error);
    throw error;
  }
};

export const fetchCompanies = async () => {
  try {
    const response = await api.get('/api/tally/companies');
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch companies');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Fetch companies error:', error);
    throw error;
  }
};


export const createSalesVoucher = async (invoiceData, companyName = null) => {
  try {
    const company = companyName || getSelectedCompany();
    
    if (!company) {
      throw new Error('No company selected. Please select a company first.');
    }
    
    const dataWithCompany = {
      ...invoiceData,
      companyName: company
    };
    
    const response = await api.post('/api/tally/voucher/sales', dataWithCompany);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create sales voucher');
    }
    
    return response.data;
  } catch (error) {
    console.error('Create sales voucher error:', error);
    throw error;
  }
};


export const createPurchaseVoucher = async (invoiceData, companyName = null) => {
  try {
    const company = companyName || getSelectedCompany();
    
    if (!company) {
      throw new Error('No company selected. Please select a company first.');
    }
    
    const dataWithCompany = {
      ...invoiceData,
      companyName: company
    };
    
    const response = await api.post('/api/tally/voucher/purchase', dataWithCompany);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create purchase voucher');
    }
    
    return response.data;
  } catch (error) {
    console.error('Create purchase voucher error:', error);
    throw error;
  }
};


export const syncCompanyData = async (companyName) => {
  try {
    if (!companyName) {
      throw new Error('Company name is required');
    }
    
    const [ledgers, stockItems] = await Promise.all([
      fetchLedgers(companyName),
      fetchStockItems(companyName)
    ]);
    
    localStorage.setItem('selectedCompany', companyName);
    localStorage.setItem('ledgers', JSON.stringify(ledgers));
    localStorage.setItem('stockItems', JSON.stringify(stockItems));
    localStorage.setItem('lastSync', new Date().toISOString());
    
    return {
      ledgers,
      stockItems,
      company: companyName,
      syncedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Sync company data error:', error);
    throw error;
  }
};