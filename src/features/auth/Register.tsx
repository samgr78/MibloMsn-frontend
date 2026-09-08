import Input from "../../shared/components/Input.tsx";
import './auth.css';

function Register() {
    return (
        <>
            <h1>Register</h1>

            <Input
                type={"text"}
                className={"input"}
                name={"email"}
                label={"Email"}
            />

        </>
    )
}

export default Register