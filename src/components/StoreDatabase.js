import { Alert, Button } from "react-bootstrap";
import { child, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/StoreDatabase.css";
import { dbRef } from "../js/firebase_init";
import Session from "react-session-api"
import FunctionSelector from "./FunctionSelector";
import Message from "./Message";

function StoreDatabase(props) {
  const [modMessage, setModMessage] = useState([]);
  const [showMessage, setShowMessage] = useState(true);
  const [chosenFunction, setChosenFunction] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const mode = "";
  const shopId = Session.get("shop_id");

  const watchMessage = () => {
    return onValue(child(dbRef, `shop_data/${shopId}/message_data`), (snap) => {
      console.log(snap.val());
      let val = snap.val();
      Object.keys(val).forEach((key) => {
        setModMessage((modMessage) => [...modMessage, [val[key].name, val[key].message, val[key].date]]);
      });
    });
  };

  const goToFunction = (chosenFunction) => {
    switch (chosenFunction) {
      case "message":
        return <Message />;
      default:
        return <FunctionSelector />;
    }
  };

  useEffect(() => {
    watchMessage();
  }, []);

  useEffect(() => {
    let getPath = location.pathname.split("/");
    getPath[2] ? (getPath = getPath[2]) : (getPath = "");
    setChosenFunction(() => getPath.toString());
  }, [location]);

  return (
    <div className="store-database">
      <div className="message-section">
        {showMessage && (
          <Alert variant="success" onClose = {() => setShowMessage(false)} dismissible>
            <Alert.Heading>Message Board</Alert.Heading>
            <table className="message-table">
              <tbody>
                {modMessage.map((message, index) => (
                  <tr className="message" key={"message" + index}>
                    <td className="message-date" width={"15%"}>
                      {message[2]}
                    </td>
                    <td className="message-name" width={"10%"}>
                      {message[0]}
                    </td>
                    <td className="message-data" width={"75%"}>
                      {message[1]}
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
