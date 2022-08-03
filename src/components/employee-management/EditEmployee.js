import { child, equalTo, get, onValue, orderByChild, query, remove, set, update } from "firebase/database";
import { useFormik } from "formik";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { empRef, shopRef } from "../../js/firebase_init";
import { dateHandler } from "../../js/tool_function";

function EditEmployees(props) {
  const emp = props.emp;
  const id = emp.id;
  const key = emp.key;
  const shopId = props.shopId;
  const groupId = emp.groupId;
  const fname = emp.fname;
  const lname = emp.lname;
  const name = emp.name;

  const [status, setStatus] = useState("");
  const [check, onCheck] = useState(false);

  const formik = useFormik({
    initialValues: {
      empFirstName: fname,
      empTagId: id,
      empLastName: lname,
      groupId: groupId,
      empFullName: name,
    },
    onSubmit: (values) => {
      console.log("Props", props.emp, groupId, id);
      if (!check) {
        handleEditEmp(values.empFirstName, values.empLastName, values.empTagId, values.groupId, values.empFullName);
      } else {
        let nameArr = values.empFirstName.split(" ");
        let fn = nameArr[0];
        let ln = nameArr[1];
        console.log(fn, ln, "fl");
        handleEditEmp(fn, ln, values.empTagId, values.groupId, values.empFullName);
      }
    },
  });

  function handleEditEmp(fn, ln, t_id, grId, n) {
    // Make changes to emp
    if (grId !== groupId || fn !== fname || ln !== lname || t_id !== id || n !== name) {
      let isIdAvailable = true;
      get(empRef(shopId))
        .then((snap) => {
          let val = snap.val();
          if (t_id !== id) {
            Object.keys(val).forEach((key) => {
              let employees = val[key].employees;
              if (employees) {
                Object.keys(employees).forEach((key2) => {
                  if (t_id === employees[key2].tag_id) {
                    setStatus(`ID unvailable. Employee ${employees[key2].name} in group ${val[key].name} already had that ID.`);
                    isIdAvailable = false;
                  }
                });
              }
            });
          }
        })
        .then(() => {
          if (isIdAvailable) {
            const dateStamp = dateHandler(new Date()).dateStamp;
            let tempVal;
            remove(child(empRef(shopId), "/" + groupId + "/employees/" + key));
            set(child(empRef(shopId), "/" + grId + "/employees/" + dateStamp + t_id + "Emp"), {
              name: n,
              first_name: fn,
              last_name: ln,
              tag_id: t_id,
            });
            update(child(shopRef(props.shopId), "/" + t_id), {
              actual_state: "out",
            });

            if (t_id !== id) {
              get(child(shopRef(shopId), "/" + id))
                .then((snap) => {
                  if (snap) tempVal = snap.val();
                })
                .then(() => {
                  console.log("Temp", tempVal);
                  set(child(shopRef(shopId), "/" + t_id), tempVal);
                  remove(child(shopRef(shopId), "/" + id));
                });
            }
            props.onHide();
          }
        });
    } else {
      setStatus("Nothing to change.");
    }
  }

  const deleteEmp = () => {
    remove(child(empRef(shopId), "/" + groupId + "/employees/" + key));
    props.onHide();
  };

  return (
    <Modal show={props.show} onHide={props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Make changes to employee {name}</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit}>
        <Modal.Body>
          <p>Leave the field blank if you do not want to change. You can also press Delete to permanently delete this employee.</p>
          <table id="addPersonTable" className="center noBorder">
            <thead>
              <tr>
                <th></th>
                <th>Old</th>
                <th>New</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>First name: </td>
                <td>{fname}</td>
                <td>
                  <input className="employees form-control" id="empFirstName" name="empFirstName" type="text" onChange={formik.handleChange} value={formik.values.empFirstName}></input>
                </td>
              </tr>
              <tr>
                <td>Last name: </td>
                <td>{lname ? lname : "{empty}"}</td>
                <td>
                  <input className="employees form-control" id="empLastName" name="empLastName" type="text" onChange={formik.handleChange} value={formik.values.empLastName}></input>
                </td>
              </tr>
              <tr>
                <td>Full name: </td>
                <td>{name ? name : "{empty}"}</td>
                <td>
                  <input className="employees form-control" id="empFullName" name="empFullName" type="text" onChange={formik.handleChange} value={formik.values.empFullName}></input>
                </td>
              </tr>
              <tr>
                <td>Tag id: </td>
                <td>{id}</td>
                <td>
                  <input className="employees form-control" id="empTagId" name="empTagId" type="text" onChange={formik.handleChange} value={formik.values.empTagId}></input>
                </td>
              </tr>
              <tr>
                <td>Group: </td>
                <td colSpan={"2"}>
                  <select name="groupId" id="groupId" className="form-select" type="text" aria-multiselectable="false" aria-disabled="false" readOnly={true} text-align="center" defaultValue={groupId} onChange={(e) => formik.setFieldValue("groupId", e.target.value)}>
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
          <div>
            <label>
              <input type="checkbox" checked={check} onChange={() => onCheck(!check)} />
              Split name into First and last name?
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" id="group-submit">
            Submit
          </Button>
          <Button id="emp-delete" onClick={() => deleteEmp()}>
            Delete
          </Button>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default EditEmployees;
