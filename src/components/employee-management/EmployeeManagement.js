import { Fragment, useEffect, useRef, useState } from "react";
import { Button, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { onValue, orderByChild, query } from "firebase/database";
import { empRef } from "../../js/firebase_init";
import EmployeeByGroup from "./EmployeeByGroup";
import "../../css/EmployeeManagement.css";
import ModalAddingGroup from "./ModalAddingGroups";
import ModalDeletingGroup from "./ModalDeletingGroup";
import ModalAddingEmp from "./ModalAddingEmp";
import { useTranslation } from "react-i18next";

function EmployeeManagement(props) {
  const [chosenGroup, setChosenGroup] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const groupRef = useRef([]);
  const chosenRef = useRef();
  const { t } = useTranslation("translation", { keyPrefix: "employee" });

  const shopId = sessionStorage.getItem("shop_id");


  useEffect(() => {
    const qGroup = query(empRef(shopId), orderByChild("name"))
    return onValue(qGroup, (snap) => {
      let val = snap.val();
      let groupArr = [];
      Object.keys(val).forEach((key) => {
        groupArr.push({
          id: key,
          name: val[key].name,
        });
      });
      groupArr.sort((a, b) => a.name.localeCompare(b.name));
      if (groupArr.length !== groupList.length) setGroupList(groupArr.map((x, index) => ({...x, index: index})));
    });
  }, [shopId, groupList]);

  useEffect(() => {
    if (groupList.length > 0) {
      const tempGroup = [...groupList];
      if (tempGroup.length !== groupRef.current.length) 
      {
        setChosenGroup([]);
        groupRef.current = groupList;
      }
    }
  }, [groupList]);

  useEffect(() => {
    console.log("chosen", chosenGroup)
    console.log("list", groupList)
  }, [chosenGroup, groupList])

  return (
    <div className="employees">
      <div className="employees title">{t("EMPLOYEE MANAGEMENT")}</div>
      <hr></hr>

      <div className="employees showcase-section">
        <table className="employees showcase" id="employees-table">
          <thead>
            <tr>
              <th className={"employees clickbutton"} colSpan={"6"}>
                <table id="employees-nested">
                  <tbody>
                    <tr>
                      <td>
                        <Button className="employees group-option" onClick={() => setShowAddGroup(true)}>
                          <div>{t("Add Group")}</div>
                        </Button>
                      </td>
                      <td>
                        <Button className="employees group-option" onClick={() => setShowAddEmp(true)}>
                          <div>{t("Add Employees")}</div>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={"6"}>
                <div className="employees group-list">
                  <ToggleButtonGroup id="tg-btn-emp-mn" className="rounded-0 mb-2 flex-wrap" variant="danger" type="checkbox" name="group-checkbox" value={chosenGroup} onChange={(group) => setChosenGroup(group)}>
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
            {chosenGroup.length > 0 &&
              chosenGroup.map((group) => {
                return (
                  <Fragment key={`schedule-gnm-${group.id}`}>
                    <tr>
                      <th colSpan={"6"}>
                        <div className="employees group-name" onClick={() => {setShowDeleteGroup(true); chosenRef.current = group.index}}>{`--- ${group.name} ---`}</div>
                      </th>
                    </tr>

                    <EmployeeByGroup shopId={shopId} groupId={group.id} groupList={groupList} groupName={group.name} />
                    <tr></tr>
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
      {showDeleteGroup && <ModalDeletingGroup show={showDeleteGroup} onHide={() => setShowDeleteGroup(false)} shopId={shopId} resetChosen={() => setChosenGroup([])} groupId={groupList[chosenRef.current].id} groupName={groupList[chosenRef.current].name} />}
      {showAddGroup && <ModalAddingGroup show={showAddGroup} onHide={() => setShowAddGroup(false)} shopId={shopId} resetChosen={() => setChosenGroup([])}/>}
      {showAddEmp && <ModalAddingEmp show={showAddEmp} onHide={() => setShowAddEmp(false)} shopId={shopId} groupList={groupList} />}
    </div>
  );
}

export default EmployeeManagement;
