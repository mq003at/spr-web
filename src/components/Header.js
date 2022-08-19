import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Header.css";
import i18n from "../locale/i18n";

function Header({ sidebar, setSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation("translation", {keyPrefix: "header"});
  
  const language = localStorage.getItem("lang");
  const [pathArr, setPathArr] = useState([]);
  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  function goTo(data) {
    const path = "/" + pathArr.slice(0, pathArr.indexOf(data) + 1).join("/");
    navigate(path);
  }

  function changeLang(lang) {
    localStorage.setItem("lang", lang)
    const lg = lang.toLowerCase();
    i18n.changeLanguage(lg);
  }

  useEffect(() => {
    let getPath = location.pathname.split("/");
    getPath.shift();
    setPathArr(() => getPath);
  }, [location]);

  useEffect(() => {
    if (language) changeLang(language);
  }, [language])
  return (
    <header>
      <span align="left" id="show-path">
        {pathArr.map((data, index) => {
          if (data !== "") {
            return (
              <div key={"header" + data}>
                <div className="header">{">>"}</div>
                <label className="header" onClick={() => goTo(data)}>
                  {t(data.toUpperCase())}
                </label>
              </div>
            );
          } else
            return (
              <div className="header" key={"header-frontpage"}>
                {">>"}
              </div>
            );
        })}
      </span>
      <span align="right" id="extra">
        <select id="lang-switcher" className="header" onChange={(e) => changeLang(e.target.value)} defaultValue={language}>
          <option>ENGLISH</option>
          <option>FINNISH</option>
        </select>
        <div id="empty" className="header"></div>
      </span>
      {pathArr[0] !== "" && (
        <span align="right" id="extra">
          <label id="logout" className="header" onClick={() => logout()}>
            {t("LOGOUT")}
          </label>
          <div id="empty" className="header"></div>
        </span>
      )}
    </header>
  );
}
export default Header;
