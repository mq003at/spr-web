import { useEffect, useRef, useState } from "react";
import { child, onValue, orderByChild, orderByValue, query, set, update } from "firebase/database";
import { empRef, shopRef, statusRef } from "../../js/firebase_init";
import * as FaIcons from "react-icons/fa";
import { Button } from "react-bootstrap";
import EditEmployees from "./EditEmployee";

function EmployeeByGroup(props) {
  const groupId = props.groupId;
  const groupName = props.groupName;
  const shopId = props.shopId;

  const [empList, setEmpList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [showManageEmp, setShowManageEmp] = useState(false);
  const edittedEmp = useRef();

  const handleClickEmp = (emp) => {
    setShowManageEmp(true);
    edittedEmp.current = {
      id: emp.id,
      fname: emp.fname,
      lname: emp.lname,
      name: emp.name,
      groupId: groupId,
      groupName: groupName,
      key: emp.keyId,
    };
  };

  useEffect(() => {
    const qEmp = query(child(empRef(shopId), `${groupId}/employees/`));
    const listener = onValue(qEmp, (snap) => {
      let val = snap.val();
      let tempArr = [];

      if (val) {
        Object.keys(val).forEach((key) => {
          let fname = "";
          let lname = "";
          let id = "";
          let schStatus = "";
          let name = "";

          if (val[key].first_name && val[key].last_name) {
            fname = val[key].first_name;
            lname = val[key].last_name;
          } else {
            fname = val[key].name;
          }

          name = val[key].name;
          id = val[key].tag_id;
          onValue(
            statusRef(shopId, id),
            (snap) => {
              schStatus = snap.val();
              tempArr.push({ fname: fname, lname: lname, id: id, schStatus: schStatus, name: name, keyId: key });
              setEmpList(tempArr.map((x) => x));
            },
            { onlyOnce: true }
          );
        });
      }
    });
  }, [groupId, shopId]);

  useEffect(() => {
    if (empList.length > 0) {
      empList.forEach((emp, index) => {
        return onValue(child(shopRef(shopId), `${emp.id}/actual_state`), (snap) => {
          setStatusList((statusList) => {
            let temp = [...statusList];
            if (!temp[index]) temp.push(snap.val());
            else temp[index] = snap.val();
            return temp;
          });
        });
      });
    }
  }, [empList, shopId]);

  const handleInOut = (id, state) => {
    let today = getDateData();
    console.log("tday", today);
    if (state === "in") {
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
  };

  const inOutButton = (id, index) => {
    if (statusList[index] === "in")
      return (
        <Button type="button" className="inout" variant="outline-danger" onClick={() => handleInOut(id, "in")}>
          <FaIcons.FaSignOutAlt />
        </Button>
      );
    if (statusList[index] === "out")
      return (
        <Button type="button" className="inout" variant="outline-success" onClick={() => handleInOut(id, "out")}>
          <FaIcons.FaSignInAlt />
        </Button>
      );
  };

  useEffect(() => {
    console.log(statusList);
  }, [statusList]);

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

  return (
    <>
      <tr>
        <th>Tag</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Status</th>
        <th>In / Out</th>
        <th>Overtime?</th>
      </tr>

      {empList.length === 0 ? (
        <tr>
          <td colSpan={"10"}>
            <div>This group has no employee.</div>
          </td>
        </tr>
      ) : (
        empList.map((emp, index) => (
          <tr key={"em-ma" + index}>
            <td onClick={() => handleClickEmp(emp)}>{emp.id}</td>
            <td onClick={() => handleClickEmp(emp)}>{emp.fname}</td>
            <td onClick={() => handleClickEmp(emp)}>{emp.lname}</td>
            <td>{statusList[index]}</td>
            <td>{inOutButton(emp.id, index)}</td>
            <td>{emp.schStatus === "overtime" ? "Y" : "N"}</td>
          </tr>
        ))
      )}
      <tr>
        <td>{showManageEmp && <EditEmployees show={showManageEmp} onHide={() => setShowManageEmp(false)} shopId={shopId} emp={edittedEmp.current} groupList={props.groupList} />}</td>
      </tr>
    </>
  );
}

export default EmployeeByGroup;
