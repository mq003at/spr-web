import { child, onValue } from "firebase/database";
import { createRef, Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Calendar } from "react-calendar";
import { empRef } from "../../js/firebase_init";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import TableToExcel from "@linways/table-to-excel";
import "../../css/Report.css";
import WorkdayByPerson from "./WorkdayByPerson";
import { dateArr } from "../../js/tool_function";
import { useTranslation } from "react-i18next";
import useWindowDimensions from "../extra/WindowDimension";

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
  const { t } = useTranslation("translation", { keyPrefix: "report-workday" });
  const { width } = useWindowDimensions();

  const showTheCalendar = () => {
    if (width > 455)
      return (
        <tbody>
          <tr className="noBorder schedule calendar picker">
            <td>
              <input readOnly title="start-day" placeholder={startDate.toLocaleDateString("FI-fi")} onClick={() => setShowStartCalendar(!showStartCalendar)} value={startDate.toLocaleDateString("FI-fi")} />
            </td>
            <td>
              <input readOnly title="end-day" placeholder={startDate.toLocaleDateString("FI-fi")} onClick={() => setShowEndCalendar(!showEndCalendar)} value={endDate ? endDate.toLocaleDateString("FI-fi") : ""} />
            </td>
          </tr>

          <tr className="noBorder schedule calendar board" id="datepick-row">
            <th>
              <Calendar
                className={showStartCalendar ? "" : "hide"}
                onChange={(e) => {
                  onStartDateChange(e);
                  onEndDateChange();
                }}
                value={startDate}
                maxDate={endDate}
              />
            </th>
            <th>
              <Calendar className={showEndCalendar ? "" : "hide"} onChange={onEndDateChange} value={endDate && endDate} minDate={startDate} />
            </th>
          </tr>
        </tbody>
      );
    else
      return (
        <tbody>
          <tr className="noBorder schedule calendar">
            <td>
              <input readOnly title="start-day" placeholder={startDate.toLocaleDateString("FI-fi")} onClick={() => setShowStartCalendar(!showStartCalendar)} value={startDate.toLocaleDateString("FI-fi")} />
            </td>
            <td>
              <Calendar
                className={showStartCalendar ? "" : "hide"}
                onChange={(e) => {
                  onStartDateChange(e);
                  onEndDateChange();
                }}
                value={startDate}
                maxDate={endDate}
              />
            </td>
          </tr>

          <tr className="noBorder schedule calendar" id="datepick-row">
            <td>
              <input readOnly title="end-day" placeholder={startDate.toLocaleDateString("FI-fi")} onClick={() => setShowEndCalendar(!showEndCalendar)} value={endDate ? endDate.toLocaleDateString("FI-fi") : ""} />
            </td>
            <td>
              <Calendar className={showEndCalendar ? "" : "hide"} onChange={onEndDateChange} value={endDate && endDate} minDate={startDate} />
            </td>
          </tr>
        </tbody>
      );
  };

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
      groupArr.sort((a, b) => a.name.localeCompare(b.name));
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
      return onValue(child(empRef(shopId), chosenGroup[0] + "/employees"), (snap) => {
        let val = snap.val();
        let tempData = [];
        if (val === null) setEmpDataArr([]);
        else {
          Object.keys(val).forEach((key) => {
            tempData.push({
              name: val[key].name,
              id: val[key].tag_id,
              first_name: val[key].first_name,
              last_name: val[key].last_name,
            });
          });
          tempData.sort((a, b) => a.last_name.localeCompare(b.last_name));
          setEmpDataArr(tempData.map((x) => x));
        }
      });
    }
  }, [chosenGroup, shopId, startDate, endDate]);

  return (
    <div className="report">
      <div className="date-picker-section">
        <div className="report title">{t("WORKDAY REPORT")}</div>
        <table border={"0"} align={"center"} className="calendar">
          {showTheCalendar()}
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
                      {endDate && (
                        <button className="date-range" title="Click me to export the report to Excel file" onClick={() => csvHandler()}>
                          {dateArr(startDate, endDate, "range")}
                        </button>
                      )}
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
                    {endDate ? (
                      <Fragment>
                        {empDataArr.map((data, index) => (
                          <tbody key={"report-emp-" + data.id} className="report-tbody" id={"emp-" + data.id}>
                            <tr className="report table-section table-row">
                              <td className="report table-section emp-name" colSpan={"4"} data-f-bold={true}>
                                <span>-- {data.last_name ? data.last_name + ", " + data.first_name : data.name} --</span>
                              </td>
                            </tr>
                            <WorkdayByPerson position={index} startDate={startDate} endDate={endDate} employeeID={data.id} employeeName={data.name} shopId={shopId} toGroupArr={toGroupArr} index={index} />
                            <tr></tr>
                          </tbody>
                        ))}
                        <tbody>
                          <tr className="report group-total">
                            <td colSpan={"4"} data-f-color="FF0000" data-f-bold={true}>
                              {t("Group's total workday")} {totalGroupWorkday}.
                            </td>
                          </tr>
                        </tbody>
                      </Fragment>
                    ) : (
                      <tbody>
                        <tr>
                          <td>
                            <div>{t("Please enter end date")}</div>
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </Fragment>
                ) : (
                  <tbody>
                    <tr>
                      <td> {chosenGroup.length === 0 ? t("Please choose a group.") : t("No employee in this group.")}</td>
                    </tr>
                  </tbody>
                )}
              </table>
            ) : (
              <div>{t("Loading Database")}...</div>
            )}
          </div>
          <div className="report-table"></div>
        </div>
      </div>
    </div>
  );
}

export default ReportWorkday;
