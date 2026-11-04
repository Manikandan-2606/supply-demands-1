import { Product, Supplier, SalesTransaction, ReplenishmentOrder, StockLog, Settings } from '../types';

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Apex Micro-Electronics Ltd',
    contactPerson: 'David Chen',
    email: 'd.chen@apexmicro.com',
    phone: '+1 (555) 234-8901',
    leadTimeDays: 7,
    rating: 4.8,
    onTimeDeliveryRate: 97.4,
    paymentTerms: 'Net 30',
    status: 'active',
    categoryFocus: 'Electronics',
    address: '402 Technology Parkway, San Jose, CA'
  },
  {
    id: 'sup-2',
    name: 'Nordic Precision Machining',
    contactPerson: 'Astrid Lindholm',
    email: 'astrid@nordicprecision.se',
    phone: '+46 8 555 1234',
    leadTimeDays: 14,
    rating: 4.9,
    onTimeDeliveryRate: 98.6,
    paymentTerms: 'Net 45',
    status: 'active',
    categoryFocus: 'Mechanical',
    address: 'Fabriksgatan 12, Gothenburg, Sweden'
  },
  {
    id: 'sup-3',
    name: 'EcoPack Global Solutions',
    contactPerson: 'Marcus Thorne',
    email: 'm.thorne@ecopackglobal.com',
    phone: '+1 (555) 876-4321',
    leadTimeDays: 5,
    rating: 4.6,
    onTimeDeliveryRate: 94.2,
    paymentTerms: 'Net 30',
    status: 'active',
    categoryFocus: 'Packaging',
    address: '88 Industrial Way, Columbus, OH'
  },
  {
    id: 'sup-4',
    name: 'Vanguard Polymer & Alloys',
    contactPerson: 'Elena Rostova',
    email: 'elena@vanguardpolymers.com',
    phone: '+1 (555) 678-9012',
    leadTimeDays: 10,
    rating: 4.7,
    onTimeDeliveryRate: 96.1,
    paymentTerms: 'Net 60',
    status: 'active',
    categoryFocus: 'Raw Materials',
    address: '150 Chemical Park Drive, Houston, TX'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'EL-MCU-084',
    name: 'UltraCore ARM Cortex-M4 Controller',
    category: 'Electronics',
    currentStock: 145,
    minStock: 50,
    reorderPoint: 75,
    reorderQuantity: 200,
    unitCost: 14.20,
    unitPrice: 28.50,
    supplierId: 'sup-1',
    supplierName: 'Apex Micro-Electronics Ltd',
    location: 'Warehouse A · Shelf 04-B',
    leadTimeDays: 7,
    dailyDemand: 6.8,
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-11-01T14:20:00Z'
  },
  {
    id: 'prod-2',
    sku: 'EL-SENS-401',
    name: 'Tri-Axis MEMS Vibration Sensor',
    category: 'Electronics',
    currentStock: 18, // LOW STOCK - TRIGGER ALERT
    minStock: 25,
    reorderPoint: 40,
    reorderQuantity: 100,
    unitCost: 9.80,
    unitPrice: 22.00,
    supplierId: 'sup-1',
    supplierName: 'Apex Micro-Electronics Ltd',
    location: 'Warehouse A · Shelf 02-C',
    leadTimeDays: 7,
    dailyDemand: 3.5,
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-11-03T18:10:00Z'
  },
  {
    id: 'prod-3',
    sku: 'MC-BRG-220',
    name: 'High-Load Titanium Flange Bearing 22mm',
    category: 'Mechanical',
    currentStock: 92,
    minStock: 30,
    reorderPoint: 45,
    reorderQuantity: 120,
    unitCost: 38.50,
    unitPrice: 74.00,
    supplierId: 'sup-2',
    supplierName: 'Nordic Precision Machining',
    location: 'Warehouse B · Bay 08',
    leadTimeDays: 14,
    dailyDemand: 2.9,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-10-28T16:00:00Z'
  },
  {
    id: 'prod-4',
    sku: 'MC-GEAR-75',
    name: 'Planetary Reduction Gear Set 5:1',
    category: 'Mechanical',
    currentStock: 8, // CRITICAL STOCKOUT RISK
    minStock: 15,
    reorderPoint: 20,
    reorderQuantity: 40,
    unitCost: 65.00,
    unitPrice: 125.00,
    supplierId: 'sup-2',
    supplierName: 'Nordic Precision Machining',
    location: 'Warehouse B · Bay 09',
    leadTimeDays: 14,
    dailyDemand: 1.4,
    createdAt: '2026-09-01T08:30:00Z',
    updatedAt: '2026-11-02T12:45:00Z'
  },
  {
    id: 'prod-5',
    sku: 'PKG-BOX-MED',
    name: 'Reinforced Corrugated Transit Shipper M',
    category: 'Packaging',
    currentStock: 480,
    minStock: 150,
    reorderPoint: 250,
    reorderQuantity: 600,
    unitCost: 1.15,
    unitPrice: 2.80,
    supplierId: 'sup-3',
    supplierName: 'EcoPack Global Solutions',
    location: 'Warehouse C · Bulk Zone 01',
    leadTimeDays: 5,
    dailyDemand: 22.0,
    createdAt: '2026-06-12T13:00:00Z',
    updatedAt: '2026-10-30T09:15:00Z'
  },
  {
    id: 'prod-6',
    sku: 'PKG-ESD-BAG',
    name: 'Anti-Static Shielding Pouches 10x12"',
    category: 'Packaging',
    currentStock: 45, // BELOW REORDER POINT
    minStock: 60,
    reorderPoint: 100,
    reorderQuantity: 500,
    unitCost: 0.45,
    unitPrice: 1.20,
    supplierId: 'sup-3',
    supplierName: 'EcoPack Global Solutions',
    location: 'Warehouse C · Rack 03',
    leadTimeDays: 5,
    dailyDemand: 8.5,
    createdAt: '2026-07-05T14:00:00Z',
    updatedAt: '2026-11-03T08:00:00Z'
  },
  {
    id: 'prod-7',
    sku: 'RM-ALUM-6061',
    name: 'Billet Aluminium 6061-T6 Extrusion Bar',
    category: 'Raw Materials',
    currentStock: 310,
    minStock: 80,
    reorderPoint: 120,
    reorderQuantity: 250,
    unitCost: 18.00,
    unitPrice: 34.00,
    supplierId: 'sup-4',
    supplierName: 'Vanguard Polymer & Alloys',
    location: 'Warehouse B · Heavy Bar Storage',
    leadTimeDays: 10,
    dailyDemand: 9.1,
    createdAt: '2026-05-18T11:20:00Z',
    updatedAt: '2026-10-25T17:30:00Z'
  },
  {
    id: 'prod-8',
    sku: 'RM-NYL-GF30',
    name: 'Glass-Filled Nylon Granules GF30 (25kg)',
    category: 'Raw Materials',
    currentStock: 65,
    minStock: 25,
    reorderPoint: 40,
    reorderQuantity: 80,
    unitCost: 42.00,
    unitPrice: 88.00,
    supplierId: 'sup-4',
    supplierName: 'Vanguard Polymer & Alloys',
    location: 'Warehouse B · Chemical Bay 02',
    leadTimeDays: 10,
    dailyDemand: 2.2,
    createdAt: '2026-06-22T09:40:00Z',
    updatedAt: '2026-10-29T10:10:00Z'
  }
];

