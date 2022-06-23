import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom"
import '../css/FunctionSelector.css'

function FunctionSelector () {
    const navigate = useNavigate();
    const goToMessage = () => {
        navigate("./message")
    }
    return (
        <div className="function-selector">
            <Button onClick={() => goToMessage()}>Message</Button>
            <Button>Report</Button>
            <Button>CSV Management</Button>
            <Button>Schedule</Button>
            <Button>Employee Management</Button>
            <Button>Placeholder Function</Button>
        </div>
    )
}

export default FunctionSelector;