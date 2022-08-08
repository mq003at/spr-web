import { Fragment, useEffect, useState, useRef } from "react";
import { child, equalTo, onValue, orderByChild, query, remove } from "firebase/database";
import { dateHandler } from "../../js/tool_function";
import { shopRef } from "../../js/firebase_init";

function WorkdayTimeStamp(props) {
  const shopId = props.shopId;
  const thisDayInt = dateHandler(props.date).dateStamp;
  const employeeID = props.employeeID;
  const index = props.index;
  const addStampData = props.addStampData;

  const [logData, setLogData] = useState([]);
  const [hour, setHour] = useState();

  let data = useRef([]);

  // After having dateRange -> loop through day -> attach listener to each day
  useEffect(() => {
    let qThisDay = query(child(shopRef(shopId), employeeID + "/log_events"), orderByChild("dateStamp"), equalTo(thisDayInt));

    return onValue(qThisDay, (snap) => {
      let logEventArr = [];
      let val = snap.val();
      // console.log(val);
      if (val === null) {
        /*Do nothing (employer wants to export the date even if they do not present in the dateRange)*/
        setLogData([]);
      } else {
        Object.keys(val).forEach((key, index) => {
          let id = key;
          let dateStamp = val[key].dateStamp;
          let direction = val[key].direction;
          let time = val[key].timeStamp + "";
          let timeStamp = time.substring(8, 10) + ":" + time.substring(10, 12);
          let timeInt = parseInt(time.substring(8, 10)) * 60 + parseInt(time.substring(10, 12));
          logEventArr.push({ direction: direction, timeStamp: timeStamp, dateStamp: dateStamp, id: id, timeInt: timeInt, serverTime: time });
        });
        setLogData(logEventArr.map((x) => x));
      }
    });
  }, [employeeID, shopId, thisDayInt]);

  // Total hours for a day
  useEffect(() => {
    if (logData.length > 0) {
      // console.log("log", logData)
      if (logData.length > 1 && logData[0].direction === "in" && logData[logData.length - 1].direction === "out") {
        data.current = [logData[0].timeStamp, logData[logData.length - 1].timeStamp];
      }

      const tempArr = logData
        .map((data, index, { [index - 1]: previous, [index + 1]: next }) => {
          if (next) {
            if (data.direction === "in" && next.direction === "out") {
              return (next.timeInt - data.timeInt) / 60;
            }
          } 
        })
        .filter((data) => data);

      if (tempArr.length === 0) setHour(0);
      else {
        let sum = 0;
        tempArr.forEach((elem) => (sum += Math.round(elem * 100) / 100));
        setHour(sum);
      }
    }
  }, [logData, employeeID, thisDayInt]);

  function deleteTimeStamp(id) {
    remove(child(shopRef(shopId), `${employeeID}/log_events/${id}`));
  }

  // Report date back to CSV
  useEffect(() => {
    if (data.current.length === 2) {
      let mode = null;
      addStampData(mode, data.current[0], data.current[1], hour, index);
    } else addStampData(null, null, null, 0, index);
  }, [hour, index, addStampData, shopId, employeeID, thisDayInt]);

  return (
    <Fragment>
      {logData.length === 0 ? (
        <label></label>
      ) : (
        logData.map((data, index, { [index - 1]: previous, [index + 1]: next }) =>
          index + 1 === logData.length || typeof next.direction === "undefined" ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction} onClick={() => deleteTimeStamp(data.id)}>
                {data.timeStamp}
              </label>
              <span>.</span>
            </Fragment>
          ) : data.direction === "in" && next.direction === "out" ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction} onClick={() => deleteTimeStamp(data.id)}>
                {data.timeStamp}
              </label>
              <span>{" - "}</span>
            </Fragment>
          ) : data.direction === "out" && (previous ? previous.direction === "in" : false) ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction} onClick={() => deleteTimeStamp(data.id)}>
                {data.timeStamp}
              </label>
              <span>, </span>
            </Fragment>
          ) : (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction} onClick={() => deleteTimeStamp(data.id)}>
                {data.timeStamp}
              </label>
              <span>, </span>
            </Fragment>
          )
        )
      )}
    </Fragment>
  );
}

export default WorkdayTimeStamp;
