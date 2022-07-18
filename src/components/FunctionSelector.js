import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../css/FunctionSelector.css";

function FunctionSelector() {
  const navigate = useNavigate();

  return (
    <div className="function-selector">
      <div className="button-wrap">
        <Button onClick={() => navigate("./message")}>Message</Button>
        <Button onClick={() => navigate("./report")}>Report</Button>
        <Button>CSV Management</Button>
        <Button onClick={() => navigate("./schedule")}>Schedule</Button>
        <Button>Employee Management</Button>
        <Button onClick={() => navigate("./extra")}>Extra Functionality</Button>
      </div>
    </div>
  );
}

export default FunctionSelector;
