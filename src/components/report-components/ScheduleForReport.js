import { dateHandler } from "../../js/tool_function";
import { Fragment, useEffect, useState } from "react";
import { onValue, child } from "firebase/database";
import { logSchRef } from "../../js/firebase_init";
import { dateHandler2 } from "../../js/tool_function";

function ScheduleForReport(props) {
  const id = props.id;
  const shopId = props.shopId;
  const date = dateHandler(props.date).dateStamp;
  const addSchedule = props.addScheduleData;
  const position = props.position;

  const [data, setData] = useState("X");
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    return onValue(child(logSchRef(shopId, id), "/" + date + id + "Sch"), (snap) => {
      let val = snap.val();

      if (val) {
        setIsOvertime(val.isOvertime);
        const inTime = dateHandler2(val.inStamp, "str-HM", ":");
        const outTime = dateHandler2(val.outStamp, "str-HM", ":");
        const inTimeInt = dateHandler2(val.inStamp, "time-int");
        const outTimeInt = dateHandler2(val.outStamp, "time-int");
        const totalHour = (outTimeInt - inTimeInt) / 3600;

        setData(inTime + " - " + outTime)

        addSchedule(1, inTime, outTime, totalHour, isOvertime, position);
      } else return (0, 0, 0, 0, 0)
    });
  }, [date, id, shopId, addSchedule, isOvertime, position]);

  return (<div title={isOvertime ? "Work overtime" : "Not overtime"}>{data}</div>)
}

export default ScheduleForReport;
