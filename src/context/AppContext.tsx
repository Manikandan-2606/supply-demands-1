import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  Supplier,
  SalesTransaction,
  ReplenishmentOrder,
  StockLog,
  Settings,
  ViewTab
} from '../types';
import {
  initialProducts,
  initialSuppliers,
  initialSales,
  initialReplenishments,
  initialStockLogs,
  initialSettings
} from '../data/seedData';

const LOCAL_STORAGE_KEY = 'supplyiq_state_v1';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Data Collections
  products: Product[];
  suppliers: Supplier[];
  sales: SalesTransaction[];
  replenishments: ReplenishmentOrder[];
  stockLogs: StockLog[];
  settings: Settings;

  // Search & Global State
  globalSearch: string;
  setGlobalSearch: (term: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  editProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => { success: boolean; message?: string };
  quickAdjustStock: (id: string, adjustmentQty: number, reason: string) => void;

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  editSupplier: (id: string, updates: Partial<Omit<Supplier, 'id'>>) => void;
  deleteSupplier: (id: string) => { success: boolean; message?: string };

  // Sales Actions (Automatic Stock Reduction)
  createSalesTransaction: (
    data: Omit<SalesTransaction, 'id' | 'reference' | 'subtotal' | 'tax' | 'total' | 'totalCost' | 'marginAmount' | 'marginPercent'>
  ) => { success: boolean; error?: string; transaction?: SalesTransaction };

  // Replenishment Actions (Automatic Stock Increase)
  createReplenishmentOrder: (
    data: Omit<ReplenishmentOrder, 'id' | 'orderNumber' | 'totalAmount'>,
    autoReceiveImmediately?: boolean
  ) => ReplenishmentOrder;
  receiveReplenishmentOrder: (orderId: string) => void;
  cancelReplenishmentOrder: (orderId: string) => void;

  // Settings & Storage Actions
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDemoData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;

  // Fast Navigation to Pre-filled Actions
  prefillPO: { supplierId?: string; productId?: string; quantity?: number } | null;
  setPrefillPO: (val: { supplierId?: string; productId?: string; quantity?: number } | null) => void;
  isNewSaleModalOpen: boolean;
  setIsNewSaleModalOpen: (open: boolean) => void;
  isNewPOModalOpen: boolean;
  setIsNewPOModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage or Seed Data
  const [activeTab, setActiveTabState] = useState<ViewTab>(() => {
    return 'dashboard';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [prefillPO, setPrefillPO] = useState<{ supplierId?: string; productId?: string; quantity?: number } | null>(null);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed.products;
        }
      }
    } catch (e) {
      console.warn('Failed reading products from localStorage:', e);
    }
    return initialProducts;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.suppliers) && parsed.suppliers.length > 0) {
          return parsed.suppliers;
        }
      }
    } catch (e) {
      console.warn('Failed reading suppliers from localStorage:', e);
    }
    return initialSuppliers;
  });

  const [sales, setSales] = useState<SalesTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.sales)) {
          return parsed.sales;
        }
      }
    } catch (e) {
      console.warn('Failed reading sales from localStorage:', e);
    }
    return initialSales;
  });

  const [replenishments, setReplenishments] = useState<ReplenishmentOrder[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.replenishments)) {
          return parsed.replenishments;
        }
      }
    } catch (e) {
      console.warn('Failed reading replenishments from localStorage:', e);
    }
    return initialReplenishments;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.stockLogs)) {
          return parsed.stockLogs;
        }
      }
    } catch (e) {
      console.warn('Failed reading stockLogs from localStorage:', e);
    }
    return initialStockLogs;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) {
          return { ...initialSettings, ...parsed.settings };
        }
      }
    } catch (e) {
      console.warn('Failed reading settings from localStorage:', e);
    }
    return initialSettings;
  });

  // 2. Synchronize to LocalStorage on changes
  useEffect(() => {
    try {
      const stateToPersist = {
        products,
        suppliers,
        sales,
        replenishments,
        stockLogs,
        settings
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (e) {
      console.error('Failed saving to localStorage:', e);
    }
  }, [products, suppliers, sales, replenishments, stockLogs, settings]);

  // Sync theme to document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setActiveTab = (tab: ViewTab) => {
    setActiveTabState(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // PRODUCT OPERATIONS
  // ==========================================
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const id = 'prod-' + Date.now();
    const now = new Date().toISOString();
    const supplier = suppliers.find(s => s.id === data.supplierId);
    
    const newProduct: Product = {
      ...data,
      id,
      supplierName: supplier ? supplier.name : data.supplierName || 'Unassigned',
      createdAt: now,
      updatedAt: now
    };

    setProducts(prev => [newProduct, ...prev]);

    // Add initial log
    const log: StockLog = {
      id: 'log-' + Date.now(),
      productId: id,
      productName: newProduct.name,
      sku: newProduct.sku,
      changeType: 'initial_seed',
      quantityChanged: newProduct.currentStock,
      previousStock: 0,
      newStock: newProduct.currentStock,
      reference: 'Initial Stock Entry',
      timestamp: now
    };
    setStockLogs(prev => [log, ...prev]);

    addToast('success', 'Product Created', `${newProduct.name} (${newProduct.sku}) added to inventory with ${newProduct.currentStock} units.`);
    return newProduct;
  };

  const editProduct = (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    const now = new Date().toISOString();
    let updatedName = '';

    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const supplier = updates.supplierId ? suppliers.find(s => s.id === updates.supplierId) : undefined;
          updatedName = updates.name || p.name;
          return {
            ...p,
            ...updates,
            supplierName: supplier ? supplier.name : (updates.supplierName ?? p.supplierName),
            updatedAt: now
          };
        }
        return p;
      })
    );

    addToast('success', 'Product Updated', `Changes to "${updatedName}" have been saved.`);
  };

  const deleteProduct = (id: string): { success: boolean; message?: string } => {
    const target = products.find(p => p.id === id);
    if (!target) return { success: false, message: 'Product not found' };

    // Check if open POs reference this product
    const hasPendingPO = replenishments.some(
      r => (r.status === 'ordered' || r.status === 'in_transit') && r.items.some(i => i.productId === id)
    );
    if (hasPendingPO) {
      addToast('error', 'Cannot Delete Product', `Product "${target.name}" has active purchase orders in transit.`);
      return { success: false, message: 'Cannot delete product with pending replenishment orders.' };
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    addToast('info', 'Product Removed', `Product "${target.name}" (${target.sku}) was deleted from inventory.`);
    return { success: true };
  };

  const quickAdjustStock = (id: string, adjustmentQty: number, reason: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const previousStock = product.currentStock;
    const newStock = Math.max(0, previousStock + adjustmentQty);
    const delta = newStock - previousStock;
    if (delta === 0) return;

    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, currentStock: newStock, updatedAt: new Date().toISOString() } : p))
    );

    const log: StockLog = {
      id: 'log-' + Date.now(),
      productId: id,
      productName: product.name,
      sku: product.sku,
      changeType: 'manual_adjustment',
      quantityChanged: delta,
      previousStock,
      newStock,
      reference: reason || 'Manual Stock Audit',
      timestamp: new Date().toISOString()
    };

    setStockLogs(prev => [log, ...prev]);
    addToast(
      'info',
      'Stock Adjusted',
      `${product.name} stock updated from ${previousStock} to ${newStock} units (${delta > 0 ? '+' : ''}${delta}).`
    );
  };

  // ==========================================
  // SUPPLIER OPERATIONS
  // ==========================================
  const addSupplier = (data: Omit<Supplier, 'id'>): Supplier => {
    const id = 'sup-' + Date.now();
    const newSupplier: Supplier = { ...data, id };
    setSuppliers(prev => [newSupplier, ...prev]);
    addToast('success', 'Supplier Added', `Vendor "${newSupplier.name}" added successfully.`);
    return newSupplier;
  };

  const editSupplier = (id: string, updates: Partial<Omit<Supplier, 'id'>>) => {
    let name = '';
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === id) {
          name = updates.name || s.name;
          return { ...s, ...updates };
        }
        return s;
      })
    );

    // Sync supplierName in products
    if (updates.name) {
      setProducts(prev =>
        prev.map(p => (p.supplierId === id ? { ...p, supplierName: updates.name } : p))
      );
    }

    addToast('success', 'Supplier Updated', `Vendor profile for "${name}" updated.`);
  };

  const deleteSupplier = (id: string): { success: boolean; message?: string } => {
    const target = suppliers.find(s => s.id === id);
    if (!target) return { success: false, message: 'Supplier not found' };

    // Check if products are tied to this supplier
    const linkedProducts = products.filter(p => p.supplierId === id);
    if (linkedProducts.length > 0) {
      addToast('error', 'Supplier Has Linked Products', `Reassign the ${linkedProducts.length} linked products before deleting this supplier.`);
      return { success: false, message: `Supplier is assigned to ${linkedProducts.length} product(s).` };
    }

    setSuppliers(prev => prev.filter(s => s.id !== id));
    addToast('info', 'Supplier Removed', `Supplier "${target.name}" removed.`);
    return { success: true };
  };

  // ==========================================
  // SALES TRANSACTIONS (AUTOMATIC STOCK REDUCTION)
  // ==========================================
  const createSalesTransaction = (
    data: Omit<SalesTransaction, 'id' | 'reference' | 'subtotal' | 'tax' | 'total' | 'totalCost' | 'marginAmount' | 'marginPercent'>
  ): { success: boolean; error?: string; transaction?: SalesTransaction } => {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one line item is required' };
    }

    // 1. Verify stock availability for ALL line items
    for (const item of data.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found: ${item.productName}` };
      }
      if (prod.currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Requested: ${item.quantity}`
        };
      }
    }

    // 2. Calculate financial totals
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalCost = data.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const tax = Number((subtotal * 0.08).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const marginAmount = Number((subtotal - totalCost).toFixed(2));
    const marginPercent = subtotal > 0 ? Number(((marginAmount / subtotal) * 100).toFixed(2)) : 0;

    const reference = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const newTransaction: SalesTransaction = {
      ...data,
      id: 'sale-' + Date.now(),
      reference,
      date: data.date || now,
      subtotal,
      tax,
      total,
      totalCost,
      marginAmount,
      marginPercent,
      status: 'completed'
    };

    // 3. AUTOMATIC STOCK REDUCTION FOR EACH LINE ITEM
    const updatedProducts = [...products];
    const newLogs: StockLog[] = [];

    for (const item of data.items) {
      const index = updatedProducts.findIndex(p => p.id === item.productId);
      if (index !== -1) {
        const currentP = updatedProducts[index];
        const previousStock = currentP.currentStock;
        const newStock = Math.max(0, previousStock - item.quantity);

        updatedProducts[index] = {
          ...currentP,
          currentStock: newStock,
          updatedAt: now
        };

        newLogs.push({
          id: 'log-' + Date.now() + '-' + item.productId,
          productId: currentP.id,
          productName: currentP.name,
          sku: currentP.sku,
          changeType: 'sale_deduction',
          quantityChanged: -item.quantity,
          previousStock,
          newStock,
          reference: reference,
          timestamp: now
        });
      }
    }

    setProducts(updatedProducts);
    setStockLogs(prev => [...newLogs, ...prev]);
    setSales(prev => [newTransaction, ...prev]);

    addToast(
      'success',
      'Sale Recorded & Stock Reduced',
      `Invoice ${reference} created for ${settings.currency}${total.toLocaleString()}. Stock deducted for ${data.items.length} product(s).`
    );

    return { success: true, transaction: newTransaction };
  };

  // ==========================================
  // REPLENISHMENT ORDERS (AUTOMATIC STOCK INCREASE)
  // ==========================================
  const createReplenishmentOrder = (
    data: Omit<ReplenishmentOrder, 'id' | 'orderNumber' | 'totalAmount'>,
    autoReceiveImmediately: boolean = false
  ): ReplenishmentOrder => {
    const orderNumber = 'PO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const now = new Date().toISOString();

    const newPO: ReplenishmentOrder = {
      ...data,
      id: 'po-' + Date.now(),
      orderNumber,
      totalAmount,
      orderDate: data.orderDate || now,
      status: autoReceiveImmediately ? 'received' : data.status || 'ordered',
      actualReceivedDate: autoReceiveImmediately ? now : undefined
    };

    setReplenishments(prev => [newPO, ...prev]);

    // If auto-received immediately, trigger automatic stock increase right now!
    if (autoReceiveImmediately) {
      applyStockIncreaseForPO(newPO);
      addToast(
        'success',
        'Stock Replenished & Increased',
        `PO ${orderNumber} received in full. Stock automatically increased for ${newPO.items.length} item(s).`
      );
    } else {
      addToast(
        'info',
        'Purchase Order Placed',
        `PO ${orderNumber} generated for ${newPO.supplierName} (${settings.currency}${totalAmount.toLocaleString()}).`
      );
    }

    return newPO;
  };

  // Internal helper to apply automatic stock increase
  const applyStockIncreaseForPO = (po: ReplenishmentOrder) => {
    const now = new Date().toISOString();
    const updatedProducts = [...products];
    const newLogs: StockLog[] = [];

    for (const item of po.items) {
      const index = updatedProducts.findIndex(p => p.id === item.productId);
      if (index !== -1) {
        const currentP = updatedProducts[index];
        const previousStock = currentP.currentStock;
        const newStock = previousStock + item.quantity;

        updatedProducts[index] = {
          ...currentP,
          currentStock: newStock,
          updatedAt: now
        };

        newLogs.push({
          id: 'log-' + Date.now() + '-' + item.productId,
          productId: currentP.id,
          productName: currentP.name,
          sku: currentP.sku,
          changeType: 'replenishment_addition',
          quantityChanged: item.quantity,
          previousStock,
          newStock,
          reference: po.orderNumber,
          timestamp: now
        });
      }
    }

    setProducts(updatedProducts);
    setStockLogs(prev => [...newLogs, ...prev]);
  };

  const receiveReplenishmentOrder = (orderId: string) => {
    const targetPO = replenishments.find(r => r.id === orderId);
    if (!targetPO) return;
    if (targetPO.status === 'received') {
      addToast('info', 'Already Received', `PO ${targetPO.orderNumber} is already marked as received.`);
      return;
    }

    const now = new Date().toISOString();
    setReplenishments(prev =>
      prev.map(r => (r.id === orderId ? { ...r, status: 'received', actualReceivedDate: now } : r))
    );

    // AUTOMATIC STOCK INCREASE FOR ALL ITEMS IN PO
    applyStockIncreaseForPO(targetPO);

    const totalQty = targetPO.items.reduce((sum, item) => sum + item.quantity, 0);
    addToast(
      'success',
      'Stock Received & Inventory Increased',
      `${totalQty} units from PO ${targetPO.orderNumber} added to inventory across ${targetPO.items.length} SKU(s).`
    );
  };

  const cancelReplenishmentOrder = (orderId: string) => {
    const targetPO = replenishments.find(r => r.id === orderId);
    if (!targetPO) return;
    if (targetPO.status === 'received') {
      addToast('error', 'Cannot Cancel', 'Received orders cannot be cancelled.');
      return;
    }

    setReplenishments(prev =>
      prev.map(r => (r.id === orderId ? { ...r, status: 'cancelled' } : r))
    );
    addToast('info', 'PO Cancelled', `Purchase Order ${targetPO.orderNumber} has been marked as cancelled.`);
  };

  // ==========================================
  // SETTINGS & STORAGE MANAGEMENT
  // ==========================================
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'Application preferences have been updated.');
  };

  const resetToDemoData = () => {
    setProducts(initialProducts);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setReplenishments(initialReplenishments);
    setStockLogs(initialStockLogs);
    setSettings(initialSettings);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    addToast('info', 'Demo Data Restored', 'Factory demo dataset loaded with fresh inventory, suppliers and transactions.');
  };

  const exportDatabaseJSON = () => {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      suppliers,
      sales,
      replenishments,
      stockLogs,
      settings
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SupplyIQ_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Exported', 'Full database JSON backup downloaded successfully.');
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.products) && Array.isArray(parsed.suppliers)) {
        setProducts(parsed.products);
        setSuppliers(parsed.suppliers);
        if (Array.isArray(parsed.sales)) setSales(parsed.sales);
        if (Array.isArray(parsed.replenishments)) setReplenishments(parsed.replenishments);
        if (Array.isArray(parsed.stockLogs)) setStockLogs(parsed.stockLogs);
        if (parsed.settings) setSettings(parsed.settings);
        addToast('success', 'Database Restored', 'Imported data successfully applied to SupplyIQ.');
        return true;
      }
      throw new Error('Invalid schema structure');
    } catch (err) {
      addToast('error', 'Import Failed', 'Selected JSON file is not a valid SupplyIQ database export.');
      return false;
    }
  };

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      products,
      suppliers,
      sales,
      replenishments,
      stockLogs,
      settings,
      globalSearch,
      setGlobalSearch,
      toasts,
      addToast,
      removeToast,
      addProduct,
      editProduct,
      deleteProduct,
      quickAdjustStock,
      addSupplier,
      editSupplier,
      deleteSupplier,
      createSalesTransaction,
      createReplenishmentOrder,
      receiveReplenishmentOrder,
      cancelReplenishmentOrder,
      updateSettings,
      resetToDemoData,
      exportDatabaseJSON,
      importDatabaseJSON,
      prefillPO,
      setPrefillPO,
      isNewSaleModalOpen,
      setIsNewSaleModalOpen,
      isNewPOModalOpen,
      setIsNewPOModalOpen
    }),
    [
      activeTab,
      isMobileMenuOpen,
      products,
      suppliers,
      sales,
      replenishments,
      stockLogs,
      settings,
      globalSearch,
      toasts,
      prefillPO,
      isNewSaleModalOpen,
      isNewPOModalOpen
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
