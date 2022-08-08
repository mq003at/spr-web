import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/FunctionSelector.css";
import MessageModalForEmployee from "./message-components/MessageModalForEmployee";
import MessageModalForEmployer from "./message-components/MessageModalForEmployer";


function FunctionSelector(props) {
  const navigate = useNavigate();

  const user = props.user;
  const [addMessShow, setAddMessShow] = useState(false);

  return (
    <div className="function-selector">
      {user === "manager" ? (
        <div className="button-wrap">
          <Button onClick={() => setAddMessShow(true)}>Message</Button>
          <Button title="See employee's login and logout time." onClick={() => navigate("./report")}>
            Report
          </Button>
          <Button title="Calculate employees' number of workdays." onClick={() => navigate("./workday")}>Workday Report</Button>
          <Button title="Employee's work schedule" onClick={() => navigate("./schedule")}>
            Schedule
          </Button>
          <Button title="Todo List" onClick={() => navigate("./todo")}>
            Todo List
          </Button>
          <Button title="Add more people to the shop, or change their group, etc." onClick={() => navigate("./employees")}>Employee Management</Button>
          {addMessShow && <MessageModalForEmployer show={addMessShow} onHide={() => setAddMessShow(false)}/> }
        </div>
      ) : (
        <div className="button-wrap">
          <Button onClick={() => setAddMessShow(true)}>Message</Button>
          <Button title="Employee's work schedule" onClick={() => navigate("./schedule")}>
            Schedule
          </Button>
          { addMessShow && <MessageModalForEmployee show={addMessShow} onHide={() => setAddMessShow(false)}/>}
        </div>
      )}
    </div>
  );
}

export default FunctionSelector;
