import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import ModalForAddRecord from "../report-components/ModalForAddRecord";
import ModalForDeletingRecord from "../report-components/ModalForDeletingRecord";
import WorkdayByDate from "./WorkdaySpecial";
import * as FaIcons from "react-icons/fa";
import { dateHandler, dateHandler2 } from "../../js/tool_function";
import { child, endAt, onValue, orderByChild, query, startAt } from "firebase/database";
import { logSchRef, shopRef } from "../../js/firebase_init";
import WorkdayTimeStamp from "./WorkdayTimeStamp";
import WorkdaySpecial from "./WorkdaySpecial";

function WorkdayByPerson(props) {
  const shopId = props.shopId;
  const startDate = props.startDate;
  const endDate = props.endDate;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;
  const toGroupArr = props.toGroupArr;
  const position = props.index;

  const [dateRange, setDateRange] = useState([]);
  const [hourArr, setHourArr] = useState([]);
  const [scheArr, setScheArr] = useState([]);
  const [total, setTotal] = useState(0);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);
  const tempRef = useRef();
  const { t } = useTranslation("translation", { keyPrefix: "report-workday" });

  useEffect(() => {
    // Generate dateRange array
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
      console.log("schedule", sVal);
      let tempSche = tempArr.map((day) => ({ date: dateHandler(day).dateStamp, schedules: [] }));
      if (sVal) {
        Object.keys(sVal).forEach((key) => {
          tempSche.forEach((day) => {
            if (day.date === sVal[key].dateStamp)
              day.schedules.push({
                dateStamp: sVal[key].dateStamp,
                special_status: sVal[key].special_status,
                isWorkday: sVal[key].isWorkday !== undefined ? sVal[key].isWorkday : true,
              });
          });
        });
      }
      setScheArr([...tempSche]);
    });
  }, [startDate, endDate, shopId, employeeID]);

  useEffect(() => {
    // Day calculating
    if (hourArr.length > 0 && scheArr.length > 0) {
      console.log(scheArr)
      let tempTotalDay = 0;
      hourArr.forEach((day, index) => {
        let inArr = day.events.filter((e) => e.direction === "in");
        let outArr = hourArr[index].events.filter((e) => e.direction === "out");
        if (inArr[0] || outArr[0]) {
          tempTotalDay++;
        } else {
          if (scheArr[index].schedules[0] && scheArr[index].schedules[0].isWorkday) tempTotalDay++;
        }
      })

      setTotal(tempTotalDay);
      toGroupArr(tempTotalDay, position)
    }
  }, [hourArr, scheArr, employeeID, toGroupArr, position]);

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

  return (
    <Fragment>
      <Fragment>
        {showAddRecordToDayModal && <ModalForAddRecord show={showAddRecordToDayModal} onHide={() => setAddRecordToDayModal(false)} {...tempRef.current} />}
        {showDayModal && <ModalForDeletingRecord show={showDayModal} onHide={() => setShowDayModal(false)} {...tempRef.current} />}
      </Fragment>
      {dateRange.length > 0 &&
        dateRange.map((date, index) => (
          <tr className={scheArr[index] && scheArr[index].schedules && scheArr[index].schedules[0] && (scheArr[index].schedules[0].isWorkday && "text-primary")} key={"report check-status-" + date[0] + "-" + employeeID}>
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
            <td className="report table-section record-part">{(hourArr && hourArr.length) > 0 ? <WorkdayTimeStamp timeStamp={hourArr[index].events} shopId={shopId} empId={employeeID} /> : <div>{t("Loading Database")}</div>}</td>
            <td className="report table-section special-part">
              <WorkdaySpecial shopId={shopId} empId={employeeID} empName={employeeName} dateStr={date[2]} dateStamp={date[1]} statusArr={scheArr[index]}/>
            </td>
          </tr>
        ))}
      <tr className="report table-section table-row">
        <td display={"none"} data-exclude={"true"}></td>
        <td className="report table-section total-cell" data-f-color="FF0000">
          <span title="Calculate total working hours of this employee">{t("Total")}</span>
        </td>
        <td className="report table-section time-stamp-cell">
          <span>
            <Trans i18nKey={"report-workday.Total Report"}>
              {{ totalDay: total }} workday.
            </Trans>
          </span>
        </td>
      </tr>
    </Fragment>
  );
}

export default WorkdayByPerson;
