import { Alert, Button } from "react-bootstrap";
import { child, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/StoreDatabase.css";
import { dbRef } from "../js/firebase_init";
import FunctionSelector from "./FunctionSelector";

function StoreDatabase(props) {
  const [modMessage, setModMessage] = useState([]);
  const [chosenFunction, setChosenFunction] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const mode = "";
  const user = props.user;
  const shopChosen = props.shopChosen;
  const shopId = props.shopId;

  const watchMessage = () => {
    return onValue(child(dbRef, `shop_data/${shopId}/message_data`), (snap) => {
      console.log(snap.val());
      let val = snap.val();
      Object.keys(val).forEach((key) => {
        setModMessage((modMessage) => [...modMessage, [val[key].name, val[key].message, val[key].date]]);
      });
    });
  };

  useEffect(() => {
    watchMessage();
  }, []);

  useEffect (() => {
    let getPath = location.pathname.split("/");
    getPath = getPath[2]
    setChosenFunction(() => getPath.toString())
  }, [location])

  return (
    <div className="store-database">
      <div className="message-section">
        <Alert variant="success" dismissible>
          <Alert.Heading>Message Board</Alert.Heading>
          <table className="message-table">
            <tbody>
              {modMessage.map((message, index) => (
                <tr className="message" key={"message" + index}>
                  <td className="message-date" width={"15%"}>{message[2]}</td>
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
      </div>

      <div id="manager-function">
        {chosenFunction === ""
         ? <FunctionSelector />
         : console.log("...")
        }
      </div>
    </div>
  );
}
export default StoreDatabase;
