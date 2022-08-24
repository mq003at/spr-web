import { child, get, set } from "firebase/database";
import { useFormik } from "formik";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { empRef, shopRef } from "../../js/firebase_init";
import { dateHandler } from "../../js/tool_function";

function ModalAddingEmp(props) {
  const [status, setStatus] = useState("");
  const { t } = useTranslation("translation", { keyPrefix: "employee" });

  const groupList = props.groupList;
  let initGroup = "";
  if (groupList.length > 0) initGroup = groupList[0].id;

  const formik = useFormik({
    initialValues: {
      empFirstName: "",
      empTagId: "",
      empLastName: "",
      groupId: initGroup,
      empFullName: "",
    },
    onSubmit: (values) => {
      handleAddGroup(values.empFirstName, values.empLastName, values.empTagId, values.groupId, values.empFullName);
    },
  });

  function handleAddGroup(fname, lname, t_id, grId, n) {
    if (!fname || !lname || !t_id) setStatus(t("All fields must be filled."));
    else {
      let isIdAvailable = true;
      get(empRef(props.shopId))
        .then((snap) => {
          let val = snap.val();
          Object.keys(val).forEach((key) => {
            let employees = val[key].employees;
            if (employees) {
              Object.keys(employees).forEach((key2) => {
                if (t_id === employees[key2].tag_id) {
                  setStatus(
                    <Trans i18nKey={"employee.Dupplicate name"}>
                      ID unvailable. Employee {{ name: employees[key2].name }} in group {{ group: val[key].name }} already had that ID.
                    </Trans>
                  );
                  isIdAvailable = false;
                }
              });
            }
          });
        })
        .then(() => {
          if (isIdAvailable) {
            const empId = dateHandler(new Date()).dateStamp + t_id + "Emp";
            set(child(empRef(props.shopId), "/" + grId + "/employees/" + empId), {
              name: fname + " " + lname,
              first_name: fname,
              last_name: lname,
              tag_id: t_id,
            });

            set(child(shopRef(props.shopId), "/" + t_id), {
              actual_state: "out",
            });
            props.onHide();
          }
        });
    }
  }

  return (
    <Modal className="inv" show={props.show} onHide={props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{t("Add employee to group")}</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit}>
        <Modal.Body>
          <table id="addPersonTable" className="center noBorder">
            <tbody>
              <tr>
                <td width={"30%"}>{t("First Name")} </td>
                <td>
                  <input className="employees form-control" id="empFirstName" name="empFirstName" type="text" onChange={formik.handleChange} value={formik.values.empFirstName}></input>
                </td>
              </tr>
              <tr>
                <td>{t("Last Name")} </td>
                <td>
                  <input className="employees form-control" id="empLastName" name="empLastName" type="text" onChange={formik.handleChange} value={formik.values.empLastName}></input>
                </td>
              </tr>
              <tr>
                <td>{t("Full name")} </td>
                <td>
                  <input className="employees form-control" id="empFullName" name="empFullName" type="text" onChange={formik.handleChange} value={formik.values.empFullName} placeholder={t("Velho's full name must be the same")}></input>
                </td>
              </tr>
              <tr>
                <td>{t("Tag id")} </td>
                <td>
                  <input className="employees form-control" id="empTagId" name="empTagId" type="text" onChange={formik.handleChange} value={formik.values.empTagId} placeholder={t("Ideal Format GGYYXXXX")}></input>
                </td>
              </tr>
              <tr>
                <td>{t("Group")} </td>
                <td>
                  <select name="groupId" id="groupId" className="form-select" type="text" aria-multiselectable="false" aria-disabled="false" readOnly={true} text-align="center" onChange={(e) => formik.setFieldValue("groupId", e.target.value)}>
                    {props.groupList.length > 0 &&
                      props.groupList.map((group, index) => (
                        <option key={"add-modal-" + group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <small className="employees status">{status}</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>
            {t("Close")}
          </Button>
          <Button type="submit" id="group-submit">
            {t("Submit")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalAddingEmp;
