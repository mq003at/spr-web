import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import { child, equalTo, onValue, orderByChild, query, remove } from "firebase/database";
import { dateHandler } from "../../js/tool_function";
import { shopRef } from "../../js/firebase_init";
import * as FaIcons from "react-icons/fa";
import ReportTimeStamp from "./ReportTimeStamp";
import ScheduleForReport from "./ScheduleForReport";
import ModalForAddRecord from "./ModalForAddRecord";
import { Collapse } from "react-bootstrap";
import ModalForDeletingRecord from "./ModalForDeletingRecord";


function ReportByDate(props) {
  const addHour = props.addH;
  const addSchedule = props.addS;
  const index = props.index;
  const shopId = props.shopId;
  const date = props.date;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;
  const addCsvLog = props.addCsvLog;

  const [status, setStatus] = useState(false);
  const [stampData, setStampData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);

  // Send call back for data transfering
  const addStampData = useCallback((mode, start, end, hour) => {
    if (mode !== 0) {
      setStampData([start,end]);
      addHour(hour, index);
    }
  }, [addHour, index])
  
  const addScheduleData = useCallback((mode, start, end, hour) => {
    if (mode !== 0) {
      setScheduleData([start, end]);
      addSchedule(hour, index);
    }
  }, [addSchedule, index])

  //
  useEffect(() => {
    if (stampData.length > 0 && scheduleData.length > 0) {
      console.log("stamp", stampData);
      console.log("sched", scheduleData)
      const result0 = stampData[0].localeCompare(scheduleData[0]);
      const result1 = stampData[1].localeCompare(scheduleData[1]);
      if (result0 || result1) setStatus(true)
      else setStatus(false)
    }
  }, [stampData, scheduleData])

  useEffect(() => {
    console.log("DM", showDayModal)
  }, [showDayModal])

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
      <td width={"15.5%"}>
        <ScheduleForReport shopId={shopId} date={date} id={employeeID} index={index} addScheduleData={addScheduleData} />
      </td>

      {showAddRecordToDayModal && <ModalForAddRecord show={showAddRecordToDayModal} onHide={() => setAddRecordToDayModal(false)} date={date} shopId={shopId} employeeID={employeeID}/>}
      {showDayModal && <ModalForDeletingRecord show={showDayModal} onHide={() => setShowDayModal(false)} dateStamp={dateHandler(date).dateStamp} shopId={shopId} employeeID={employeeID} employeeName={employeeName} date={date.toLocaleDateString("FI-fi")}/>}
    </tr>
  );
}

export default ReportByDate;
