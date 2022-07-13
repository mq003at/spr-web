import { Modal, Button, CloseButton } from "react-bootstrap";
import { createContext, Fragment, useCallback, useContext, useEffect, useState } from "react";
import { dateHandler } from "../../js/tool_function";
import ReportByDate from "./ReportByDate";
import { child, equalTo, orderByChild, query, remove, get, set } from "firebase/database";
import { shopRef } from "../../js/firebase_init";
import { useFormik } from "formik";
import * as FaIcons from "react-icons/fa";

function ReportByPerson(props) {
  const shopId = sessionStorage.getItem("shop_id");
  const startDate = props.startDate;
  const endDate = props.endDate;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;

  const [dateRange, setDateRange] = useState([]);
  const [totalHour, setTotalHour] = useState();
  const [hourArr, setHourArr] = useState([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);
  const [dataForModal, setDataForModal] = useState([]);
  const [addRecordStatus, setAddRecordStatus] = useState("");

  // Formik
  const formik = useFormik({
    initialValues: {
      inStamp: "",
      outStamp: "",
    },
    onSubmit: (values) => {
      handleAddRecord(values.inStamp, values.outStamp);
    },
  });

  // Calculate total hour
  const addHour = useCallback((hour, index) => {
    console.log("receive", hour, index);
    setHourArr((oldHourArr) => {
      if (oldHourArr.length === index) return [...oldHourArr, hour];
      else {
        const newArr = oldHourArr.map((oldHour, oldIndex) => {
          if (oldIndex === index) return hour;
          else return oldHour;
        });
        return newArr;
      }
    });
  }, []);
  useEffect(() => {
    console.log("hourArr", hourArr);
    let total = 0;
    hourArr.forEach((hour) => {
      if (hour) total = total + hour;
    });
    setTotalHour(total);
  }, [hourArr]);

  // Generate array from startDate to endDate
  useEffect(() => {
    let tempArr = [];
    const start = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());
    let loop = new Date(start);
    tempArr.push(start);

    while (loop < end) {
      tempArr.push(loop);
      const newDate = loop.setDate(loop.getDate() + 1);
      loop = new Date(newDate);
    }

    setDateRange(tempArr.map((x) => x));
  }, [startDate, endDate]);

  // Modal's function to delete the records
  function modalFunction(id, dateStamp, date) {
    setDataForModal([id, dateStamp, date]);
    setShowDayModal(true);
  }
  function addRecordForThisDay(date) {
    setDataForModal([employeeID, date]);
    setAddRecordToDayModal(true);
  }

  // onSubmit: If the user really want to delete the record
  function handleDeleteDayFromModal() {
    let id = dataForModal[0];
    let dateStamp = dataForModal[1];
    const qDay = query(child(shopRef(shopId), `${id}/log_events/`), orderByChild("dateStamp"), equalTo(dateStamp));
    get(qDay).then((snap) => {
      let val = snap.val();
      console.log(val);
      if (val !== null) {
        Object.keys(val).forEach((key) => {
          console.log(key);
          remove(child(shopRef(shopId), `${id}/log_events/${key}`));
        });
      }
    });
    setDataForModal([]);
    setShowDayModal(false);
  }

  // onSubmit: adding more record to specific day
  function handleAddRecord(inStamp, outStamp) {
    const validTime = new RegExp("^(?:\((2[0-3]|[0-1][0-9])([0-5][0-9])([0-5][0-9]))|)$");

    if (!validTime.test(inStamp) || !validTime.test(outStamp)) setAddRecordStatus("Wrong format. Please double-check the time.");
    else {
      handleTimeStamp("in", inStamp);
      handleTimeStamp("out", outStamp);
    }
  }

  // onCancelAddRecord
  function cancelAddRecord() {
    setAddRecordToDayModal(false);
    setAddRecordStatus("");
  }

  // handleTimeStamp
  function handleTimeStamp(direction, time) {
    if (time && time.trim() !== "") {
      let dateStamp = dateHandler(dataForModal[1]).dateStamp;
      let timeStamp = dateStamp + time;
      console.log(time, dateStamp, timeStamp);

      set(child(shopRef(shopId), `${employeeID}/log_events/${timeStamp + employeeID}`), {
        dateStamp: dateStamp,
        direction: direction,
        timeStamp: timeStamp,
      });
    } 

    formik.resetForm();
    cancelAddRecord();
  }

  return (
    <Fragment>
      {dateRange.length > 0 &&
        dateRange.map((date, index) => (
          <tr key={"report-" + dateHandler(date).timeStamp} className="report table-section table-row">
            <td className="report table-section add-record-cell" width={"0.5%"} data-exclude={"true"}>
              <span className="report table-section date-cell add-record-part" onClick={() => addRecordForThisDay(date)}>
                <FaIcons.FaPlus title={"Click to add extra record for day " + date.toLocaleDateString("FI-fi")} />
              </span>
            </td>
            <td className="report table-section date-cell" width={"10.5%"}>
              <span className="report table-section date-cell date-part" onClick={() => modalFunction(employeeID, dateHandler(date).dateStamp, date.toLocaleDateString("FI-fi"))} title="Click to delete all records for this day">
                {date.toLocaleDateString("fi-FI")}
              </span>
            </td>
            <td className="report table-section time-stamp-cell">
              <ReportByDate shopId={shopId} date={date} employeeID={employeeID} position={index} addHour={addHour} addCsvLog={props.addCsvLog} />
            </td>
          </tr>
        ))}
      <tr className="report table-section table-row">
        <td display={"none"} data-exclude={"true"}></td>
        <td className="report table-section total-cell">
          <span title="Calculate total working hours of this employee">Total</span>
        </td>
        <td className="report table-section time-stamp-cell">{totalHour ? <span>{Math.round(totalHour * 100) / 100} hours.</span> : <span>0 hour.</span>}</td>
      </tr>

      {/* Bootstrap modal */}
      <tr className="empty">
        <td>
          <div>
            <Modal show={showDayModal} onHide={() => setShowDayModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>
                  <h5>Delete all records from day {dataForModal[2]}</h5>{" "}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h6>
                  WARNING: Employee {employeeName} will have their records for day {dataForModal[2]} deleted. Do you really want to proceed?
                </h6>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={() => setShowDayModal(false)}>Cancel</Button>
                <Button onClick={() => handleDeleteDayFromModal()}>Delete</Button>
              </Modal.Footer>
            </Modal>
            <Modal show={showAddRecordToDayModal} onHide={() => setAddRecordToDayModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>
                  <h5>Add records for {employeeName}</h5>{" "}
                </Modal.Title>
              </Modal.Header>
              <form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                  <h6>Input timestamp. You can leave one field blank if you just want to add only one log timestamp.</h6>
                  <table className="add-record table" align={"center"}>
                    <tbody>
                      <tr>
                        <th className="add-record table-head">Login:</th>
                        <th className="add-record table-head">Logout:</th>
                      </tr>
                    </tbody>

                    <tbody>
                      <tr>
                        <td>
                          <input id="inStamp" name="inStamp" type="text" onChange={formik.handleChange} value={formik.values.inStamp} placeholder="00:00:00"></input>
                          <div>
                            <small id="stampHelpBlock" className="form-text text-muted">
                              Date Format: HHMMSS
                            </small>
                          </div>
                        </td>
                        <td>
                          <input id="outStamp" name="outStamp" type="text" onChange={formik.handleChange} value={formik.values.outStamp} placeholder="23:59:59"></input>
                          <div>
                            {" "}
                            <small id="stampHelpBlock" className="form-text text-muted">
                              Date Format: HHMMSS
                            </small>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {addRecordStatus !== "" && <div className="invalid-feedback d-block">{addRecordStatus}</div>}
                </Modal.Body>
                <Modal.Footer>
                  <Button type="submit" id="record-submit">
                    Submit
                  </Button>
                  <Button onClick={() => cancelAddRecord()}>Cancel</Button>
                </Modal.Footer>
              </form>
            </Modal>
          </div>
        </td>
      </tr>
    </Fragment>
  );
}

export default ReportByPerson;
