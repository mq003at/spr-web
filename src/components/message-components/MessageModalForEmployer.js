import { Button, Modal } from "react-bootstrap";
import { useFormik } from "formik";
import { get, child, set } from "firebase/database";
import { messRef } from "../../js/firebase_init";
import { getDateData } from "../../js/tool_function";

function MessageModalForEmployer(props) {
  const shopId = sessionStorage.getItem("shop_id");

  const formik = useFormik({
    initialValues: {
      name: "",
      message: "",
    },
    onSubmit: (values) => {
      addMessage(shopId, values.name, values.message);
    },
  });

  function addMessage(shopId, name, message) {
    let today = getDateData();
    set(child(messRef(shopId), `${today.documentStamp}`), {
      date: today.date,
      message: message,
      name: name,
    });
  }
  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Send messages</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit} className="form-inline">
        <Modal.Body>
          <p>Send the message so that every employees can see when they check their schedule. Also, you can check the box below to send the message to all the managers instead.</p>

          <div class="form-outline mb-4">
            <input type="text" id="message-form-name" class="form-control" placeholder="Name (i.e. Tiina)"/>
          </div>

          <div class="form-outline mb-4">
            <input type="text" id="message-form-to" class="form-control" placeholder="Send to... (i.e. Tiina)"/>
          </div>

          <div class="form-outline mb-4">
            <textarea class="form-control" id="form4Example3" rows="4" placeholder="Message (i.e. Please clean the store tomorrow)"></textarea>
          </div>

          <div class="form-check d-flex justify-content-center mb-4">
            <input class="form-check-input me-2" type="checkbox" value="" id="form4Example4" checked />
            <label class="form-check-label" for="form4Example4">
              Send to managers?
            </label>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
          <Button>
            Send
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default MessageModalForEmployer;
