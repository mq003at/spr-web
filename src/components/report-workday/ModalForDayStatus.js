import { Button, Modal } from "react-bootstrap";
import { child, update } from "firebase/database";
import { useFormik } from "formik";
import { logSchRef } from "../../js/firebase_init";
import { useState } from "react";

function ModalForDayStatus(props) {
  const dateStr = props.date.toLocaleDateString("FI-fi");
  const [check, onCheck] = useState(props.isWorkday);
  const formik = useFormik({
    initialValues: {
      status: "",
    },
    onSubmit: (values) => {
      handleDayStatus(values.status);
    },
  });
  const handleDayStatus = (status) => {
    // onSubmit: If the user want to change the Status
    update(child(logSchRef(props.shopId, props.empId), props.dateStamp + props.empId + "Sch"), {
      special_status: status,
      isWorkday: check,
    });
    props.onHide();
  };
  return (
    <div>
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5>Add status for day {dateStr}</h5>
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            <div>
              <h6>
                Employee: {props.empName}. Date: {dateStr}. Current status: {props.status}.
              </h6>
              <p>Enter this employee's new status in the field below. If this day is still considered as work day although they do not show up, check the box below.</p>
              <input className="text-center" id="status" name="status" type="text" onChange={formik.handleChange} value={formik.values.status} placeholder={props.status}></input>
              <br></br> <br></br>
              <label>
                <label>
                  <input type="checkbox" checked={check} onChange={() => onCheck(!check)} />
                  This person still receive workday.
                </label>
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={props.onHide}>Cancel</Button>
            <Button variant="danger" type="submit">
              Submit
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

export default ModalForDayStatus;
