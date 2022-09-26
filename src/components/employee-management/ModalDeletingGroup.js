import { child, onValue, remove, update } from "firebase/database";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { empRef } from "../../js/firebase_init";

function ModalDeletingGroup(props) {
  const [status, setStatus] = useState("");
  const { t } = useTranslation("translation", { keyPrefix: "employee" });
  const formik = useFormik({
    initialValues: {
      groupName: "",
    },
    onSubmit: (values) => {
      handleGroupName(values.groupName);
    },
  });

  const handleGroupDelete = () => {
    const groupId = props.groupId;
    const shopId = props.shopId;

    onValue(
      child(empRef(shopId), groupId),
      (snap) => {
        let val = snap.val();
        if ("employees" in val) setStatus(<Trans i18nKey={"employee.Error Not Empty"}>Group {{ groupname: props.groupName }} is not empty.</Trans>);
        else {
          remove(child(empRef(shopId), groupId));
          props.onHide();
          props.resetChosen();
        }
      },
      { onlyOnce: true }
    );
  };

  function handleGroupName(name) {
    update(child(empRef(props.shopId), props.groupId), { name: name });
    props.onHide();
    props.resetChosen();
  }

  useEffect(() => {
    console.log(props);
  }, [props]);

  return (
    <Modal className="inv" show={props.show} onHide={props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <Trans i18nKey={"employee.Manage Title"}>Manage {{ group: props.groupName }} group</Trans>
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit}>
        <Modal.Body>
          <p>
            <Trans i18nKey={"employee.Group Delete Warning"}>
              If you want to delete this group, make sure that every employees in this group are deleted. Press Delete only when you have deleted everyone in group <b>{{ group: props.groupName }}</b>.
            </Trans>
          </p>
          <p>{t("Otherwise you can change the group's name by typing the new one and press Change Name.")}</p>
          <input className="employees form-control" id="groupName" name="groupName" type="text" onChange={formik.handleChange} value={formik.values.groupName} placeholder={props.groupName}></input>
          <small className="text-danger">{status}</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>
            {t("Close")}
          </Button>
          <Button variant="danger" onClick={() => handleGroupDelete()}>
            {t("Delete")}
          </Button>
          <Button type="submit">{t("Change Name")}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalDeletingGroup;
