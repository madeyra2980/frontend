import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';
import logoUrl from '../../assets/logo.jpeg';


export default function Layout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          type="button"
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <NavLink to="/" className="header-brand" onClick={closeMenu}>
          <img src={logoUrl} alt="Kömek" className="logo" />
          <span className="brand-name">Kömek</span>
        </NavLink>
      </header>

      <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logoUrl} alt="Kömek" className="logo" />
        </div>
        <nav className="sidebar-nav" onClick={closeMenu}>
          <NavLink to="/" end>Главная</NavLink>
          <NavLink to="/orders">Заявки</NavLink>
          <NavLink to="/specialists">Специалисты</NavLink>
          <NavLink to="/organizations">Организации</NavLink>
          <NavLink to="/profile">Профиль</NavLink>
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={closeMenu}
        aria-hidden
      />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
