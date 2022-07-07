import { Fragment, useEffect, useRef, useState } from "react";
import { child, equalTo, onValue, orderByChild, query } from "firebase/database";
import { dateHandler } from "../../js/tool_function";
import { shopRef } from "../../js/firebase_init";

function ReportByDate(props) {
  const shopId = props.shopId;
  const date = props.date;
  const employeeID = props.employeeID;

  const [logData, setLogData] = useState([]);
  const [hour, setHour] = useState();

  // After having dateRange -> loop through day -> attach listener to each day
  useEffect(() => {
    let thisDayInt = dateHandler(date).dateStamp;
    let qThisDay = query(child(shopRef(shopId), employeeID + "/log_events"), orderByChild("dateStamp"), equalTo(thisDayInt));

    return onValue(qThisDay, (snap) => {
      let logEventArr = [];
      let val = snap.val();
      console.log(employeeID, snap.val());
      if (val === null) {
        /*Do nothing (employer wants to export the date even if they do not present in the dateRange)*/
      } else {
        Object.keys(val).forEach((key, index) => {
          let id = key;
          let dateStamp = val[key].dateStamp;
          let direction = val[key].direction;
          let time = val[key].timeStamp + "";
          let timeStamp = time.substring(8, 10) + ":" + time.substring(10, 12);
          let timeInt = parseInt(time.substring(8, 10)) * 60 + parseInt(time.substring(10, 12));
          logEventArr.push({ direction: direction, timeStamp: timeStamp, dateStamp: dateStamp, id: id, timeInt: timeInt });
        });
        setLogData(logEventArr.map((x) => x));
      }
    });
  }, [employeeID, shopId, date]);

  useEffect(() => {
    if (logData.length > 0) {
      let timeArr = [];
      let timeTotalInMinute = 0;

      timeArr = logData.map((data, index, { [index - 1]: previous, [index + 1]: next }) => {
        if (next) {
          console.log(next.direction)
        } else return [];
      });
      if (timeArr.length === 0) setHour(0);
      else {
        timeArr.forEach((time, index, { [index + 1]: next }) => {
          if (index % 2 === 0) {
            timeTotalInMinute += next - time;
          }
        });
        setHour((timeTotalInMinute / 60).toFixed(2));
      }
    }
  }, [logData]);

  useEffect(() => {
    console.log(hour);
    props.addHour(hour);
  }, [hour]);

  return (
    <Fragment>
      {logData.length === 0 ? (
        <label></label>
      ) : (
        logData.map((data, index, { [index - 1]: previous, [index + 1]: next }) =>
          (typeof next === "undefined") ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction}>{data.timeStamp}</label>
              <label>. </label>
            </Fragment>
          ) : (data.direction === "in" && next.direction === "out") ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction}>{data.timeStamp}</label>
              <label>{" - "}</label>
            </Fragment>
          ) : (data.direction === "out" && previous.direction === "in") ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction}>{data.timeStamp}</label>
              <label>, </label>
            </Fragment>
          ) : (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction}>{data.timeStamp}</label>
              <label>, </label>
            </Fragment>
          )
        )
      )}
    </Fragment>
  );
}

export default ReportByDate;
