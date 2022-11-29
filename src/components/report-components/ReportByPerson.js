import { Fragment, useEffect, useState, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";

import * as FaIcons from "react-icons/fa";
import { dateHandler, dateHandler2, timeConverter } from "../../js/tool_function";
import { child, endAt, onValue, orderByChild, query, startAt } from "firebase/database";
import { logSchRef, shopRef } from "../../js/firebase_init";
import ReportTimeStamp from "./ReportTimeStamp";
import ModalForAddRecord from "./ModalForAddRecord";
import ModalForDeletingRecord from "./ModalForDeletingRecord";
import ScheduleForReport from "./ScheduleForReport";
import CompareTimeStamp from "./CompareTimeStamp";

// Need to rewrite this
function ReportByPerson(props) {

  const shopId = props.shopId;
  const startDate = props.startDate;
  const endDate = props.endDate;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;
  const addCsvLog = props.addCsvLog;
  const isTotal = props.isTotal;

  const [dateRange, setDateRange] = useState([]);
  const [status, setStatus] = useState([]);
  const [hourArr, setHourArr] = useState([]);
  const [totalHour, setTotalHour] = useState(0);
  const [xHourArr, setXHourArr] = useState([]);
  const [totalXHour, setTotalXHour] = useState(0);
  const [scheArr, setScheArr] = useState([]);
  const [totalSchedule, setTotalSchedule] = useState(0);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);
  const tempRef = useRef();

  const { t } = useTranslation("translation", { keyPrefix: "report" });

  // Listening to total working hours done.

  // Generate array from startDate to endDate
  useEffect(() => {
    const intStart = dateHandler(startDate).dateStamp;
    const intEnd = dateHandler(endDate).dateStamp;
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

    setDateRange(tempArr.map((day) => [day, dateHandler(day).dateStamp, day.toLocaleDateString("FI-fi")]));

    const eventQuery = query(child(shopRef(shopId), employeeID + "/log_events"), orderByChild("dateStamp"), startAt(intStart), endAt(intEnd));
    const scheduleQuery = query(logSchRef(shopId, employeeID), orderByChild("dateStamp"), startAt(intStart), endAt(intEnd));

    const watchEvent = onValue(eventQuery, (snap) => {
      const eVal = snap.val();
      let tempEvent = tempArr.map((day) => ({ date: dateHandler(day).dateStamp, events: [] }));
      if (eVal) {
        Object.keys(eVal).forEach((key, index) => {
          tempEvent.forEach((day) => {
            if (day.date === eVal[key].dateStamp)
              day.events.push({
                dateStamp: eVal[key].dateStamp,
                timeStamp: eVal[key].timeStamp,
                direction: eVal[key].direction,
              });
          });
        });
      }
      setHourArr([...tempEvent]);
    });

    const watchSchedule = onValue(scheduleQuery, (snap) => {
      const sVal = snap.val();
      let tempSche = tempArr.map((day) => ({ date: dateHandler(day).dateStamp, schedules: [] }));
      if (sVal) {
        Object.keys(sVal).forEach((key) => {
          tempSche.forEach((day) => {
            if (day.date === sVal[key].dateStamp)
              day.schedules.push({
                dateStamp: sVal[key].dateStamp,
                inStamp: sVal[key].inStamp,
                outStamp: sVal[key].outStamp,
                isOvertime: sVal[key].isOvertime,
                special_status: sVal[key].special_status,
                isWorkday: sVal[key].isWorkday,
              });
          });
        });
      }
      setScheArr([...tempSche]);
    });
  }, [startDate, endDate, shopId, employeeID]);

  useEffect(() => {
    if (scheArr.length > 0) {
      const scheArrCopy = [...scheArr];
      // Calculate total working hour from timestamps
      let tempTotalSche = 0;
      scheArrCopy.forEach((day) => {
        if (day.schedules.length > 0) {
          const dailySched = dateHandler2(day.schedules[0].outStamp, "int", ":").toInt - dateHandler2(day.schedules[0].inStamp, "int", ":").toInt;
          tempTotalSche += dailySched;
        }
      });
      setTotalSchedule(tempTotalSche);
    }

    if (hourArr.length > 0) {
      // Calculate total working hours required
      let tempTotalHour = 0;
      hourArr.forEach((day) => {
        if (day.events.length > 0 ) {
          const dayForCsv = (day.date.toString()).substring(0,4) + "-" + (day.date.toString()).substring(4,6) + "-" + (day.date.toString()).substring(6,8);
          let csvData = []
          day.events.forEach(record => {
            let numDirection = 0;
            if (record.direction === "in") numDirection = 1;
            csvData.push([employeeID, numDirection, "" , `${dayForCsv} ${dateHandler2(record.timeStamp, "int", ":").shortTime}`])
          })
          addCsvLog(csvData, employeeID, dayForCsv )
        }
        let inArr = day.events.filter((e) => e.direction === "in");
        let outArr = day.events.filter((e) => e.direction === "out");
        if (inArr[0] && outArr[0]) tempTotalHour += dateHandler2(outArr[outArr.length - 1].timeStamp, "int", ":").toInt - dateHandler2(inArr[0].timeStamp, "int", ":").toInt;
      });
      setTotalHour(tempTotalHour);
    }

    if (scheArr.length > 0 && hourArr.length > 0) {
      const scheArrCopy = [...scheArr];
      // Generate compared working hours and return status array
      let tempXArr = [];
      let total = 0;
      hourArr.forEach((day, index) => {
        console.log("data", day)
        let inArr,
          outArr,
          inSche,
          outSche,
          inTime,
          outTime,
          isOvertime = "";
        if (day.events.length > 0) {
          inArr = day.events.filter((e) => e.direction === "in")[0];
          outArr = day.events.filter((e) => e.direction === "out");
          let outT = outArr[outArr.length - 1];
          if (inArr) inTime = inArr.timeStamp;
          if (outT) outTime = outT.timeStamp;
        }
        if (scheArrCopy[index] && scheArrCopy[index].schedules.length > 0) {
          inSche = scheArrCopy[index].schedules[0].inStamp;
          outSche = scheArrCopy[index].schedules[0].outStamp;
          isOvertime = scheArrCopy[index].schedules[0].isOvertime;
        }

        tempXArr.push([inTime, outTime, inSche, outSche, isOvertime]);
      });
      let statusArr = new Array(tempXArr.length);
      let xArr = new Array(tempXArr.length);
      tempXArr.forEach((day, index) => {
        if (day[0] && !day[1]) {
          statusArr[index] = ["Working", ""];
        } else {
          const x = compare(day[0], day[1], day[2], day[3], day[4]);
          xArr[index] = [x.newIn, x.newOut, x.total];
          total += x.total;
          statusArr[index] = [x.status, statusGen(x.status), x.timeOver];
        }
      });

      setXHourArr([...xArr]);
      setStatus([...statusArr]);
      setTotalXHour(total);
    }
  }, [scheArr, hourArr, addCsvLog, employeeID]);

  const compare = (inTime, outTime, scheIn, scheOut, isOvertime) => {
    // Old system check
    if (outTime && !inTime) inTime = outTime;

    let timeOver = "";
    let status = true;
    let nIn = dateHandler2(inTime, "int", ":");
    let nOut = dateHandler2(outTime, "int", ":");
    let nSIn = dateHandler2(scheIn, "int", ":");
    let nSOut = dateHandler2(scheOut, "int", ":");

    if (nIn && nOut && nSIn && nSOut && nSIn.toInt !== 0 && nSOut.toInt !== 0) {
      if (isOvertime) {
        let logDiff = nOut.toInt - nIn.toInt;
        let scheduleDiff = nSOut.toInt - nSIn.toInt;
        if (logDiff > scheduleDiff) {
          status = "Overtime";
          timeOver = logDiff - scheduleDiff;
        } else if (logDiff === scheduleDiff) status = true;
        else {
          status = false;
          timeOver = scheduleDiff - logDiff;
        }
      } else {
        if (nIn.toInt < nSIn.toInt || nIn.toInt - nSIn.toInt < 8) {
          nIn = nSIn;
        } else status = false;
        if (nSOut.toInt < nOut.toInt || nSOut.toInt - nSOut.toInt < 8) {
          nOut = nSOut;
        } else status = false;
      }
    } else if ((nIn || nOut) && (!nSIn || !nSIn.toInt)) {
      status = "Conflict";
    } else if (nSIn && nSOut) {
      if (nSIn.toInt === 0 && nSOut.toInt === 0) status = true;
      else status = false;
    }else status = true;

    let obj = {
      newIn: nIn ? nIn.shortTime : undefined,
      newOut: nOut ? nOut.shortTime : undefined,
      status: status,
      timeOver: timeOver,
      total: nIn && nOut ? nOut.toInt - nIn.toInt : 0,
    };
    return obj;
  };

  function showModal(modal, date, dateStr, dateStamp, empId, empName) {
    if (modal === "add") {
      const obj = {
        date: date,
        dateStr: dateStr,
        empId: empId,
        empName: empName,
        dateStamp: dateStamp,
        shopId: shopId,
      };
      tempRef.current = obj;
    }

    if (modal === "del") {
      const obj = {
        date: date,
        dateStr: dateStr,
        empId: empId,
        empName: empName,
        dateStamp: dateStamp,
        shopId: shopId,
      };
      tempRef.current = obj;
    }
  }

  const statusGen = (status) => {
    switch (status) {
      case false:
        return "red";
      case "Overtime":
        return "darkblue";
      case "Working":
        return "purple";
      case "Conflict":
        return "orange";
      default:
        return "black";
    }
  };

  return (
    <Fragment>
      <Fragment>
        {showAddRecordToDayModal && <ModalForAddRecord show={showAddRecordToDayModal} onHide={() => setAddRecordToDayModal(false)} {...tempRef.current} />}
        {showDayModal && <ModalForDeletingRecord show={showDayModal} onHide={() => setShowDayModal(false)} {...tempRef.current} />}
      </Fragment>
      {dateRange.length > 0 &&
        dateRange.map((date, index) => (
          <tr className={(status && status.length > 0) ? ((status[index] && status[index].length) > 0 && `report check-status ${status[index][1]}`)  : `report check-status`} key={"report check-status-" + date[0] + "-" + employeeID}>
            <td className="report table-section add-record-cell" width={"0.5%"} data-exclude={"true"}>
              <span
                className="report table-section date-cell add-record-part"
                onClick={() => {
                  setAddRecordToDayModal(true);
                  showModal("add", date[0], date[2], date[1], employeeID, employeeName);
                }}
              >
                <FaIcons.FaPlus title={<Trans i18nKey={"report.Datebox Title"}>Click to add extra record for day {{ date: date[2] }}</Trans>} />
              </span>
            </td>
            <td className="report table-section date-cell" width={"10.5%"}>
              <span
                className="report table-section date-cell date-part"
                onClick={() => {
                  showModal("del", date[0], date[2], date[1], employeeID, employeeName);
                  setShowDayModal(true);
                }}
                title={<Trans i18nKey={"report.Datedelete Title"}>Click to delete every record in day {{ date: date[2] }}</Trans>}
              >
                {date[2]}
              </span>
            </td>
            <td className="report table-section record-part">{(hourArr && hourArr.length) > 0 ? <ReportTimeStamp timeStamp={hourArr[index].events} shopId={shopId} empId={employeeID} /> : <div>{t("Loading database...")}</div>}</td>
            <td className="report table-section compare-part">{(xHourArr && xHourArr.length) > 0 ? <CompareTimeStamp arr={xHourArr[index]} /> : <div>{t("Loading database...")}</div>}</td>
            <td className="report table-section schedule-part">{(scheArr && scheArr.length > 0 && scheArr[index] && scheArr[index].schedules.length > 0) ? <ScheduleForReport sched={scheArr[index].schedules[0]} /> : <div></div>}</td>
          </tr>
        ))}
      <tr className="report table-section table-row">
        <td display={"none"} data-exclude={"true"}></td>
        <td className="report table-section total-cell">
          <span title={t("Calculate total working hours of this employee")}>{t("Total")}</span>
        </td>
        <td className="report table-section time-stamp-cell">
          <span>
            {isTotal ? `${timeConverter(totalHour).h} ${t("hours")}` : `${timeConverter(totalHour).h2} ${t("hours")}, ${timeConverter(totalHour).m} ${t("minutes")}.`}
          </span>
        </td>
        <td className="report table-section compare-part">
          <span>
          {isTotal ? `${timeConverter(totalXHour).h} ${t("hours")}` : `${timeConverter(totalXHour).h2} ${t("hours")}, ${timeConverter(totalXHour).m} ${t("minutes")}.`}
          </span>
        </td>
        <td className="report table-section schedule-part">
          <span>
          {isTotal ? `${timeConverter(totalSchedule).h} ${t("hours")}` : `${timeConverter(totalSchedule).h2} ${t("hours")}, ${timeConverter(totalSchedule).m} ${t("minutes")}.`}
          </span>
        </td>
      </tr>
    </Fragment>
  );
}

export default ReportByPerson;
