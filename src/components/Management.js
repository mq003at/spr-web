import { child, get, onChildChanged, onValue } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { dbRef, employeePath, shopPath, shopRef } from "../js/firebase_init";
import Session  from 'react-session-api'
import EmployeeList from "./EmployeeList";
import StoreDatabase from "./StoreDatabase";

function Management() {
  const user = Session.get("user");

  const checkUser = () => {
    if (user === "employer") {
      return (
        <>
          <StoreDatabase />
          <EmployeeList />
        </>
      );
    }
    return (
      <>
        <StoreDatabase />
      </>
    );
  };

  return <div id="management">{checkUser()}</div>;
}
export default Management;
