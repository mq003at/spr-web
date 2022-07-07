import { Fragment, useCallback, useEffect, useState } from "react";
import { shopRef } from "../../js/firebase_init";
import { dateHandler } from "../../js/tool_function";
import ReportByDate from "./ReportByDate";

function ReportByPerson(props) {
  const shopId = sessionStorage.getItem("shop_id");
  const startDate = props.startDate;
  const endDate = props.endDate;
  const employeeID = props.employeeID;

  const [dateRange, setDateRange] = useState([]);
  const [totalHour, setTotalHour] = useState(parseInt(0));

  // Calculate total hour
  const addHour = useCallback(hour => {
    setTotalHour(totalHour => totalHour + parseInt(hour))
  }, [setTotalHour])

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

  // Console.log
  useEffect(() => {
    console.log(employeeID);
  }, [employeeID]);

  return (
    <Fragment>
      {dateRange.length > 0 &&
        dateRange.map((date, index) => (
          <tr key={"report-" + dateHandler(date).timeStamp} className="report table-section table-row">
            <td className="report table-section date-cell" width={"11.5%"}>
              <span>{date.toLocaleDateString("fi-FI")}</span>
            </td>
            <td className="report table-section time-stamp-cell">
              <ReportByDate shopId={shopId} date={date} employeeID={employeeID} addHour={addHour} />
            </td>
          </tr>
        ))}
      <tr>
        <td>
          <span>Total</span>
        </td>
        <td>{totalHour? <span>{totalHour} hours.</span> : <span>0 hour.</span>}</td>
      </tr>
    </Fragment>
  );
}

export default ReportByPerson;
