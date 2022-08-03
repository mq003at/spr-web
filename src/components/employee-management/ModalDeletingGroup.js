import { child, onValue, remove, update } from "firebase/database";
import { useFormik } from "formik";
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { empRef } from "../../js/firebase_init";

function ModalDeletingGroup(props) {
  const [status, setStatus] = useState("");

  const formik = useFormik({
    initialValues: {
      groupName: ""
    }, onSubmit: (values) => {handleGroupName(values.groupName);}
  })

  const handleGroupDelete = () => {
    const groupId = props.groupId;
    const shopId = props.shopId;

    onValue(child(empRef(shopId), groupId), snap => {
      let val = snap.val();
      if (!val) {
        remove(child(empRef(shopId), groupId));
        props.onHide();
      } else setStatus(`Group ${props.groupName} is not empty.`)
    }, {onlyOnce: true})
  };

  function handleGroupName (name) {
    update(child(empRef(props.shopId), props.groupId), {name: name})
    props.onHide();
  }

  return (
    <Modal className="inv" show={props.show} onHide={props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Manage group {props.groupName}</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit}>
      <Modal.Body>
        <p>If you want to delete this group, make sure that every employees in this group are deleted. Press Delete only when you have deleted everyone in group <b>{props.groupName}</b>.</p>
        <p>Otherwise you can change the group's name by typing the new one and press Change Name.</p>
        <input className="employees form-control" id="groupName" name="groupName" type="text" onChange={formik.handleChange} value={formik.values.groupName} placeholder={props.groupName}></input>
        <p>{status}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => handleGroupDelete()}>Delete</Button>
        <Button type="submit">Change Name</Button>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalDeletingGroup;
