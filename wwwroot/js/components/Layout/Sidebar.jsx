import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ isToggled, handleToggle }) => {
    const sidebarClass = `navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${isToggled ? 'toggled' : ''}`;

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'nav-link active' : 'nav-link';
  };

  return (
  <ul className={sidebarClass} id="accordionSidebar">
    <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/home">
        <div className="sidebar-brand-icon">
          <img
            src="/favicon.ico"
            alt="Logo"
            style={{ width: '45px', height: '45px' }}
          />
        </div>
        <div className="sidebar-brand-text mx-3">Financeiro</div>
      </a>

      <hr className="sidebar-divider my-0" />

      {/* Item de menu - Início */}
      <li className="nav-item">
        <NavLink className={getNavLinkClass} to="/home">
          <i className="fas fa-fw fa-home fa-flip"></i>
          <span>Início</span>
        </NavLink>
      </li>

      {/* Divider */}
      <hr className="sidebar-divider" />

      <div className="sidebar-heading">Cadastros</div>

      <li className="nav-item">
        <NavLink className={getNavLinkClass} to="/Pessoas">
          <i className="fa-solid fa-person fa-spin"></i>
          <span>Pessoas</span>
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink
          className={getNavLinkClass} to="/Planocontas"
        >
          <i className="fa-solid fa-file-invoice fa-beat-fade"></i>
          <span>Plano de Contas</span>
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className={getNavLinkClass} to="/Contas">
          <i className="fa-solid fa-building-columns fa-flip"></i>
          <span>Contas</span>
        </NavLink>
      </li>

      <hr className="sidebar-divider" />

      <div className="sidebar-heading">Operações</div>

      <li className="nav-item">
        <NavLink
          className={getNavLinkClass} to="/Lancamentos"
        >
          <i className="fa-solid fa-coins fa-beat"></i>
          <span>Lançamento</span>
        </NavLink>
      </li>

      <hr className="sidebar-divider d-none d-md-block" />

      <div className="text-center d-none d-md-inline">
        <button
          className="rounded-circle border-0"
          id="sidebarToggle"
          onClick={handleToggle}
        ></button>
      </div>
    </ul>
  )
}

export default Sidebar
