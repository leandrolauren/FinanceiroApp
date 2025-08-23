import React from 'react'
import { Link } from 'react-router-dom'

const Topbar = ({ pageTitle, userName, handleLogout }) => {
  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      {/* Sidebar Toggle (apenas mobile) */}
      <button
        id="sidebarToggleTop"
        className="btn btn-link d-md-none rounded-circle mr-3"
        onClick={handleLogout}
      >
        <i className="fa fa-bars"></i>
      </button>

      {/* Título da Página */}
      <div className="page-title">{pageTitle}</div>

      {/* Topbar Navbar */}
      <ul className="navbar-nav ml-auto">
        {/* Nav Item - User Info */}
        <li className="nav-item dropdown text-end">
          <a
            className="nav-link dropdown-toggle d-flex align-items-center"
            href="#"
            id="userDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="me-2 d-none d-lg-inline text-gray-600 small">
              {userName}
            </span>
            <img
              className="img-profile rounded-circle"
              src="/img/undraw_profile.svg"
              style={{ width: '32px', height: '32px' }}
            />
          </a>
          <ul
            className="dropdown-menu dropdown-menu-end shadow animated--grow-in"
            aria-labelledby="userDropdown"
          >
            <li>
              <Link className="dropdown-item" to="/Usuario/Perfil">
                <i className="fas fa-user fa-sm fa-fw me-2 text-gray-400"></i>
                Perfil
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/Configuracao">
                <i className="fas fa-cogs fa-sm fa-fw me-2 text-gray-400"></i>
                Configurações
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400"></i>
                Sair
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  )
}

export default Topbar
