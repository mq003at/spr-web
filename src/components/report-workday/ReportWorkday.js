import { child, onValue } from "firebase/database";
import { createRef, Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Calendar } from "react-calendar";
import { empRef } from "../../js/firebase_init";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import TableToExcel from "@linways/table-to-excel";
import "../../css/Report.css";
import WorkdayByPerson from "./WorkdayByPerson";
import { dateArr, dateHandler } from "../../js/tool_function";
import { CSVLink } from "react-csv";

function ReportWorkday() {
  const [showStartCalendar, setShowStartCalendar] = useState(true);
  const [showEndCalendar, setShowEndCalendar] = useState(true);
  const [startDate, onStartDateChange] = useState(new Date(Date.now() - 3600 * 1000 * 24));
  const [endDate, onEndDateChange] = useState(new Date());
  const [groupList, setGroupList] = useState([]);
  const [chosenGroup, setChosenGroup] = useState([]);
  const [empDataArr, setEmpDataArr] = useState([]);
  const [groupWorkday, setGroupWorkday] = useState([]);
  const [totalGroupWorkday, setTotalGroupWorkday] = useState(0);

  // For Excel
  const csvArr = useRef([]);
  const tableRef = createRef();
  const shopId = sessionStorage.getItem("shop_id");

  // Handling CSV (now this function export the report as xlsx file -> Csv functions moved to the upper functions)
  function csvHandler() {
    TableToExcel.convert(tableRef.current, {
      name: `SPR-Report-${dateArr(startDate, endDate, "range")}.xlsx`,
      sheet: {
        name: "Sheet 1",
      },
    });
  }

  // Getting the groups
  useEffect(() => {
    return onValue(empRef(shopId), (snap) => {
      let val = snap.val();
      let groupArr = [];
      Object.keys(val).forEach((key) => {
        groupArr.push({
          id: key,
          name: val[key].name,
        });
      });
      groupArr.sort((a, b) => a.name.localeCompare(b.name))
      setGroupList(groupArr.map((x) => x));
    });
  }, [shopId]);

  useEffect(() => {
    if (empDataArr.length > 0) {
      setGroupWorkday(new Array(empDataArr.length).fill(0));
    }
  }, [empDataArr]);

  const toGroupArr = useCallback((day, index) => {
    setGroupWorkday((groupWorkday) => {
      let temp = [...groupWorkday];
      if (groupWorkday.length > 0) {
        temp[index] = day;
      }
      return temp;
    });
  }, []);

  useEffect(() => {
    if (groupWorkday.length > 0) {
      let total = 0;
      groupWorkday.forEach((person) => (total += person));
      setTotalGroupWorkday(total);
    }
  }, [groupWorkday]);

  // Getting employee's info
  useEffect(() => {
    csvArr.current = [];
    if (chosenGroup.length > 1) {
      const watchEmpList = onValue(child(empRef(shopId), chosenGroup[0] + "/employees"), (snap) => {
        let val = snap.val();
        let tempData = [];
        if (val === null) setEmpDataArr([]);
        else {
          Object.keys(val).forEach((key) => {
            tempData.push({
              name: val[key].name,
              id: val[key].tag_id,
            });
          });
          tempData.sort((a, b) => a.name.localeCompare(b.name))
          setEmpDataArr(tempData.map((x) => x));
        }
      });
    }
  }, [chosenGroup, shopId, startDate, endDate]);

  return (
    <div className="report">
      <div className="date-picker-section">
        <div className="report title">WORKDAY REPORT</div>
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
                <Calendar className={showStartCalendar ? "" : "hide"} onChange={onStartDateChange} value={startDate} maxDate={endDate}></Calendar>
              </th>
              <th>
                {" "}
                <Calendar className={showEndCalendar ? "" : "hide"} onChange={onEndDateChange} value={endDate} minDate={startDate}></Calendar>
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
              <table className="report report-showcase export-report" id="export-report" ref={tableRef} data-cols-width="20,35,35">
                <thead>
                  <tr>
                    <th colSpan={"4"} data-a-h="center" data-f-bold="true">
                      <button className="date-range" title="Click me to export the report to Excel file" onClick={() => csvHandler()}>
                        {dateArr(startDate, endDate, "range")}
                      </button>
                    </th>
                  </tr>
                  <tr data-exclude="true">
                    <th colSpan={"4"}>
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
                  {chosenGroup.length !== 0 && (
                    <tr>
                      <th colSpan={"4"} data-a-h="center" data-f-bold="true">
                        {chosenGroup[1]}
                      </th>
                    </tr>
                  )}
                </thead>
                {empDataArr.length > 0 ? (
                  <Fragment>
                    {empDataArr.map((data, index) => (
                      <tbody key={"report-emp-" + data.id} className="report-tbody" id={"emp-" + data.id}>
                        <tr className="report table-section table-row">
                          <td className="report table-section emp-name" colSpan={"4"} data-f-bold={true}>
                            <span>-- {data.name} --</span>
                          </td>
                        </tr>
                        <WorkdayByPerson startDate={startDate} endDate={endDate} employeeID={data.id} employeeName={data.name} shopId={shopId} toGroupArr={toGroupArr} index={index} />
                        <tr></tr>
                      </tbody>
                    ))}
                    <tbody>
                      <tr className="report group-total">
                        <td colSpan={"4"} data-f-color="FF0000" data-f-bold={true}>Group's total workdays: {totalGroupWorkday}.</td>
                      </tr>
                    </tbody>
                  </Fragment>
                ) : (
                  <div>
                    {chosenGroup.length === 0 ? "Please choose a group." : "No employee in this group."} 
                  </div>
                )}
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

export default ReportWorkday;
