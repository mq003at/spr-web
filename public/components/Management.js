import { child, get, onChildChanged, onValue } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { dbRef, employeePath, shopPath, shopRef } from "../js/firebase_init";
import "../css/Management.css";
import EmployeeList from "./EmployeeList";
import StoreDatabase from "./StoreDatabase";
import * as FaIcons from "react-icons/fa";


function Management(props) {
  const location = useLocation();
  const user = sessionStorage.getItem("user");
  const shopChosen = sessionStorage.getItem("shop_chosen");
  const shopId = sessionStorage.getItem("shop_id");

  const [sidebar, setSidebar] = useState(false);
  const toggleSidebar = () => setSidebar(!sidebar);

  const checkUser = () => {
    if (user === "employer") {
      return (
        <div className="management">
          <div className="button-nav">
            <label className="header" onClick={() => toggleSidebar()}>
              <FaIcons.FaBars />
            </label>
          </div>
          <StoreDatabase shopChosen={shopChosen} shopId={shopId} user={user} sidebar={sidebar}/>
          <EmployeeList shopChosen={shopChosen} shopId={shopId} user={user} sidebar={sidebar} />
        </div>
      );
    }
    return (
      <div className="management">
        <StoreDatabase shopChosen={shopChosen} shopId={shopId} user={user} />
      </div>
    );
  };

  return <div id="management">{checkUser()}</div>;
}
export default Management;
