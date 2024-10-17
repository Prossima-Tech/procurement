import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div>
            <h2>Unauthorized Access</h2>
            <p>You do not have permission to access this page.</p>
            <Link to="/">Return to Login</Link>
        </div>
    );
};

export default Unauthorized;