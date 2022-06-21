import { child, get, onChildChanged, onValue } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { dbRef, employeePath, shopPath, shopRef } from "../js/firebase_init";
import EmployeeList from "./EmployeeList";
import StoreDatabase from "./StoreDatabase";

function Management(props) {
  const location = useLocation();
  const user = sessionStorage.getItem("user");
  const shopChosen = sessionStorage.getItem("shop_chosen");
  const shopId = sessionStorage.getItem("shop_id");
  

  const checkUser = () => {
    if (user == "employer") {
      return (
        <>
          <StoreDatabase shopChosen={shopChosen} shopId={shopId} user={user} />
          <EmployeeList shopChosen={shopChosen} shopId={shopId} user={user} />
        </>
      );
    }
    return (
      <>
        <StoreDatabase shopChosen={shopChosen} shopId={shopId} user={user} />
      </>
    );
  };

  useEffect(() => {
  }, []);

  useEffect(() => {

  },)

  return <div id="management">{checkUser()}</div>;
}
export default Management;