export const initialSales: SalesTransaction[] = [
  {
    id: 'sale-1',
    reference: 'INV-2026-1044',
    customerName: 'AeroDynamics Propulsion Inc',
    customerEmail: 'procurement@aerodynamics.io',
    date: '2026-11-04T08:30:00Z',
    channel: 'B2B Wholesale',
    items: [
      {
        productId: 'prod-3',
        productName: 'High-Load Titanium Flange Bearing 22mm',
        sku: 'MC-BRG-220',
        quantity: 12,
        unitPrice: 74.00,
        unitCost: 38.50,
        total: 888.00
      },
      {
        productId: 'prod-1',
        productName: 'UltraCore ARM Cortex-M4 Controller',
        sku: 'EL-MCU-084',
        quantity: 15,
        unitPrice: 28.50,
        unitCost: 14.20,
        total: 427.50
      }
    ],
    subtotal: 1315.50,
    tax: 105.24,
    total: 1420.74,
    totalCost: 675.00,
    marginAmount: 640.50,
    marginPercent: 48.69,
    status: 'completed'
  },
  {
    id: 'sale-2',
    reference: 'INV-2026-1043',
    customerName: 'RoboTech Automation Labs',
    customerEmail: 'hardware@robotech.de',
    date: '2026-11-03T15:45:00Z',
    channel: 'Direct eCommerce',
    items: [
      {
        productId: 'prod-2',
        productName: 'Tri-Axis MEMS Vibration Sensor',
        sku: 'EL-SENS-401',
        quantity: 10,
        unitPrice: 22.00,
        unitCost: 9.80,
        total: 220.00
      },
      {
        productId: 'prod-4',
        productName: 'Planetary Reduction Gear Set 5:1',
        sku: 'MC-GEAR-75',
        quantity: 4,
        unitPrice: 125.00,
        unitCost: 65.00,
        total: 500.00
      }
    ],
    subtotal: 720.00,
    tax: 57.60,
    total: 777.60,
    totalCost: 358.00,
    marginAmount: 362.00,
    marginPercent: 50.28,
    status: 'completed'
  },
  {
    id: 'sale-3',
    reference: 'INV-2026-1042',
    customerName: 'Pacific Rim Assembly Corp',
    customerEmail: 'orders@pacificassembly.com',
    date: '2026-11-02T11:15:00Z',
    channel: 'Distribution Partner',
    items: [
      {
        productId: 'prod-7',
        productName: 'Billet Aluminium 6061-T6 Extrusion Bar',
        sku: 'RM-ALUM-6061',
        quantity: 35,
        unitPrice: 34.00,
        unitCost: 18.00,
        total: 1190.00
      },
      {
        productId: 'prod-5',
        productName: 'Reinforced Corrugated Transit Shipper M',
        sku: 'PKG-BOX-MED',
        quantity: 80,
        unitPrice: 2.80,
        unitCost: 1.15,
        total: 224.00
      }
    ],
    subtotal: 1414.00,
    tax: 113.12,
    total: 1527.12,
    totalCost: 722.00,
    marginAmount: 692.00,
    marginPercent: 48.94,
    status: 'completed'
  },
  {
    id: 'sale-4',
    reference: 'INV-2026-1041',
    customerName: 'Quantex Embedded Systems',
    customerEmail: 'sales@quantex.com',
    date: '2026-11-01T09:20:00Z',
    channel: 'B2B Wholesale',
    items: [
      {
        productId: 'prod-1',
        productName: 'UltraCore ARM Cortex-M4 Controller',
        sku: 'EL-MCU-084',
        quantity: 25,
        unitPrice: 28.50,
        unitCost: 14.20,
        total: 712.50
      }
    ],
    subtotal: 712.50,
    tax: 57.00,
    total: 769.50,
    totalCost: 355.00,
    marginAmount: 357.50,
    marginPercent: 50.18,
    status: 'completed'
  },
  {
    id: 'sale-5',
    reference: 'INV-2026-1040',
    customerName: 'Apex Device Manufacturing',
    customerEmail: 'supplies@apexdevice.com',
    date: '2026-10-30T14:10:00Z',
    channel: 'Direct eCommerce',
    items: [
      {
        productId: 'prod-6',
        productName: 'Anti-Static Shielding Pouches 10x12"',
        sku: 'PKG-ESD-BAG',
        quantity: 150,
        unitPrice: 1.20,
        unitCost: 0.45,
        total: 180.00
      },
      {
        productId: 'prod-8',
        productName: 'Glass-Filled Nylon Granules GF30 (25kg)',
        sku: 'RM-NYL-GF30',
        quantity: 5,
        unitPrice: 88.00,
        unitCost: 42.00,
        total: 440.00
      }
    ],
    subtotal: 620.00,
    tax: 49.60,
    total: 669.60,
    totalCost: 277.50,
    marginAmount: 342.50,
    marginPercent: 55.24,
    status: 'completed'
  },
  {
    id: 'sale-6',
    reference: 'INV-2026-1039',
    customerName: 'Matrix Dynamics Engineering',
    customerEmail: 'ops@matrixdynamics.com',
    date: '2026-10-28T16:40:00Z',
    channel: 'B2B Wholesale',
    items: [
      {
        productId: 'prod-3',
        productName: 'High-Load Titanium Flange Bearing 22mm',
        sku: 'MC-BRG-220',
        quantity: 8,
        unitPrice: 74.00,
        unitCost: 38.50,
        total: 592.00
      },
      {
        productId: 'prod-7',
        productName: 'Billet Aluminium 6061-T6 Extrusion Bar',
        sku: 'RM-ALUM-6061',
        quantity: 20,
        unitPrice: 34.00,
        unitCost: 18.00,
        total: 680.00
      }
    ],
    subtotal: 1272.00,
    tax: 101.76,
    total: 1373.76,
    totalCost: 668.00,
    marginAmount: 604.00,
    marginPercent: 47.48,
    status: 'completed'
  }
];

