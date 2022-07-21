import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/FunctionSelector.css";
import MessageModalForEmployee from "./message-components/MessageModalForEmployee";
import MessageModalForEmployer from "./message-components/MessageModalForEmployer";


function FunctionSelector() {
  const navigate = useNavigate();

  const user = sessionStorage.getItem("user");
  const [addMessShow, setAddMessShow] = useState(false);

  return (
    <div className="function-selector">
      {user === "employer" ? (
        <div className="button-wrap">
          <Button onClick={() => setAddMessShow(true)}>Message</Button>
          <Button title="See employee's login and logout time." onClick={() => navigate("./report")}>
            Report
          </Button>
          <Button>CSV Management</Button>
          <Button title="Employee's work schedule" onClick={() => navigate("./schedule")}>
            Schedule
          </Button>
          <Button title="Add more people to the shop, or change their group, etc.">Employee Management</Button>
          <Button onClick={() => navigate("./extra")}>Extra Functionality</Button>
          {addMessShow && <MessageModalForEmployer show={addMessShow} onHide={() => setAddMessShow(false)} /> }
        </div>
      ) : (
        <div className="button-wrap">
          <Button onClick={() => setAddMessShow(true)}>Message</Button>
          <Button title="Employee's work schedule" onClick={() => navigate("./schedule")}>
            Schedule
          </Button>
          <Button onClick={() => navigate("./extra")}>Extra Functionality</Button>
          { addMessShow && <MessageModalForEmployee show={addMessShow} onHide={() => setAddMessShow(false)} />}
        </div>
      )}
    </div>
  );
}

export default FunctionSelector;
