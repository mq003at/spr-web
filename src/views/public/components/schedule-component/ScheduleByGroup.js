import { child, get, onValue, orderByChild, query } from "firebase/database";
import { useEffect, useState } from "react";
import { employeePath, empRef, logSchRef } from "../../js/firebase_init";
import { dateArr } from "../../js/tool_function";
import ScheduleByPerson from "./ScheduleByPerson";

function ScheduleByGroup(props) {
  const groupId = props.groupId;
  const shopId = sessionStorage.getItem("shop_id");
  const startDay = props.startDay;
  const endDay = props.endDay;

  const [empList, setEmpList] = useState([]);
  const [dayArr, setDayArr] = useState([]);

  // Get days
  useEffect(() => {
     setDayArr(dateArr(startDay, endDay, "arr"))
  }, [startDay, endDay])

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

  // Get employees' schedule
  useEffect(() => {
    // if (empList.length > 0) {
    //     empList.forEach(employee => {
    //         onValue(logSchRef(shopId, employee.id), snap => {
    //             let val = snap.val();
    //         })
    //         let qSchedule = query(logSchRef(shopId, employee.id), orderByChild(dateStamp))
    //     })
    // }
  }, [empList, dayArr]);

  useEffect(() => {
    console.log(dayArr);
  }, [dayArr]);

  return (
    <td>
      {empList.length === 0 ? (
        <div>There is no employee in this group to get the schedule from.</div>
      ) : (
        <table>
          {/* For each  */}
          <thead>
            <tr>
              <td>
              </td>
              {empList.map(emp => <td key={`schedule-head-${emp.id}`}>{emp.name}</td>)}
            </tr>
          </thead>
          <tbody>
            {dayArr.length === 0
             ? <div>Loading database......</div>
             : (
                dayArr.map((day, index) => (
                    <tr key={`schedule-day-${day.toLocaleDateString("sv-SE")}`}>
                        <td>{day.toLocaleDateString("FI-fi")}</td>
                        {empList.map(emp => <td key={`schedule-cell-${emp.id}`}><ScheduleByPerson /></td>)}
                    </tr>
                ))
             )
            }
          </tbody>
        </table>
      )}
    </td>
  );
}

export default ScheduleByGroup;
