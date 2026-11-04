import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/layout/ToastContainer';
import { NewSaleModal } from './components/modals/NewSaleModal';
import { NewPOModal } from './components/modals/NewPOModal';

// Views
import { DashboardView } from './views/DashboardView';
import { InventoryView } from './views/InventoryView';
import { SuppliersView } from './views/SuppliersView';
import { SalesView } from './views/SalesView';
import { ReplenishmentView } from './views/ReplenishmentView';
import { AnalyticsView } from './views/AnalyticsView';
import { ForecastView } from './views/ForecastView';
import { ReorderView } from './views/ReorderView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'sales':
        return <SalesView />;
      case 'replenishment':
        return <ReplenishmentView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'forecast':
        return <ForecastView />;
      case 'reorder':
        return <ReorderView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-150">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-400">
          SupplyIQ · Intelligent Supply Chain & Inventory Operations · Autonomous Frontend System
        </footer>
      </div>

      {/* Global Interactive Modals */}
      <NewSaleModal />
      <NewPOModal />

      {/* Feedback Toast Overlay */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
