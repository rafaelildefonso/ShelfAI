import React, { createContext, useContext, useState } from "react";

interface MenuContextType {
  menuAberto: boolean;
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
}

interface MenuProviderProps {
  children: React.ReactNode;
}

export const MenuContext = createContext<MenuContextType | undefined>(
  undefined
);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within an MenuProvider');
  }
  return context;
};

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [menuAberto, setMenuAberto] = useState<boolean>(false);

  const toggleMenu = () => {
    setMenuAberto((prev) => !prev);
  };

  const openMenu = () => {
    setMenuAberto(true);
  };

  const closeMenu = () => {
    setMenuAberto(false);
  };

  return (
    <MenuContext.Provider value={{ menuAberto, toggleMenu, openMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
};
