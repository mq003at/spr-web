import { Modal, Button } from "react-bootstrap";
import { Fragment, useCallback, useEffect, useState } from "react";
import { dateHandler, dateArr, dateHandler2 } from "../../js/tool_function";
import ReportByDate from "./ReportByDate";
import { child, equalTo, orderByChild, query, remove, get, set } from "firebase/database";
import { shopRef } from "../../js/firebase_init";
import { useFormik } from "formik";
import ScheduleForReport from "./ScheduleForReport";

function ReportByPerson(props) {
  const shopId = props.shopId;
  const startDate = props.startDate;
  const endDate = props.endDate;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;
  const addCsvLog = props.addCsvLog;

  const [dateRange, setDateRange] = useState([]);
  const [hourArr, setHourArr] = useState([]);
  const [totalHour, setTotalHour] = useState();
  const [scheArr, setScheArr] = useState([]);
  const [totalSchedule, setTotalSchedule] = useState(0);

  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);
  const [dataForModal, setDataForModal] = useState([]);
  const [addRecordStatus, setAddRecordStatus] = useState("");
  const [personCache, setPersonCache] = useState();

  // Listening to total working hours done.
  const addHour = useCallback((hour, index) => {
    setHourArr((hourArr) => {
      let temp = [...hourArr];
      if (hourArr.length > 0) {
        temp[index] = hour;
      }
      return temp;
    });
  }, []);

  const addSchedule = useCallback((hour, index) => {
    setScheArr((scheArr) => {
      let temp = [...scheArr];
      if (scheArr.length > 0) {
        temp[index] = hour;
      } 
      return temp;
    });
  }, []);

  // From the list of working hours, calculate the total hours.
  useEffect(() => {
    console.log("hr arr", hourArr);
    if (hourArr.length > 0) {
      let total = 0;
      hourArr.forEach((x) => total = total + x);
      setTotalHour(total);
    }
  }, [hourArr]);

  useEffect(() => {
    if (scheArr.length > 0) {
      let total = 0;
      scheArr.forEach((x) => (total += x));
      setTotalSchedule(total);
    }
  }, [scheArr]);

  // Generate array from startDate to endDate
  useEffect(() => {
    let tempArr = [];
    const start = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());
    let loop = new Date(start);
    tempArr.push(start);

    while (loop < end) {
      tempArr.push(loop);
      const newDate = loop.setDate(loop.getDate() + 1);
      loop = new Date(newDate);
    }

    setDateRange(tempArr.map((x) => x));
  }, [startDate, endDate]);

  // Generate Array
  useEffect(() => {
    if (dateRange.length > 0) {
      setHourArr(new Array(dateRange.length).fill(0));
      setScheArr(new Array(dateRange.length).fill(0));
    }
  }, [dateRange]);

  useEffect(() => {
    console.log(scheArr);
  }, [scheArr]);

  return (
    <Fragment>
      {dateRange.length > 0 && dateRange.map((date, index) => <ReportByDate addH={addHour} addS={addSchedule} shopId={shopId} employeeID={employeeID} employeeName={employeeName} addCsvLog={addCsvLog} date={date} index={index} key={"RBP-" + index} />)}
      <tr className="report table-section table-row">
        <td display={"none"} data-exclude={"true"}></td>
        <td className="report table-section total-cell">
          <span title="Calculate total working hours of this employee">Total</span>
        </td>
        <td className="report table-section time-stamp-cell">{totalHour ? <span>{Math.round(totalHour * 100) / 100} hours.</span> : <span>0 hour.</span>}</td>
        <td>{totalSchedule ? <span>{Math.round(totalSchedule * 100) / 100} hours.</span> : <span>0 hour</span>}</td>
      </tr>
    </Fragment>
  );
}

export default ReportByPerson;
