import { child, onValue, orderByChild, query, startAt } from "firebase/database";
import { createRef, Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Calendar } from "react-calendar";
import { empRef, shopRef } from "../js/firebase_init";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import TableToExcel from "@linways/table-to-excel";
import "../css/Report.css";
import ReportByPerson from "./report-components/ReportByPerson";
import { dateArr, dateHandler } from "../js/tool_function";
import { CSVLink } from "react-csv";

function Report() {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startDate, onStartDateChange] = useState(new Date(Date.now() - 3600 * 1000 * 24));
  const [endDate, onEndDateChange] = useState(new Date());
  const [groupList, setGroupList] = useState([]);
  const [chosenGroup, setChosenGroup] = useState([]);
  const [empDataArr, setEmpDataArr] = useState([]);

  // For CSV
  const dateRef = useRef([""]);
  const [dataCsv, setDataCsv] = useState([]);
  const csvArr = useRef([]);

  const tableRef = createRef();
  const shopId = sessionStorage.getItem("shop_id");

  // Function handling CSV
  const addCsvLog = useCallback((log, id, date) => {
    let tempArr = [];
    let finalData = [];
    console.log("Data receive", log, id, date);
    if (csvArr.current === 0) csvArr.current([tempArr]);
    else {
      let currentTemp = csvArr.current;
      let temp = currentTemp.filter((dataArr) => {
        if (dataArr.includes(id) && dataArr.includes(date)) return false;
        else return true;
      });
      temp.push([id, date, log]);
      csvArr.current = temp;
      tempArr = csvArr.current.map((item) => item[2]);
      tempArr.forEach((elem) => elem.forEach((x) => finalData.push(x)));
      setDataCsv([dateRef.current[0], ...finalData]);
    }
  }, []);

  const toCsvData = () => {
    if (csvArr.current.length === 0) return "";
    else {
      let data = csvArr.current.map((day) => day[2]);
      // data.unshift(dateArr.current);
      console.log([csvArr.current]);
      return [data];
    }
  };

  // Handling CSV !important
  useEffect(() => {
    const range = dateArr(startDate, endDate, "csv");
    const today = dateHandler(new Date()).dateCSV;
    dateRef.current[0] = [today, range];
  }, [startDate, endDate]);
  useEffect(() => {
    console.log("state", dataCsv);
  }, [dataCsv]);
  const handleCsvDeliver = () => {
  };

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
    csvArr.current = [];
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
              <table className="report report-showcase export-report" id="export-report" ref={tableRef} data-cols-width="20,35">
                <thead>
                  <tr>
                    <th colSpan={"3"} data-a-h="center" data-f-bold="true">
                      <button className="date-range" title="Click me to export the report to Excel file" onClick={() => csvHandler()}>
                        {dateArr(startDate, endDate, "range")}
                      </button>
                    </th>
                  </tr>
                  <tr>
                    <th colSpan={"3"} data-exclude="true">
                      {dataCsv.length > 0 && (
                        <div className="report-option">
                          <Button title="Click download a preview of this report as CSV file">
                            <CSVLink data={dataCsv} separator=";" filename={"my-file.csv"} enclosingCharacter={``}>
                              Export as CSV {"(+" + (dataCsv.length - 1) + " updates)"}
                            </CSVLink>
                          </Button>
                          <div>{"    "}</div>
                          <Button title="Click to deliver this report directly to Velho" onClick={handleCsvDeliver}>
                            Send Report As CSV To Velho
                          </Button>
                        </div>
                      )}
                    </th>
                  </tr>
                  <tr data-exclude="true">
                    <th colSpan={"3"}>
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
                      <th colSpan={"3"} data-a-h="center" data-f-bold="true">
                        {chosenGroup[1]}
                      </th>
                    </tr>
                  )}
                </thead>
                {empDataArr.length !== 0 &&
                  empDataArr.map((data, index) => (
                    <tbody key={"report-emp-" + data.id} className="report-tbody" id={"emp-" + data.id}>
                      <tr className="report table-section table-row">
                        <td className="report table-section emp-name" colSpan={"3"} data-f-bold={true}>
                          <span>-- {data.name} --</span>
                        </td>
                      </tr>
                      <ReportByPerson startDate={startDate} endDate={endDate} employeeID={data.id} employeeName={data.name} addCsvLog={addCsvLog} />
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
