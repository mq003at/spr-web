import { Fragment, useEffect, useRef, useState } from "react";
import { Button, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { onValue } from "firebase/database";
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
  const { t } = useTranslation("translation", { keyPrefix: "employee" });

  const shopId = sessionStorage.getItem("shop_id");

  useEffect(() => {
    return onValue(empRef(shopId), (snap) => {
      let val = snap.val();
      let groupArr = [];
      Object.keys(val).forEach((key, index) => {
        groupArr.push({
          id: key,
          name: val[key].name,
          index: index,
        });
      });
      groupArr.sort((a, b) => a.name.localeCompare(b.name));
      setGroupList(groupArr.map((x) => x));
    });
  }, [shopId]);

  useEffect(() => {
    if (groupList.length > 0) {
      const tempGroup = [...groupList];
      if (tempGroup.length !== groupRef.current.length) setChosenGroup([]);
      groupRef.current = groupList;
    }
  }, [groupList]);

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
            {chosenGroup.length > 0 &&
              chosenGroup.map((group) => {
                return (
                  <Fragment key={`schedule-gnm-${group.id}`}>
                    <tr>
                      <th colSpan={"6"}>
                        <div className="employees group-name" onClick={() => setShowDeleteGroup(true)}>{`--- ${group.name} ---`}</div>
                      </th>
                    </tr>

                    <EmployeeByGroup shopId={shopId} groupId={group.id} groupList={groupList} groupName={groupList[group.index].name} />
                    {showDeleteGroup && <ModalDeletingGroup show={showDeleteGroup} onHide={() => setShowDeleteGroup(false)} shopId={shopId} groupId={group.id} groupName={groupList[group.index].name} />}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {showAddGroup && <ModalAddingGroup show={showAddGroup} onHide={() => setShowAddGroup(false)} shopId={shopId} />}
      {showAddEmp && <ModalAddingEmp show={showAddEmp} onHide={() => setShowAddEmp(false)} shopId={shopId} groupList={groupList} />}
    </div>
  );
}

export default EmployeeManagement;
