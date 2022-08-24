import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Management.css";
import EmployeeList from "./EmployeeList";
import StoreDatabase from "./StoreDatabase";
import * as FaIcons from "react-icons/fa";

function Management() {
  const navigate = useNavigate();
  const user = sessionStorage.getItem("shop_user");
  const shopId = sessionStorage.getItem("shop_id");
  const shopChosen = sessionStorage.getItem("shop_chosen");

  const [sidebar, setSidebar] = useState(false);
  const toggleSidebar = () => setSidebar(!sidebar);

  const checkUser = () => {
    if (user === "manager") {
      return (
        <Fragment>
          <div className="button-nav">
            <label className="header" onClick={() => toggleSidebar()}>
              <FaIcons.FaBars />
            </label>
          </div>
          <StoreDatabase sidebar={sidebar}/>
          {/* <EmployeeList  shopChosen={shopChosen} shopId={shopId} user={user} sidebar={sidebar} /> */}
        </Fragment>
      );
    }
    else return <StoreDatabase />;
  };

  useEffect(() => {
    if (!user && !shopId) navigate("/");
  }, [navigate, user, shopId]);

  return <div id="management">{checkUser()}</div>;
}
export default Management;
