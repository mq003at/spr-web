import { Fragment, useEffect, useState } from "react";
import { child, remove } from "firebase/database";
import { dateHandler2 } from "../../js/tool_function";
import { shopRef } from "../../js/firebase_init";

function WorkdayTimeStamp(props) {
  const arr = props.timeStamp;
  const empId = props.empId;

  const [timeStampArr, setTimeStampArr] = useState([]);

  const stampMaker = (time, separator, direction) => {
    return (
      <label onClick={() => deleteStamp(time)} key={"report-timestamp" + time + "-" + direction + "-" + empId} title={direction}>
        {dateHandler2(time, "int", ":").shortTime}
        {separator === "-" ? separator : separator + " "}
      </label>
    );
  };

  const deleteStamp = (time) => {
    const id = time + empId;
    remove(child(shopRef(props.shopId), `${props.empId}/log_events/${id}`));
  }

  useEffect(() => {
    if (arr) {
      let tempStampArr = [];
      arr.forEach((time, index, { [index + 1]: next }) => {
        if (next) {
          if (time.direction === "in" && next.direction === "out") {
            tempStampArr.push([time.timeStamp, " - ", time.direction]);
          } else tempStampArr.push([time.timeStamp, ",", time.direction]);
        } else {
          tempStampArr.push([time.timeStamp, ".", time.direction]);
        }
      });
      setTimeStampArr([...tempStampArr]);
    } else setTimeStampArr([0]);
  }, [arr]);

  return (
    <Fragment>
      <div className="report table-section time-stamp-cell">{timeStampArr.length > 0 ? timeStampArr[0] !== 0 && timeStampArr.map((time) => stampMaker(time[0], time[1], time[2])) : ""}</div>
    </Fragment>
  );
}

export default WorkdayTimeStamp;
