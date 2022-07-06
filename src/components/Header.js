import { useEffect, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import "../css/Header.css";

function Header({ sidebar, setSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [pathArr, setPathArr] = useState([]);
  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  function goTo(data) {
    const path = "/" + pathArr.slice(0, pathArr.indexOf(data) + 1).join("/");
    navigate(path);
  }

  useEffect(() => {
    let getPath = location.pathname.split("/");
    getPath.shift();
    setPathArr(() => getPath);
  }, [location]);
  return (
    <header>
      <span align="left" id="show-path">
        {pathArr.map((data, index) => {
          if (data !== "") {
            return (
              <div key={"header" + data}>
                <div className="header">{">>"}</div>
                <label className="header" onClick={() => goTo(data)}>
                  {data.toUpperCase()}
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
      {pathArr[0] !== "" && (
        <span align="right" id="extra">
          <label id="logout" className="header" onClick={() => logout()}>
            LOGOUT
          </label>
          <div id="empty" className="header"></div>
        </span>
      )}
    </header>
  );
}
export default Header;
