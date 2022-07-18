import { Alert } from "react-bootstrap";
import { child, onValue, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../css/StoreDatabase.css";
import { dbRef, messRef } from "../js/firebase_init";
import FunctionSelector from "./FunctionSelector";
import Message from "./Message";
import Report from "./Report";
import Schedule from "./Schedule";
import Extra from "./extra/Extra";

function StoreDatabase(props) {
  const [modMessage, setModMessage] = useState([]);
  const [showMessage, setShowMessage] = useState(true);
  const [chosenFunction, setChosenFunction] = useState("");
  const location = useLocation();

  const sidebar = props.sidebar;
  const shopId = props.shopId;

  // Extra functions
  const goToFunction = (chosenFunction) => {
    switch (chosenFunction) {
      case "message":
        return <Message />;
      case "report":
        return <Report />;
      case "schedule":
        return <Schedule />;
      case "extra":
        return <Extra />
      default:
        return <FunctionSelector />;
    }
  };

  // ModMessage
  useEffect(() => {
    return onValue(child(dbRef, `shop_data/${shopId}/message_data`), (snap) => {
      let message = [];
      let val = snap.val();
      Object.keys(val).forEach((key) => {
        // setModMessage((modMessage) => [...modMessage, [val[key].name, val[key].message, val[key].date]]);
        message.push([key, val[key].name, val[key].message, val[key].date])
      });
      setModMessage(() => message);
    });
  }, [shopId]);
  const deleteMess = (key) => {
    remove(child(messRef(shopId), key))
  }

  // Location Handler
  useEffect(() => {
    let getPath = location.pathname.split("/");
    getPath[2] ? (getPath = getPath[2]) : (getPath = "");
    setChosenFunction(() => getPath.toString());
  }, [location]);

  return (
    <div className={"store-database " + sidebar}>
      <div className="message-section">
        {showMessage && (
          <Alert variant="success" onClose = {() => setShowMessage(false)} dismissible>
            <Alert.Heading>Message Board</Alert.Heading>
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
