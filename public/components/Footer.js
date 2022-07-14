import '../css/Footer.css';
import logo from '../img/logo_1.png';

function Footer(){
    const logoStyle = {
        position: "fixed",    
        bottom: 0,
        left: 0,
        width: "75%",
        height: "11%",
        display: "block",
        textAlign: "left",
        padding: "15px",
    }
    return (
        <span id="footer" style={logoStyle}><img id="logo-img" src={logo} alt="Logo"></img></span>
    )
}

export default Footer;