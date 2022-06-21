import { child, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import "../css/StoreDatabase.css";
import { dbRef } from "../js/firebase_init";

function StoreDatabase(props) {
  const [modMessage, setModMessage] = useState([]);
  const user = props.user;
  const shopChosen = props.shopChosen;
  const shopId = props.shopId;

  const watchMessage = () => {
    return onValue(child(dbRef, `shop_data/${shopId}/message_data`), (snap) => {
      let val = snap.val();
      Object.keys(val).forEach((key) => {
        setModMessage(modMessage => [...modMessage, [val[key].name, val[key].message]])
      })
    });
  };

  useEffect(() => {
    watchMessage();
  }, []);

  return (
    <div className="store-database">
      <div id="message-section">
        {modMessage.map((message, index) => (
          <div className="message" key={"message" + index}>
            <div className="message-name">{message[0]}</div>
            <div className="message-data">{message[1]}</div>
          </div>
        ))}
      </div>

      <div id="select-function">What do you need for today?</div>
    </div>
  );
}
export default StoreDatabase;
