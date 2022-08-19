import { onValue } from "firebase/database";
import { Fragment, useEffect, useState } from "react";
import { Button, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import Calendar from "react-calendar";
import { empRef } from "../../js/firebase_init";
import { dateArr } from "../../js/tool_function";
import ScheduleByGroup from "./ScheduleByGroup";
import ScheduleUpload from "./ScheduleUpload";
import "../../css/Schedule.css"
import { useTranslation } from "react-i18next";


function Schedule() {
  const shopId = sessionStorage.getItem("shop_id");
  const maxSchedule = new Date(Date.now() + 31 * 24 * 3600 * 1000);

  const [startDay, setStartDay] = useState(new Date());
  const [endDay, setEndDay] = useState(maxSchedule);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [chosenGroup, setChosenGroup] = useState([]);
  const { t } = useTranslation("translation", {keyPrefix: "schedule"})

  const [showScheduleUploadModal, setShowScheduleUploadModal] = useState(false);

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
    console.log(shopId)
  }, [shopId]);

  return (
    <div className="schedule-function">
      <div className="schedule title">{t("SCHEDULE")}</div>
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
                <Calendar className={showStartCalendar ? "" : "hide"} onChange={setStartDay} value={startDay} />
              </th>
              <th>
                <Calendar className={showEndCalendar ? "" : "hide"} onChange={setEndDay} value={startDay} maxDate={maxSchedule} />
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      <hr></hr>
      <div className="schedule showcase-section">
        <table className="schedule showcase" id="schedule-table">
          <thead>
            <tr>
              <td colSpan={"2"}>
                <div className="schedule date-range">
                  {dateArr(startDay, endDay, "range")}
                </div>
              </td>
            </tr>
            <tr>
              <td><Button onClick={() => setShowScheduleUploadModal(true)}>{t("Upload Schedule CSV file")}</Button></td>
              <td><Button>{t("Export as Excel File")}</Button></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={"2"}>
                <div className="group-list">
                  <ToggleButtonGroup className="rounded-0 mb-2 flex-wrap" variant="danger" type="checkbox" name="group-checkbox" value={chosenGroup} onChange={(group) => setChosenGroup(group)}>
                    {groupList.length > 0 ? (
                      groupList.map((group, index) => {
                        return (
                          <ToggleButton key={`schedule-gbtn-${group.id}`} id={`schedule-${group.id}`} value={group}>
                            {group.name}
                          </ToggleButton>
                        );
                      })
                    ) : (
                      <div>{t("Loading database...")}</div>
                    )}
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
                    <th colSpan={"2"}>
                      <div className="group-name">{group.name}</div>
                    </th>
                  </tr>
                    {/* Table placement for each group*/}
                    <ScheduleByGroup shopId={shopId} groupName={group.name} groupId={group.id} startDay={startDay} endDay={endDay} />
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {showScheduleUploadModal && <ScheduleUpload show={showScheduleUploadModal} onHide={() => setShowScheduleUploadModal(false)} shopId={shopId}/>}
    </div>
  );
}

export default Schedule;
