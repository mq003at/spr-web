import { get, onValue } from "firebase/database";
import { Fragment, useEffect, useState } from "react";
import { ButtonGroup, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import Calendar from "react-calendar";
import { empRef } from "../js/firebase_init";
import ScheduleByPerson from "./schedule-component/ScheduleByPerson";

function Schedule() {
  const shopId = sessionStorage.getItem("shop_id");

  const [startDay, setStartDay] = useState(new Date());
  const [endDay, setEndDay] = useState(new Date(Date.now() + 24 * 3600 * 1000));
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [chosenGroup, setChosenGroup] = useState([]);

  // Date checker (in case glass breaks)
  useEffect(() => {
    if (startDay.getTime() > endDay.getTime()) {
      const temp = startDay;
      setStartDay(endDay);
      setEndDay(temp);
    }
  }, [startDay, endDay]);

  // Gather group
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

  // Console.log
  useEffect(() => {
    console.log("gr", groupList);
    console.log("chg", chosenGroup);
  }, [chosenGroup, groupList]);

  return (
    <div className="schedule-function">
      <div className="schedule-title">Schedule</div>
      <div className="calendar">
        <table border={"0"} align={"center"} className="calendar">
          <tbody>
            <tr className="noBorder">
              <td>
                <input readOnly title="start-day" placeholder={startDay.toLocaleString("FI-fi")} onClick={() => setShowStartCalendar(!showStartCalendar)} value={startDay.toLocaleDateString("FI-fi")} />
              </td>
              <td>
                <input readOnly title="end-day" placeholder={startDay.toLocaleString("FI-fi")} onClick={() => setShowEndCalendar(!showEndCalendar)} value={endDay.toLocaleDateString("FI-fi")} />
              </td>
            </tr>

            <tr className="noBorder" id="datepick-row">
              <th>
                <Calendar className={!showStartCalendar && "hide"} onChange={setStartDay} value={startDay} />
              </th>
              <th>
                <Calendar className={!showEndCalendar && "hide"} onChange={setEndDay} value={startDay} />
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      <hr></hr>
      <div className="schedule-showcase">
        <table className="schedule-table">
          <thead>
            <tr>
              <td>
                <div className="showcase-date-range">
                  {startDay.toLocaleDateString("FI-fi")} - {endDay.toLocaleDateString("FI-fi")}
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="group-list">
                  <ToggleButtonGroup className="rounded-0 mb-2 flex-wrap" variant="danger" type="checkbox" name="group-checkbox" value={chosenGroup} onChange={(group) => setChosenGroup(group)}>
                    {groupList.length > 0 &&
                      groupList.map((group, index) => {
                        return (
                          <ToggleButton key={`schedule-gbtn-${group.id}`} id={`schedule-${group.id}`} value={group}>
                            {group.name}
                          </ToggleButton>
                        );
                      })}
                  </ToggleButtonGroup>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody>
            {chosenGroup.map((group, index) => {
              return (
                <Fragment key={`schedule-gnm-${group.id}`}>
                  <tr>
                    <th>
                      <div className="group-name">{group.name}</div>
                    </th>
                  </tr>
                  <tr>
                    {/* Table placement for each group*/}
                    <ScheduleByPerson />
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Schedule;
