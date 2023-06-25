import React from "react";
import logImg from "../images/Vector.svg";
import { useLocation, Link } from "react-router-dom";

function Header(props) {
  const location = useLocation();
  return (
    <header className="header header_opacity">
      <img
        className="header__logo"
        src={logImg}
        require="true"
        alt="логотип-место"
      />

      {location.pathname === "/sign-in" && (
        <Link to="/sign-up" className="header-text">
          Регистрация
        </Link>
      )}
      {location.pathname === "/sign-up" && (
        <Link to="/sign-in" className="header-text">
          Войти
        </Link>
      )}
      {location.pathname === "/" && (
        <div className="header__info">
          <p className="header-email header-text">{props.email}</p>
          <Link to="/sign-in" className="header-text" onClick={props.onSignOut}>
            Выйти
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
