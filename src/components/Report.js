import { child, endAt, equalTo, get, onValue, orderByChild, query, startAt } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-calendar";
import { dbRef, empRef, shopRef } from "../js/firebase_init";

import "../css/Report.css";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";

function Report() {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startDate, onStartDateChange] = useState(new Date());
  const [endDate, onEndDateChange] = useState(new Date(Date.now() + 3600 * 1000 * 24));
  const [dateRangeArr, setDateRangeArr] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [chosenGroup, setChosenGroup] = useState([]);
  const [empDataArr, setEmpDataArr] = useState([]);
  const [logDataArr, setLogDataArr] = useState([]);

  const [a, setA] = useState(0);
  const [b, setB] = useState(5);

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
    let dateStamp = year + month + day;
    let dateString = year + "-" + month + "-" + day;

    let obj = {
      documentStamp: documentStamp,
      timeStamp: timeStamp,
      dateStamp: dateStamp,
      dateString: dateString,
    };

    return obj;
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
  }, [chosenGroup, shopId]);

  // Getting timeStmp
  useEffect(() => {
    if (empDataArr.length > 1) {
      // empDataArr.forEach((emp) => {
      //   let tempLogArr = {id: emp.id, log_event: []};

      //   let qLogEvent = query(child(shopRef(shopId), emp.id + "/log_events"), orderByChild("dateStamp"), startAt(fromDay), endAt(toDay));
      //   const watchLogEmpData = onValue(qLogEvent, (snap) => {
      //     console.log(snap.val())
      //     let val = snap.val();
      //     if (val === null) {}
      //     else {
      //       Object.keys(val).forEach(key => {
      //         let date = val[key].dateStamp;
      //         let direction = val[key].direction;
      //         let timeStamp = val[key].timeStamp;
      //         tempLogArr.log_event.push()
      //       })
      //     }
      //   });
      // })

      let fromDay = parseInt(dateHandler(startDate).dateStamp);
      let toDay = parseInt(dateHandler(endDate).dateStamp);
      let tempLogArr = [];
      let logEventArr = [];
      empDataArr.forEach((emp) => {
        tempLogArr.push({
          id: emp.id,
          log_event: []
        })
        let qLogEvent = query(child(shopRef(shopId), emp.id + "/log_events"), orderByChild("dateStamp"), startAt(fromDay), endAt(toDay));
        onValue(qLogEvent, (snap) => {
          let val = snap.val();
          if (val === null) {}
          else {
            Object.keys(val).forEach((key) => {
              let id = key;
              let dateStamp = val[key].dateStamp;
              let direction = val[key].direction;
              let timeStamp = val[key].timeStamp;

              logEventArr.push({date: dateStamp, day_events: []})

            })
          }
        });
      });
    }
  }, [empDataArr, shopId, startDate, endDate]);

  useEffect(() => {
    console.log(empDataArr);
  }, [empDataArr]);

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
              <table className="export-report">
                <thead>
                  <tr>
                    <th colSpan={"2"}>
                      <div className="date-range">
                        {startDate.toLocaleDateString("fi-FI")} - {endDate.toLocaleDateString("fi-FI")}
                      </div>
                    </th>
                  </tr>
                  <tr>
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
                  <tr>{chosenGroup.name}</tr>
                </thead>
                {empDataArr.length !== 0 &&
                  empDataArr.map((data, index) => (
                    <tbody key={"report-emp-" + data.id} className="report-tbody" id={"emp-" + data.id}>
                      <tr className="report table-section table-row">
                        <td className="report table-section emp-name" colSpan={"2"}>
                          <span>-- {data.name} --</span>
                        </td>
                      </tr>
                      {dateRangeArr.length !== 0 &&
                        dateRangeArr.map((date, index) => (
                          <tr key={"report-" + dateHandler(date).timeStamp} className="report table-section table-row">
                            <td className="report table-section date-cell" width={"11.5%"}>
                              <span>{date.toLocaleDateString("fi-FI")}</span>
                            </td>
                            <td className="report table-section time-stamp-cell">
                              <span>abc</span>
                            </td>
                          </tr>
                        ))}
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