export const initialReplenishments: ReplenishmentOrder[] = [
  {
    id: 'po-1',
    orderNumber: 'PO-2026-0382',
    supplierId: 'sup-1',
    supplierName: 'Apex Micro-Electronics Ltd',
    orderDate: '2026-10-25T10:00:00Z',
    expectedDeliveryDate: '2026-11-01T12:00:00Z',
    actualReceivedDate: '2026-11-01T14:15:00Z',
    status: 'received',
    items: [
      {
        productId: 'prod-1',
        productName: 'UltraCore ARM Cortex-M4 Controller',
        sku: 'EL-MCU-084',
        quantity: 100,
        unitCost: 14.20,
        totalCost: 1420.00
      }
    ],
    totalAmount: 1420.00,
    notes: 'Scheduled monthly batch. Received in full and inspected.'
  },
  {
    id: 'po-2',
    orderNumber: 'PO-2026-0383',
    supplierId: 'sup-2',
    supplierName: 'Nordic Precision Machining',
    orderDate: '2026-10-28T09:30:00Z',
    expectedDeliveryDate: '2026-11-11T16:00:00Z',
    status: 'in_transit',
    items: [
      {
        productId: 'prod-4',
        productName: 'Planetary Reduction Gear Set 5:1',
        sku: 'MC-GEAR-75',
        quantity: 40,
        unitCost: 65.00,
        totalCost: 2600.00
      }
    ],
    totalAmount: 2600.00,
    notes: 'Air freight expedited to prevent impending stockout.'
  },
  {
    id: 'po-3',
    orderNumber: 'PO-2026-0384',
    supplierId: 'sup-3',
    supplierName: 'EcoPack Global Solutions',
    orderDate: '2026-11-02T13:00:00Z',
    expectedDeliveryDate: '2026-11-07T10:00:00Z',
    status: 'ordered',
    items: [
      {
        productId: 'prod-6',
        productName: 'Anti-Static Shielding Pouches 10x12"',
        sku: 'PKG-ESD-BAG',
        quantity: 500,
        unitCost: 0.45,
        totalCost: 225.00
      }
    ],
    totalAmount: 225.00,
    notes: 'Standard replenishment batch.'
  }
];

