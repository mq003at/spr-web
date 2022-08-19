import { Alert } from "react-bootstrap";
import { child, onValue, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../css/StoreDatabase.css";
import { dbRef, messRef } from "../js/firebase_init";
import FunctionSelector from "./FunctionSelector";
import Report from "./report-components/Report";
import Schedule from "./schedule-components/Schedule";
import Extra from "./extra/Extra";
import EmployeeManagement from "./employee-management/EmployeeManagement";
import ReportWorkday from "./report-workday/ReportWorkday";
import Todo from "./todo-components/Todo";
import { useTranslation } from "react-i18next";
import Help from "./extra/Help";

function StoreDatabase(props) {
  const [modMessage, setModMessage] = useState([]);
  const [showMessage, setShowMessage] = useState(true);
  const [chosenFunction, setChosenFunction] = useState("");
  const location = useLocation();
  const {t} = useTranslation();

  const sidebar = props.sidebar;
  const user = sessionStorage.getItem("shop_user");
  const shopId = sessionStorage.getItem("shop_id");

  // Extra functions
  const goToFunction = (chosenFunction) => {
    switch (chosenFunction) {
      case "report":
        return <Report />;
      case "schedule":
        return <Schedule />;
      case "extra":
        return <Extra />;
      case "employees":
        return <EmployeeManagement />;
      case "workday":
        return <ReportWorkday />;
      case "todo":
        return <Todo />
      case "help":
        return <Help />
      default:
        return <FunctionSelector user={user} shopId={shopId} />;
    }
  };

  // ModMessage
  useEffect(() => {
    return onValue(child(dbRef, `shop_data/${shopId}/message_data`), (snap) => {
      let message = [];
      let val = snap.val();
      if (val) {
        Object.keys(val).forEach((key) => {
          message.push([key, val[key].name, val[key].message, val[key].date])
        });
        if (message.length < 5) setModMessage([...message]);
        else setModMessage(message.slice(message.length - 4, message.length))
      }
    });
  }, [shopId]);
  const deleteMess = (key) => {
    remove(child(messRef(shopId), key))
  }

  // Location Handler
  useEffect(() => {
    let getPath = location.pathname.split("/");
    getPath[2] ? (getPath = getPath[2]) : (getPath = "");
    const fnChoose = getPath.toString();
    if (fnChoose === "help") setShowMessage(false)
    setChosenFunction(fnChoose);
  }, [location]);

  return (
    <div className={"store-database " + sidebar + " inv"}>
      <div className="message-section">
        {showMessage && (
          <Alert variant="success" onClose = {() => setShowMessage(false)} dismissible>
            <Alert.Heading>{t("management.Message Board")}</Alert.Heading>
            <table className="message-table table table-striped">
              <tbody>
                {modMessage.map((message, index) => (
                  <tr className="message" key={"message" + index}>
                    <td className="message-date" width={"15%"}>
                      {message[3]}
                    </td>
                    <td className="message-name" width={"10%"}>
                      {message[1]}
                    </td>
                    <td className="message-data" width={"70%"}>
                      {message[2]}
                    </td>
                    <td className="message-delete" onClick={() => deleteMess(message[0])}>
                      X
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Alert>
        )}
      </div>

      <div id="manager-function">{goToFunction(chosenFunction)}</div>
    </div>
  );
}
export default StoreDatabase;
