import { useEffect, useRef, useState } from "react";
import { child, onValue, query, set, update } from "firebase/database";
import { empRef, logSchRef, shopRef } from "../../js/firebase_init";
import * as FaIcons from "react-icons/fa";
import { Button } from "react-bootstrap";
import EditEmployees from "./EditEmployee";
import { dateHandler } from "../../js/tool_function";
import { useTranslation } from "react-i18next";

function EmployeeByGroup(props) {
  const groupId = props.groupId;
  const groupName = props.groupName;
  const shopId = props.shopId;
  const today = dateHandler(new Date());
  const {t} = useTranslation("translation", {keyPrefix: "employee"})

  const [empList, setEmpList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [overtimeList, setOvertimeList] = useState([]);
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
    return onValue(qEmp, (snap) => {
      let val = snap.val();
      let tempArr = [];

      if (val) {
        Object.keys(val).forEach((key) => {
          let fname = "";
          let lname = "";
          let id = "";
          let name = "";

          if (val[key].first_name && val[key].last_name) {
            fname = val[key].first_name;
            lname = val[key].last_name;
          } else {
            fname = val[key].name;
          }

          name = val[key].name;
          id = val[key].tag_id;
          tempArr.push({ fname: fname, lname: lname, id: id, name: name, keyId: key });
        });
        tempArr.sort((a, b) => a.id - b.id);
        setEmpList(tempArr.map((x) => x));
      }
    });
  }, [groupId, shopId]);

  useEffect(() => {
    if (empList.length > 0) {
      empList.forEach((emp, index) => {
        const watchState = onValue(child(shopRef(shopId), `${emp.id}/actual_state`), (snap) => {
          let val = snap.val();
          setStatusList((status) => {
            let temp = [...status];
            temp[index] = val;
            return [...temp];
          });
        });

        const watchOvertime = onValue(child(logSchRef(shopId, emp.id), today.dateStamp + emp.id + "Sch/isOvertime"), (snap) => {
          let val = snap.val();
          if (!val) val = false;
          setOvertimeList((overtimeList) => {
            let temp = [...overtimeList];
            temp[index] = val;
            return temp;
          });
        });
      });
    }
  }, [empList, shopId, today.dateStamp]);

  const handleInOut = (id, state) => {
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

  const inOutButton = (status, id) => {
    if (status === "in")
      return (
        <Button type="button" className="inout" variant="outline-danger" onClick={() => handleInOut(id, "in")}>
          <FaIcons.FaSignOutAlt />
        </Button>
      );
    if (status === "out")
      return (
        <Button type="button" className="inout" variant="outline-success" onClick={() => handleInOut(id, "out")}>
          <FaIcons.FaSignInAlt />
        </Button>
      );
  };

  const changeTodayOvertime = (status, id) => {
    update(child(logSchRef(shopId, id), today.dateStamp + id + "Sch"), {
      isOvertime: !status,
    });
  };

  return (
    <>
      <tr>
        <th className="employees tag">{t("Tag")}</th>
        <th className="employees fn">{t("First Name")}</th>
        <th className="employees ln">{t("Last Name")}</th>
        <th className="employees status">{t("Status")}</th>
        <th className="employees inout">{t("In / Out")}</th>
        <th className="employees overtime">{t("Overtime?")}</th>
      </tr>

      {empList.length === 0 ? (
        <tr>
          <td colSpan={"10"}>
            <div>{t("This group has no employee.")}</div>
          </td>
        </tr>
      ) : (
        empList.map((emp, index) => (
          <tr key={"em-ma" + index}>
            <td className="employees tag" onClick={() => handleClickEmp(emp)}>{emp.id}</td>
            <td className="employees fn" onClick={() => handleClickEmp(emp)}>{emp.fname}</td>
            <td className="employees ln" onClick={() => handleClickEmp(emp)}>{emp.lname}</td>
            <td className="employees status">{statusList[index] ? statusList[index] : t("Loading Status")}</td>
            <td className="employees inout">{statusList[index] ? inOutButton(statusList[index], emp.id) : t("Loading Status")}</td>
            <td className="employees overtime">
              <input type="checkbox" checked={overtimeList[index] ? true : false} onChange={() => changeTodayOvertime(overtimeList[index], emp.id)}></input>
            </td>
          </tr>
        ))
      )}
      <tr id="modal-emp">
        <td>{showManageEmp && <EditEmployees show={showManageEmp} onHide={() => setShowManageEmp(false)} shopId={shopId} emp={edittedEmp.current} groupList={props.groupList} />}</td>
      </tr>
    </>
  );
}

export default EmployeeByGroup;
