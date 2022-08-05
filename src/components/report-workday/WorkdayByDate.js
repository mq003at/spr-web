import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import { child, equalTo, onValue, orderByChild, query, remove } from "firebase/database";
import { dateHandler, dateHandler2, numToString } from "../../js/tool_function";
import { logSchRef, shopRef } from "../../js/firebase_init";
import * as FaIcons from "react-icons/fa";
import WorkdayTimeStamp from "./WorkdayTimeStamp";
import ModalForAddRecord from "../report-components/ModalForAddRecord";
import ModalForDeletingRecord from "../report-components/ModalForDeletingRecord";
import ModalForDayStatus from "./ModalForDayStatus";

function WorkdayByDate(props) {
  const addHour = props.addH;
  const index = props.index;
  const shopId = props.shopId;
  const date = props.date;
  const dateStamp = dateHandler(date).dateStamp;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;

  const [stampData, setStampData] = useState([]);
  const [status, setStatus] = useState("Absent");
  const [isWorkday, setIsWorkday] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Send call back for data transfering
  const addStampData = useCallback(
    (mode, start, end, hour, index) => {
      if (mode !== 0) {
        setStampData([start, end]);
        addHour(hour, index);
      }
    },
    [addHour]
  );

  useEffect(() => {
    return onValue(child(logSchRef(shopId, employeeID), dateStamp + employeeID + "Sch"), (snap) => {
      let val = snap.val();

      if (val) {
        if (val.isWorkday) setIsWorkday(true);
        if (val.special_status) setStatus(val.special_status);
      } else {
        if (stampData.length > 1) setStatus("Present");
        else setStatus("Absent");
      }
    });
  }, [dateStamp, employeeID, shopId, stampData]);

  useEffect(() => {
    if (isWorkday) addHour(-1, index);
  }, [addHour, index, isWorkday]);

  return (
    <tr className={"report check-status "}>
      <td className="report table-section add-record-cell" width={"0.5%"} data-exclude={"true"}>
        <span className="report table-section date-cell add-record-part" onClick={() => setAddRecordToDayModal(true)}>
          <FaIcons.FaPlus title={"Click to add extra record for day " + date.toLocaleDateString("FI-fi")} />
        </span>
      </td>
      <td className="report table-section date-cell" width={"10.5%"}>
        <span className="report table-section date-cell date-part" onClick={() => setShowDayModal(true)} title="Click to delete all records for this day">
          {date.toLocaleDateString("fi-FI")}
        </span>
        {showAddRecordToDayModal && <ModalForAddRecord show={showAddRecordToDayModal} onHide={() => setAddRecordToDayModal(false)} date={date} shopId={shopId} employeeID={employeeID} />}
      </td>
      <td className={"report table-section time-stamp-cell"}>
        {" "}
        <WorkdayTimeStamp shopId={shopId} date={date} employeeID={employeeID} index={index} addStampData={addStampData} />
      </td>
      {status !== "Present" && status !== "Absent" ? (
        <td width={"17.5%"} onClick={() => setShowStatusModal(true)}>
          <span>{status}</span>
        </td>
      ) : (
        <td width={"17.5%"} onClick={() => setShowStatusModal(true)} date-exclude={"true"}>
          <span onClick={() => setShowStatusModal(true)}>
            {" "}
            <FaIcons.FaPlus />
          </span>{" "}
        </td>
      )}

      {showDayModal && <ModalForDeletingRecord show={showDayModal} onHide={() => setShowDayModal(false)} dateStamp={dateHandler(date).dateStamp} shopId={shopId} employeeID={employeeID} employeeName={employeeName} date={date.toLocaleDateString("FI-fi")} />}
      {showStatusModal && <ModalForDayStatus show={showStatusModal} onHide={() => setShowStatusModal(false)} shopId={shopId} date={date} empName={employeeName} empId={employeeID} dateStamp={dateStamp} status={status} isWorkday={props.isWorkday} />}
    </tr>
  );
}

export default WorkdayByDate;
