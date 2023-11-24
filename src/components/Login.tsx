import { faKey } from "@fortawesome/free-solid-svg-icons/faKey";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { v4 as uuidv4 } from "uuid";
import { identifyUser } from "~/redux/features/user";
import { useAppDispatch } from "~/redux/hooks";

const Login = () => {
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const dispatch = useAppDispatch();

  const login = () => {
    dispatch(identifyUser({
      id: uuidv4(),
      avatar: avatar,
      name: name,
    }));
  };

  return (
    <Row>
      <Col
        xs={10} sm={8} md={6} lg={4}
        className="mx-auto d-flex flex-column align-items-center gap-3"
      >
        <div className="" style={{ width: "8rem", height: "8rem" }}>
          <img
            src={avatar || "./login-avatar-placeholder.svg"}
            alt="login-avatar"
            className="rounded-circle w-100 h-100 object-fit-cover"
          />
        </div>
        <Form.Control
          type="text"
          value={avatar}
          onChange={e => setAvatar(e.target.value)}
          placeholder="Avatar"
        />
        <Form.Control
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
        />
        <div className="d-grid w-100 gap-3">
          <Button
            variant="primary"
            onClick={login}
          >
            <FontAwesomeIcon icon={faKey} size="lg" className="fa-fw" />
            <span className="ms-2 me-4">Login</span>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
