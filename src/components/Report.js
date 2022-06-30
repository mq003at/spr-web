import { child, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { Calendar } from "react-calendar";
import { dbRef, empRef, shopRef } from "../js/firebase_init";

import "../css/Report.css";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";

function Report() {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startDate, onStartDateChange] = useState(new Date());
  const [endDate, onEndDateChange] = useState(new Date(Date.now() + 3600 * 1000 * 24));
  const [groupList, setGroupList] = useState([]);
  const [chosenGroup, setChosenGroup] = useState([]);
  const [empDataArr, setEmpDataArr] = useState([]);

  const shopId = sessionStorage.getItem("shop_id");

  const getAllGroup = () => {
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
  };

  const refreshGroup = () => {
    getAllGroup();
  };

  useEffect(() => {
    getAllGroup();
  }, []);

  useEffect(() => {
    if (chosenGroup.length > 1) {
      onValue(child(empRef(shopId), chosenGroup[0] + "/employees"), (snap) => {
        let val = snap.val();
        let tempData = [];
        Object.keys(val).forEach((key) => {
          tempData.push(val[key].name);
        });
        setEmpDataArr(tempData.map((x) => x));
      });
    }
  }, [chosenGroup]);

  useEffect(() => {
    console.log(groupList);
  }, [groupList]);

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
                    <td>
                      <div className="date-range">
                        {startDate.toLocaleDateString("fi-FI")} - {endDate.toLocaleDateString("fi-FI")}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ButtonGroup className="mb-2 flex-wrap">
                        {groupList.map((group) => {
                          return (
                            <ToggleButton key={"group-button-" + group.name} className="rounded-0" variant="danger" type="radio" name="group-radio" onClick={() => setChosenGroup([group.id, group.name])}>
                              {group.name}
                            </ToggleButton>
                          );
                        })}
                      </ButtonGroup>
                    </td>
                  </tr>
                  <tr>{chosenGroup.name}</tr>
                </thead>
                {empDataArr.length !== 0 &&
                  empDataArr.map((name, index) => (
                    <tbody key={"report-emp-" + name + "-" + index} className="report-tbody">
                      <tr>
                        <td className="report-td">
                          <span>-- {name} --</span>
                        </td>
                      </tr>
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
