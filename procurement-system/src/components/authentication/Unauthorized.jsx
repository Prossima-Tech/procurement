import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';

const Unauthorized = () => {
    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={
                <Link to="/">
                    <Button type="primary">Return to Login</Button>
                </Link>
            }
        />
    );
};

export default Unauthorized;