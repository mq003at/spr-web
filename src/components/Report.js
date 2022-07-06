import { child, endAt, onValue, orderByChild, query, startAt } from "firebase/database";
import { createRef, Fragment, useEffect, useState } from "react";
import { Calendar } from "react-calendar";
import { empRef, shopRef } from "../js/firebase_init";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import TableToExcel from "@linways/table-to-excel";
// import * as XLSX from "xlsx";
import "../css/Report.css";

function Report() {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startDate, onStartDateChange] = useState(new Date(Date.now() - 3600 * 1000 * 24));
  const [endDate, onEndDateChange] = useState(new Date());
  const [dateRangeArr, setDateRangeArr] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [chosenGroup, setChosenGroup] = useState([]);
  const [empDataArr, setEmpDataArr] = useState([]);
  const [logDataArr, setLogDataArr] = useState([]);

  const tableRef = createRef();
  const shopId = sessionStorage.getItem("shop_id");

  // Functions handles the date
  function dateHandler(date) {
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    let hour = ("0" + date.getHours()).slice(-2);
    let minute = ("0" + date.getMinutes()).slice(-2);
    let second = ("0" + date.getSeconds()).slice(-2);
    let milisec = ("" + date.getMilliseconds()).slice(-1);
    let documentStamp = year + month + day + hour + minute + second + milisec;
    let timeStamp = year + month + day + hour + minute + second;
    let dateStamp = parseInt(year + month + day);
    let dateString = year + "-" + month + "-" + day;

    let obj = {
      documentStamp: documentStamp,
      timeStamp: timeStamp,
      dateStamp: dateStamp,
      dateString: dateString,
    };

    return obj;
  }

  // Get the time
  function findLog(id, date) {
    let a = logDataArr.filter((person) => person.id === id);
    let b = [];
    if (a.length !== 1) return <div>Not present</div>;
    else {
      let temp = [];
      b = a[0].logEvent;
      b.forEach((log) => {
        if (log.dateStamp === date) {
          temp.push({
            id: log.id,
            timeStamp: log.timeStamp,
            direction: log.direction,
          });
        }
      });
      if (temp.length === 0) return <div>Not present</div>;
      else{
        return  (temp.map((data, index, { [index - 1]: previous, [index + 1]: next }) => {
          return !next ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction}>{data.timeStamp}</label>
              <label>. </label>
            </Fragment>
          ) : data.direction === "in" && next.direction === "out" ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction}>{data.timeStamp}</label>
              <label>{" - "}</label>
            </Fragment>
          ) : data.direction === "out" && next ? (
            <Fragment key={"time-cell" + data.id}>
              <label title={data.direction}>{data.timeStamp}</label>
              <label>, </label>
            </Fragment>
          ) : (
            <label key={"time-cell" + data.id} title={data.direction}>
              {data.timeStamp}
            </label>
          );
        }))};
    }
  }

  // Handling CSV
  function csvHandler() {
    TableToExcel.convert(tableRef.current, {
      name: `SPR-Report-${startDate.toLocaleDateString("fi-FI")}-${endDate.toLocaleDateString("fi-FI")}.csv`,
      sheet: {
        name: "Sheet 1",
      },
    });

  }

  // Generate dateRange
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

    setDateRangeArr(tempArr.map((x) => x));
  }, [startDate, endDate]);

  // Getting the groups
  useEffect(() => {
    onValue(empRef(shopId), (snap) => {
      let val = snap.val();
      let groupArr = [];
      Object.keys(val).forEach((key) => {
        groupArr.push({
          id: key,
          name: val[key].name,
        });
      });
      setGroupList(groupArr.map((x) => x));
    });
  }, [shopId]);

  // Getting employee's info
  useEffect(() => {
    if (chosenGroup.length > 1) {
      const watchEmpList = onValue(child(empRef(shopId), chosenGroup[0] + "/employees"), (snap) => {
        let val = snap.val();
        let tempData = [];
        if (val === null) setEmpDataArr([{ name: "There is no employee in this group.", id: "000000" }]);
        else {
          Object.keys(val).forEach((key) => {
            tempData.push({
              name: val[key].name,
              id: val[key].tag_id,
            });
          });
          setEmpDataArr(tempData.map((x) => x));
        }
      });
    }
  }, [chosenGroup, shopId, startDate, endDate]);

  // Getting data
  useEffect(() => {
    if (empDataArr.length > 1) {
      let fromDay = parseInt(dateHandler(startDate).dateStamp);
      let toDay = parseInt(dateHandler(endDate).dateStamp);
      let tempLogArr = [];
      empDataArr.forEach((emp) => {
        let qLogEvent = query(child(shopRef(shopId), emp.id + "/log_events"), orderByChild("dateStamp"), startAt(fromDay), endAt(toDay));
        onValue(qLogEvent, (snap) => {
          let logEventArr = [];
          let val = snap.val();
          if (val === null) {
          } else {
            Object.keys(val).forEach((key) => {
              let id = key;
              let dateStamp = val[key].dateStamp;
              let direction = val[key].direction;
              let time = val[key].timeStamp + "";
              let timeStamp = time.substring(8, 10) + ":" + time.substring(10, 12);
              logEventArr.push({ direction: direction, timeStamp: timeStamp, dateStamp: dateStamp, id: id });
            });
            tempLogArr.push({
              id: emp.id,
              logEvent: logEventArr,
            });
          }
        });
      });
      setLogDataArr(tempLogArr.map((x) => x));
    }
  }, [empDataArr, shopId, startDate, endDate]);

  useEffect(() => {
    console.log(logDataArr);
  }, [logDataArr]);

  return (
    <div className="report">
      <div className="date-picker-section">
        <div className="report-title">REPORT</div>
        <table border={"0"} align={"center"}>
          <tbody>
            <tr className="noBorder">
              <th>From</th>
              <th>To</th>
            </tr>
            <tr className="noBorder" id="datepick-row">
              <th>
                <input
                  readOnly
                  title={"start-date"}
                  placeholder={startDate.toLocaleDateString("fi-FI")}
                  onClick={() => {
                    setShowStartCalendar(!showStartCalendar);
                  }}
                  value={startDate.toLocaleDateString("fi-FI")}
                ></input>
              </th>
              <th>
                <input
                  readOnly
                  title="end-date"
                  placeholder={startDate.toLocaleDateString("fi-FI")}
                  onClick={() => {
                    setShowEndCalendar(!showEndCalendar);
                  }}
                  value={endDate.toLocaleDateString("fi-FI")}
                ></input>
              </th>
            </tr>
            <tr className="noBorder">
              <th>
                {" "}
                <Calendar className={showStartCalendar ? "" : "hide"} onChange={onStartDateChange} value={startDate}></Calendar>
              </th>
              <th>
                {" "}
                <Calendar className={showEndCalendar ? "" : "hide"} onChange={onEndDateChange} value={endDate}></Calendar>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      <hr></hr>
      <div className="report-showcase-section">
        <div className="report-showcase">
          <div className="group-list">
            {groupList.length !== 0 ? (
              <table className="report report-showcase export-report" id="export-report" ref={tableRef} data-cols-width="20,35">
                <thead>
                  <tr>
                    <th colSpan={"2"} data-a-h="center" data-f-bold="true">
                      <div className="date-range" title="Click me to export the report to CSV file" onClick={() => csvHandler()} >
                        {startDate.toLocaleDateString("fi-FI")} - {endDate.toLocaleDateString("fi-FI")}
                      </div>
                    </th>
                  </tr>
                  <tr data-exclude="true">
                    <th colSpan={"2"}>
                      <ButtonGroup className="mb-2 flex-wrap">
                        {groupList.map((group) => {
                          return (
                            <ToggleButton key={"group-button-" + group.name} className="rounded-0" variant="danger" type="radio" name="group-radio" onClick={() => setChosenGroup([group.id, group.name])}>
                              {group.name}
                            </ToggleButton>
                          );
                        })}
                      </ButtonGroup>
                    </th>
                  </tr>
                  {chosenGroup.length !== 0 && <tr><th colSpan={"2"} data-a-h="center" data-f-bold="true">{chosenGroup[1]}</th></tr>}
                </thead>
                {empDataArr.length !== 0 &&
                  empDataArr.map((data, index) => (
                    <tbody key={"report-emp-" + data.id} className="report-tbody" id={"emp-" + data.id}>
                      <tr className="report table-section table-row">
                        <td className="report table-section emp-name" colSpan={"2"} data-f-bold={true}>
                          <span>-- {data.name} --</span>
                        </td>
                      </tr>
                      {(dateRangeArr.length !== 0 && empDataArr.length > 1) &&
                        dateRangeArr.map((date, index) => (
                          <tr key={"report-" + dateHandler(date).timeStamp} className="report table-section table-row">
                            <td className="report table-section date-cell" width={"11.5%"}>
                              <span>{date.toLocaleDateString("fi-FI")}</span>
                            </td>
                            <td className="report table-section time-stamp-cell">
                              <span>{findLog(data.id, dateHandler(date).dateStamp)}</span>
                            </td>
                          </tr>
                        ))}
                        <tr></tr>
                    </tbody>
                  ))}
              </table>
            ) : (
              <div>Loading Database...</div>
            )}
          </div>
          <div className="report-table"></div>
        </div>
      </div>
    </div>
  );
}

export default Report;
