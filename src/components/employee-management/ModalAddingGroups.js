import { child, equalTo, onValue, orderByChild, query, set } from "firebase/database";
import { useFormik } from "formik";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { empRef } from "../../js/firebase_init";
import { dateHandler } from "../../js/tool_function";

function ModalAddingGroup(props) {
  const [status, setStatus] = useState("");

  const formik = useFormik({
    initialValues: {
        addedGroup: "",
    },
    onSubmit: (values) => {
      handleAddGroup(values.addedGroup);
    },
  });

  function handleAddGroup(name) {
    console.log(name);
    if (!name) setStatus("Group name cannot be empty.");
    else {
      const qGroup = query(empRef(props.shopId), orderByChild("name"), equalTo(name));
      onValue(
        qGroup,
        (snap) => {
          if (snap.val()) setStatus("Group name unavailable. Please choose a different name.")
          else {
            const id = dateHandler(new Date()).timeStamp + "Grp";
            set(child(empRef(props.shopId), id), {
                name: name
            })
            props.onHide();
          }
        },
        { onlyOnce: true }
      );
    }
  }

  return (
    <Modal className="inv" show={props.show} onHide={props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Add group to the list</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit}>
        <Modal.Body>
          <p>Group name:</p>
          <input id="addedGroup" name="addedGroup" type="text" onChange={formik.handleChange} value={formik.values.addedGroup}></input>
          <div>
            {" "}
            <small className="employees status">{status}</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" id="group-submit">
            Submit
          </Button>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalAddingGroup;
