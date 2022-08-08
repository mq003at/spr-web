import { child, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { logSchRef } from "../../js/firebase_init";

function ScheduleByPerson(props) {
  const shopId = props.shopId;  
  const id = props.id;
  const dateStamp = props.date;

  const [data, setData] = useState("x");

  useEffect(() => {
    return onValue(child(logSchRef(shopId, id), "/" + dateStamp + id + "Sch"), (snap) => {
      let val = snap.val();
      if (val) {
        let timeIn = (val.inStamp).substring(8, 12);
        let timeOut = (val.outStamp).substring(8, 12);
        let inT = timeIn.substring(0,2) + ":" + timeIn.substring(2,4);
        let outT = timeOut.substring(0,2) + ":" + timeOut.substring(2,4);
        setData(`${inT} - ${outT}`)
      }      
    });
  }, [dateStamp, id, shopId]);

  return <div>{data}</div>;
}

export default ScheduleByPerson;
