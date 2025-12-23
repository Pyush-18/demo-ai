import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";


export const saveSalesInvoiceToFirebase = async (
  companyId,
  fileId,
  invoice,
  userId
) => {
  try {
    const invoiceRef = doc(
      db,
      "companies",
      companyId,
      "salesFiles",
      fileId,
      "invoices",
      invoice.id
    );

    await setDoc(invoiceRef, {
      ...invoice,
      syncedToTally: true,
      syncedAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
    });

    const fileRef = doc(db, "companies", companyId, "salesFiles", fileId);
    await setDoc(
      fileRef,
      {
        lastUpdated: serverTimestamp(),
        status: "completed",
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const savePurchaseInvoiceToFirebase = async (
  companyId,
  fileId,
  invoice,
  userId
) => {
  try {
    const invoiceRef = doc(
      db,
      "companies",
      companyId,
      "purchaseFiles",
      fileId,
      "invoices",
      invoice.id
    );

    await setDoc(invoiceRef, {
      ...invoice,
      syncedToTally: true,
      syncedAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
    });

    const fileRef = doc(db, "companies", companyId, "purchaseFiles", fileId);
    await setDoc(
      fileRef,
      {
        lastUpdated: serverTimestamp(),
        status: "completed",
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchSalesInvoicesFromFirebase = async (companyId) => {
  try {
    const filesRef = collection(db, "companies", companyId, "salesFiles");
    const filesSnapshot = await getDocs(filesRef);

    const allFiles = [];

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = { id: fileDoc.id, ...fileDoc.data() };

      const invoicesRef = collection(fileDoc.ref, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);

      fileData.invoices = invoicesSnapshot.docs.map((invDoc) => ({
        id: invDoc.id,
        ...invDoc.data(),
      }));

      allFiles.push(fileData);
    }

    return { success: true, data: allFiles };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchPurchaseInvoicesFromFirebase = async (companyId) => {
  try {
    const filesRef = collection(db, "companies", companyId, "purchaseFiles");
    const filesSnapshot = await getDocs(filesRef);

    const allFiles = [];

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = { id: fileDoc.id, ...fileDoc.data() };

      const invoicesRef = collection(fileDoc.ref, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);

      fileData.invoices = invoicesSnapshot.docs.map((invDoc) => ({
        id: invDoc.id,
        ...invDoc.data(),
      }));

      allFiles.push(fileData);
    }

    return { success: true, data: allFiles };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getInvoiceStats = async (companyId) => {
  try {
    const salesFiles = await fetchSalesInvoicesFromFirebase(companyId);
    const purchaseFiles = await fetchPurchaseInvoicesFromFirebase(companyId);

    const totalSales = salesFiles.data.reduce(
      (sum, file) =>
        sum +
        file.invoices.reduce((s, inv) => s + (inv.totals?.grandTotal || 0), 0),
      0
    );

    const totalPurchases = purchaseFiles.data.reduce(
      (sum, file) =>
        sum +
        file.invoices.reduce((s, inv) => s + (inv.totals?.grandTotal || 0), 0),
      0
    );

    return {
      totalSales,
      totalPurchases,
      salesCount: salesFiles.data.reduce(
        (sum, f) => sum + f.invoices.length,
        0
      ),
      purchaseCount: purchaseFiles.data.reduce(
        (sum, f) => sum + f.invoices.length,
        0
      ),
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return null;
  }
};

export const savePrefetchedDataToFirebase = async (
  companyId,
  ledgers,
  stockItems
) => {
  try {
    const dataRef = doc(db, "companies", companyId, "tallyData", "prefetched");

    await setDoc(dataRef, {
      ledgers,
      stockItems,
      lastUpdated: serverTimestamp(),
      timestamp: Date.now(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loadPrefetchedDataFromFirebase = async (companyId) => {
  try {
    const dataRef = doc(db, "companies", companyId, "tallyData", "prefetched");
    const dataSnap = await getDoc(dataRef);

    if (dataSnap.exists()) {
      const data = dataSnap.data();
      return {
        success: true,
        data: {
          ledgers: data.ledgers,
          stockItems: data.stockItems,
          timestamp: data.timestamp,
        },
      };
    } else {

      return { success: false, error: "No data found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
