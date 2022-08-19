import { child, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { empRef } from "../../js/firebase_init";
import { dateArr, dateHandler } from "../../js/tool_function";
import ScheduleByPerson from "./ScheduleByPerson";
import { useTranslation } from "react-i18next";

function ScheduleByGroup(props) {
  const groupId = props.groupId;
  const shopId = props.shopId;
  const startDay = props.startDay;
  const endDay = props.endDay;

  const [empList, setEmpList] = useState([]);
  const [dayArr, setDayArr] = useState([]);
  const { t } = useTranslation("translation", {keyPrefix: "schedule"})

  // Get days
  useEffect(() => {
    setDayArr(dateArr(startDay, endDay, "arr"));
  }, [startDay, endDay]);

  // Get list of employees
  useEffect(() => {
    onValue(
      child(empRef(shopId), `${groupId}/employees`),
      (snap) => {
        let val = snap.val();
        let tempArr = [];
        Object.keys(val).forEach((key) => {
          tempArr.push({ name: val[key].name, id: val[key].tag_id });
        });
        setEmpList(tempArr.map((x) => x));
      },
      { onlyOnce: true }
    );
  }, [groupId, shopId]);

  return (
    <tr>
      <td colSpan={"2"} className="schedule cell-table">
        <div className="schedule wrapper cell-table">
          <div className="schedule grid-wrapper cell-table">
            <div className="table-responsive cell-table pl-3 pr-3">
              {empList.length === 0 ? (
                <div>{t("There is no employee in this group to get the schedule from.")}</div>
              ) : (
                <table className="schedule in-cell-table">
                  <thead>
                    <tr>
                      <th>{""}</th>
                      {empList.map((emp) => (
                        <th key={`schedule-head-${emp.id}`}>{emp.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dayArr.length === 0 ? (
                      <td>{t("Loading database...")}</td>
                    ) : (
                      dayArr.map((day, index) => (
                        <tr key={`schedule-day-${day.toLocaleDateString("sv-SE")}`}>
                          <td>{day.toLocaleDateString("FI-fi")}</td>
                          {empList.map((emp) => (
                            <td key={`schedule-cell-${emp.id}`}>
                              <ScheduleByPerson shopId={shopId} id={emp.id} name={emp.name} date={dateHandler(day).dateStamp} />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default ScheduleByGroup;
