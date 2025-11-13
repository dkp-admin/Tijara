import React, { createContext, useContext, useState, ReactNode } from 'react';

export type OrderType = 'delivery' | 'pickup' | null;

interface OrderTypeContextProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  hasSeenOrderTypeModal: boolean;
  setHasSeenOrderTypeModal: (seen: boolean) => void;
}

const OrderTypeContext = createContext<OrderTypeContextProps | undefined>(undefined);

export function OrderTypeProvider({ children }: { children: ReactNode }) {
  const [orderType, setOrderTypeState] = useState<OrderType>(() => {
    if (typeof window !== 'undefined') {
      const savedOrderType = sessionStorage.getItem('orderType');
      return (savedOrderType as OrderType) || null;
    }
    return null;
  });

  const [hasSeenOrderTypeModal, setHasSeenOrderTypeModalState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('hasSeenOrderTypeModal') === 'true';
    }
    return false;
  });

  const setOrderType = (type: OrderType) => {
    setOrderTypeState(type);
    if (typeof window !== 'undefined') {
      if (type) sessionStorage.setItem('orderType', type);
      else sessionStorage.removeItem('orderType');
    }
  };

  const setHasSeenOrderTypeModal = (seen: boolean) => {
    setHasSeenOrderTypeModalState(seen);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasSeenOrderTypeModal', seen.toString());
    }
  };

  return (
    <OrderTypeContext.Provider
      value={{
        orderType,
        setOrderType,
        hasSeenOrderTypeModal,
        setHasSeenOrderTypeModal,
      }}
    >
      {children}
    </OrderTypeContext.Provider>
  );
}

export function useOrderType() {
  const context = useContext(OrderTypeContext);
  if (!context) throw new Error('useOrderType must be used within an OrderTypeProvider');
  return context;
}
