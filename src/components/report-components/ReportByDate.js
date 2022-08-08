import { useEffect, useState, useCallback } from "react";
import { child, onValue, } from "firebase/database";
import { dateHandler, dateHandler2, numToString } from "../../js/tool_function";
import { logSchRef } from "../../js/firebase_init";
import * as FaIcons from "react-icons/fa";
import ReportTimeStamp from "./ReportTimeStamp";
import ScheduleForReport from "./ScheduleForReport";
import ModalForAddRecord from "./ModalForAddRecord";
import ModalForDeletingRecord from "./ModalForDeletingRecord";

function ReportByDate(props) {
  const addHour = props.addH;
  const addX = props.addX;
  const addSchedule = props.addS;
  const index = props.index;
  const shopId = props.shopId;
  const date = props.date;
  const dateStamp = dateHandler(date).dateStamp;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;
  const addCsvLog = props.addCsvLog;

  const [status, setStatus] = useState(false);
  const [stampData, setStampData] = useState([]);
  const [realStampData, setRealStampData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);
  const [isOvertime, setOvertime] = useState(false);

  // Send call back for data transfering
  const addStampData = useCallback(
    (mode, start, end, hour) => {
      if (mode !== 0) {
        setStampData([start, end]);
        addHour(hour, index);
      }
    },
    [addHour, index]
  );

  const addScheduleData = useCallback(
    (mode, start, end, hour, isOvertime) => {
      if (mode !== 0) {
        setScheduleData([start, end]);
        setOvertime(isOvertime);
        addSchedule(hour, index);
      }
    },
    [addSchedule, index]
  );

  useEffect(() => {
    if (dateStamp) {
      return onValue(
        child(logSchRef(shopId, employeeID), dateStamp + employeeID + "Sch/isOvertime"),
        (snap) => {
          if (snap) setOvertime(snap.val());
        },
        { onlyOnce: true }
      );
    }
  }, [dateStamp, employeeID, shopId]);

  useEffect(() => {
    if (stampData.length > 0 && scheduleData.length > 0) {
      const stamp = stampData.map((time, index) => {
        const stamp = dateHandler2(time, "H:M-num", ":");
        const sched = dateHandler2(scheduleData[index], "H:M-num", ":");
        return [stamp, sched];
      });

      const newStampIn = convertStampBasedOnSchedule(stamp[0][0], stamp[0][1], "in");
      const newStampOut = convertStampBasedOnSchedule(stamp[1][0], stamp[1][1], "out");
      const realStamp = [newStampIn[0] + ":" + newStampIn[1], newStampOut[0] + ":" + newStampOut[1], newStampOut[2] - newStampIn[2]];
      console.log("realStamp", realStamp)
      setRealStampData(realStamp)

      // console.log("real", realStamp);
    }
  }, [stampData, scheduleData, isOvertime]);

  useEffect(() => {
    if (realStampData[2]) addX(realStampData[2] / 60, index)
  }, [realStampData, addX, index])

  const convertStampBasedOnSchedule = (stamp, sched, option) => {
    let newStamp = [...stamp];

    if (option === "in") {
      if (stamp[0] < sched[0] || (stamp[0] === sched[0] && stamp[1] - sched[1] < 8)) {
        newStamp[0] = sched[0];
        newStamp[1] = sched[1];
        newStamp[2] = newStamp[0] * 60 + newStamp[1];
      } else setStatus(true);
    } else {
      if (stamp[0] > sched[0] || (stamp[0] === sched[0] && sched[1] - stamp[1] < 8)) {
        newStamp[0] = sched[0];
        newStamp[1] = sched[1];
        newStamp[2] = newStamp[0] * 60 + newStamp[1];
      } else setStatus(true)
    }

    console.log(newStamp, "newStamp");
    return newStamp.map((time) => numToString(time));
  };

  useEffect(() => {
    console.log("DM", showDayModal);
  }, [showDayModal]);

  return (
    <tr className={"report check-status " + status}>
      <td className="report table-section add-record-cell" width={"0.5%"} data-exclude={"true"}>
        <span className="report table-section date-cell add-record-part" onClick={() => setAddRecordToDayModal(true)}>
          <FaIcons.FaPlus title={"Click to add extra record for day " + date.toLocaleDateString("FI-fi")} />
        </span>
      </td>
      <td className="report table-section date-cell" width={"10.5%"}>
        <span className="report table-section date-cell date-part" onClick={() => setShowDayModal(true)} title="Click to delete all records for this day">
          {date.toLocaleDateString("fi-FI")}
        </span>
      </td>
      <td className={"report table-section time-stamp-cell"}>
        <ReportTimeStamp shopId={shopId} date={date} employeeID={employeeID} index={index} addCsvLog={addCsvLog} addStampData={addStampData} />
      </td>
      <td width={"17.5%"}>{realStampData.length > 0 && `${realStampData[0]} - ${realStampData[1]}`}</td>
      <td width={"15.5%"}>
        <ScheduleForReport shopId={shopId} date={date} id={employeeID} index={index} addScheduleData={addScheduleData} />
        {showAddRecordToDayModal && <ModalForAddRecord show={showAddRecordToDayModal} onHide={() => setAddRecordToDayModal(false)} date={date} shopId={shopId} employeeID={employeeID} />}
      </td>

      {showDayModal && <ModalForDeletingRecord show={showDayModal} onHide={() => setShowDayModal(false)} dateStamp={dateHandler(date).dateStamp} shopId={shopId} employeeID={employeeID} employeeName={employeeName} date={date.toLocaleDateString("FI-fi")} />}
    </tr>
  );
}

export default ReportByDate;
