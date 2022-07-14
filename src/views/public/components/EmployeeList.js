import { get, child, orderByChild, query, onChildChanged, set, update, onValue } from "firebase/database";
import { dbRef, employeePath, shopPath, shopRef } from "../js/firebase_init";
import { useEffect, useState, useRef, Fragment } from "react";
import "../css/EmployeeList.css";
import * as FaIcons from "react-icons/fa";
import { Button } from "react-bootstrap";

function EmployeeList(props) {
  const sidebar = props.sidebar;
  const shopId = props.shopId;
  const shopChosen = props.shopChosen;
  const [employeeList, setEmployeeList] = useState([]);
  const empListRef = useRef([]);

  const qState = query(shopRef(shopId), orderByChild("actual_state"));
  empListRef.current = employeeList;

  // Get an instance of all employees
  const getAllEmployee = () => {
    return onValue(child(dbRef, employeePath(shopId)), (snap) => {
      let dataArr = [];
      let tag_id = "";
      let empName = "";
      let groupName = "";
      let val = snap.val();
      Object.keys(val).forEach((key, index) => {
        groupName = val[key].name;
        dataArr.push({
          group: groupName,
          employee: [],
        });
        let empVal = snap.val()[key]["employees"];
        if (empVal !== undefined) {
          Object.keys(empVal).forEach((key) => {
            get(child(dbRef, `${shopPath(shopId)}/${empVal[key].tag_id}/actual_state`)).then((snap) => {
              empName = empVal[key].name;
              tag_id = empVal[key].tag_id;
              dataArr[index].employee.push({
                id: tag_id,
                name: empName,
                state: snap.val(),
              });
              setEmployeeList(dataArr.map((x) => x));
            });
          });
        }
      });
    }, {onlyOnce: true}
  )};

  const watchEmployeeState = () => {
    // eslint-disable-next-line no-unused-vars
    const watchState = onChildChanged(qState, (snap) => {
      let key = snap.key;
      let changedState = snap.val()["actual_state"];
      // console.log(snap.val());
      if (empListRef) {
        const newArr = empListRef.current.map((nested) => {
          return {
            group: nested.group,
            employee: nested.employee.map((elem) => {
              if (elem.id === key) {
                return {
                  ...elem,
                  state: changedState,
                };
              } else return { ...elem };
            }),
          };
        });
        setEmployeeList(newArr.map((x) => x));
      }
    });
  };

  const refreshEmp = () => {
    getAllEmployee();
  };

  const getDateData = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    let hour = ("0" + date.getHours()).slice(-2);
    let minute = ("0" + date.getMinutes()).slice(-2);
    let second = ("0" + date.getSeconds()).slice(-2);
    let milisec = ("" + date.getMilliseconds()).slice(-1);
    let documentStamp = year + month + day + hour + minute + second + milisec;
    let timeStamp = year + month + day + hour + minute + second;
    let dateStamp = year + month + day;

    let obj = {
      documentStamp: documentStamp,
      timeStamp: timeStamp,
      dateStamp: dateStamp,
    };

    return obj;
  };

  function logInOrOut(shopId, id, direction, today) {
    if (direction === "in") {
      set(child(shopRef(shopId), `${id}/log_events/${today.documentStamp}`), {
        dateStamp: today.dateStamp,
        direction: "out",
        timeStamp: today.timeStamp,
      });
      update(child(shopRef(shopId), id), {
        actual_state: "out",
      });
    } else {
      set(child(shopRef(shopId), `${id}/log_events/${today.documentStamp}`), {
        dateStamp: today.dateStamp,
        direction: "in",
        timeStamp: today.timeStamp,
      });
      update(child(shopRef(shopId), id), {
        actual_state: "in",
      });
    }
  }

  const handleInOut = (id, direction) => {
    let today = getDateData();
    // console.log("DateStamp: " + time)
    logInOrOut(shopId, id, direction, today);
  };

  const logOutEveryone = () => {
    if (employeeList) {
      employeeList.map((nested) =>
        nested.employee.map((empData, index) => {
          if (empData.state === "in") {
            let today = getDateData();
            // console.log("DateStamp: " + time)
            logInOrOut(shopId, empData.id, empData.state, today);
          }
        })
      );
      getAllEmployee();
    }
  };

  useEffect(() => {
    getAllEmployee();
    watchEmployeeState();
  }, []);

  return (
    <div className="sidebar" overflow-y="scroll">
      <div className={"table-area " + sidebar}>
        <table id="intro-table" align="center">
          <tbody id="list-opener">
            <tr>
              <th colSpan={"5"}>
                <label className="employee-list-shop-title">{shopChosen} Kirppis</label>
              </th>
            </tr>
            <tr id="employee-list-functionality">
              <th colSpan={"1"}>
                <Button variant="transparent" onClick={() => refreshEmp()}>
                  Refresh
                </Button>
              </th>
              <th colSpan={"2"}>
                <Button variant="transparent" onClick={() => logOutEveryone()}>
                  Logout
                </Button>
              </th>
            </tr>
          </tbody>
          <tbody id="log_user">
            {employeeList
              ? employeeList.map((nested) => {
                  return (
                    <Fragment key={"group-" + nested.group}>
                      <tr className="group-head">
                        <td colSpan={"100%"}>
                          <div>--- {nested.group} ---</div>
                        </td>
                      </tr>
                      {nested.employee &&
                        nested.employee.map((empData, index) => {
                          return (
                            <tr key={"personal-" + index}>
                              <td className="employee-list-name" width={"60%"}>
                                {empData.name}
                              </td>
                              <td className={"employee-list-status " + empData.state} width={"20%"}>
                                {empData.state === "in" ? <FaIcons.FaBriefcase title={"Working"} /> : <FaIcons.FaBed title={"Absent"} />}
                              </td>
                              <td className={"employee-list-inout"} width={"20%"}>
                                {empData.state === "out" ? (
                                  <Button type="button" className="inout" variant="outline-success" onClick={() => handleInOut(empData.id, empData.state)}>
                                    <FaIcons.FaSignInAlt />
                                  </Button>
                                ) : (
                                  <Button type="button" className="inout" variant="outline-danger" onClick={() => handleInOut(empData.id, empData.state)}>
                                    <FaIcons.FaSignOutAlt />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </Fragment>
                  );
                })
              : console.log("emp")}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default EmployeeList;