export const initialStockLogs: StockLog[] = [
  {
    id: 'log-1',
    productId: 'prod-1',
    productName: 'UltraCore ARM Cortex-M4 Controller',
    sku: 'EL-MCU-084',
    changeType: 'replenishment_addition',
    quantityChanged: 100,
    previousStock: 45,
    newStock: 145,
    reference: 'PO-2026-0382',
    timestamp: '2026-11-01T14:15:00Z'
  },
  {
    id: 'log-2',
    productId: 'prod-3',
    productName: 'High-Load Titanium Flange Bearing 22mm',
    sku: 'MC-BRG-220',
    changeType: 'sale_deduction',
    quantityChanged: -12,
    previousStock: 104,
    newStock: 92,
    reference: 'INV-2026-1044',
    timestamp: '2026-11-04T08:30:00Z'
  },
  {
    id: 'log-3',
    productId: 'prod-2',
    productName: 'Tri-Axis MEMS Vibration Sensor',
    sku: 'EL-SENS-401',
    changeType: 'sale_deduction',
    quantityChanged: -10,
    previousStock: 28,
    newStock: 18,
    reference: 'INV-2026-1043',
    timestamp: '2026-11-03T15:45:00Z'
  }
];

export const initialSettings: Settings = {
  companyName: 'Apex Industrial Corp',
  currency: '$',
  lowStockThresholdPct: 20,
  leadTimeSafetyBufferDays: 3,
  forecastHorizonDays: 30,
  autoSuggestReorder: true,
  theme: 'light'
};
