import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FolderTree,
  Tag,
  Image,
  Percent,
  Receipt,
  History,
  MessageSquareWarning,
} from 'lucide-react';
import styles from './SidebarAdmin.module.css';

export const SidebarAdmin = () => {
  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag size={18} /> },
    { name: 'Categories', path: '/admin/categories', icon: <FolderTree size={18} /> },
    { name: 'Brands', path: '/admin/brands', icon: <Tag size={18} /> },
    { name: 'Homepage Banners', path: '/admin/banners', icon: <Image size={18} /> },
    { name: 'Promotions', path: '/admin/campaigns', icon: <Percent size={18} /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Receipt size={18} /> },
    { name: 'Reported Reviews', path: '/admin/reviews', icon: <MessageSquareWarning size={18} /> },
    { name: 'Activity Logs', path: '/admin/logs', icon: <History size={18} /> },
  ];

  return (
    <aside className={`${styles.sidebar} glass-panel`}>
      <div className={styles.header}>
        <h3>Admin Console</h3>
      </div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/admin'}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.activeLink : ''}`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
