import { Fragment, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import WorkdayByDate from "./WorkdayByDate";

function WorkdayByPerson(props) {
  const shopId = props.shopId;
  const startDate = props.startDate;
  const endDate = props.endDate;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;
  const toGroupArr = props.toGroupArr;
  const index = props.index;

  const [dateRange, setDateRange] = useState([]);
  const [hourArr, setHourArr] = useState([]);
  const [totalDay, setTotalDay] = useState(0);
  const [totalHour, setTotalHour] = useState(0);
  const { t } = useTranslation("translation", { keyPrefix: "report-workday" });

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
  useEffect(() => {
    if (hourArr.length > 0) {
      let totalD = 0;
      let totalH = 0;
      hourArr.forEach((hour) => {
        if (hour > 0) {
          totalD++;
          totalH += hour;
        }
        if (hour < 0) totalD++;
      });
      setTotalDay(totalD);
      setTotalHour(totalH);
    }
  }, [hourArr]);

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
    setHourArr(new Array(tempArr.length).fill(0));
  }, [startDate, endDate]);

  // Generate Array
  useEffect(() => {
    if (dateRange.length > 0) {
      setHourArr(new Array(dateRange.length).fill(0));
    }
  }, [dateRange]);

  useEffect(() => {
    toGroupArr(totalDay, index);
  }, [totalDay, toGroupArr, index]);

  return (
    <Fragment>
      {dateRange.length > 0 && dateRange.map((date, index) => <WorkdayByDate addH={addHour} shopId={shopId} employeeID={employeeID} employeeName={employeeName} date={date} index={index} key={"RBP-" + index} />)}
      <tr className="report table-section table-row">
        <td display={"none"} data-exclude={"true"}></td>
        <td className="report table-section total-cell" data-f-color="FF0000">
          <span title="Calculate total working hours of this employee">{t("Total")}</span>
        </td>
        <td className="report table-section time-stamp-cell">
          <span>
            <Trans i18nKey={"report-workday.Total Report"}>
              {{totalDay: totalDay}} workday, or {{totalHour: totalHour}} workhour.
            </Trans>
          </span>
        </td>
      </tr>
    </Fragment>
  );
}

export default WorkdayByPerson;
