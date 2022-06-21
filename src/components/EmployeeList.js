import { get, child, onValue, orderByChild, query, equalTo, onChildChanged } from "firebase/database";
import { dbRef, employeePath, shopPath, empRef, shopRef } from "../js/firebase_init";
import { useEffect, useState } from "react";
import "../css/EmployeeList.css";
import * as FaIcons from "react-icons/fa";

function EmployeeList(props) {
  const [shopId, setShopId] = useState(props.shopId);
  const [shopChosen, setShopChosen] = useState(props.shopChosen);
  const [sidebar, setSidebar] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const toggleSidebar = () => setSidebar(!sidebar);

  const qState = query(shopRef(shopId), orderByChild("actual_state"));

  // Get an instance of all employees
  const getAllEmployee = () => {
    get(child(dbRef, employeePath(shopId))).then((snap) => {
      let dataArr = [];
      let tag_id = "";
      let empName = "";
      let groupName = "";
      let val = snap.val();
      Object.keys(val).forEach((key, index) => {
        groupName = val[key].name;
        dataArr.push([groupName]);
        let empVal = snap.val()[key]["employees"];
        if (empVal != undefined) {
          Object.keys(empVal).forEach((key) => {
            get(child(dbRef, `${shopPath(shopId)}/${empVal[key].tag_id}/actual_state`)).then((snap) => {
              empName = empVal[key].name;
              tag_id = empVal[key].tag_id;
              dataArr[index].push([empName, tag_id, snap.val()]);
              setEmployeeList(dataArr.map((x) => x));
            });
          });
        }
      });
    });
  };

  const watchEmployeeState = () => {
    onChildChanged(qState, snap => {
      // snap.key -> snap.val()["actual_state"]
      let key = snap.key;
      console.log(key)
      if (employeeList.length > 0) {
        console.log(employeeList[0])
      }
    })
  }

  useEffect(() => {
    getAllEmployee();
    watchEmployeeState();
  }, []);

  useEffect(() => {
    console.log(employeeList)
  }, [employeeList])

  return (
    <div className="sidebar" overflow-y="scroll" height="100vh">
      <table id="intro-table" align="center">
        <tbody id="list-opener">
          <tr>
            <th colSpan={"5"}>
              <label className="employee-list-shop-title">{shopChosen}</label>
            </th>
          </tr>
          <tr id="employee-list-functionality">
            <th colSpan={"1"}>Refresh</th>
            <th colSpan={"3"}>Logout Everyone</th>
          </tr>
        </tbody>
        <tbody id="log_user">
          {employeeList
            ? employeeList.map((nested) =>
                nested.map((elem, index) => {
                  if (index == 0) {
                    return (
                      <tr className="group-head" key={"group" + index} id={elem}>
                        <td colSpan={"100%"} key={"group-" + elem}>
                          <div>--- {elem} ---</div>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={"personal-" + elem[1]}>
                        <td className="employee-list-name" width={"60%"}>
                          {elem[0]}
                        </td>
                        <td className={"employee-list-status "+elem[2]} width={"20%"}>
                          {elem[2] == "in"
                            ? <FaIcons.FaBriefcase title={"Working"}/>
                            : <FaIcons.FaBed title={"Absent"}/>
                          }
                        </td>
                        <td className={"employee-list-inout"} width={"20%"}>
                          {elem[2] == "in"
                          ? <FaIcons.FaSignInAlt style={{color: "green"}}/>
                          : <FaIcons.FaSignOutAlt/>}                     
                        </td>
                      </tr>
                    );
                  }
                })
              )
            : console.log("empty")}
        </tbody>
      </table>
    </div>
  );
}
export default EmployeeList;
