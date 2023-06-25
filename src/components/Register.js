import React, { useState, useEffect, useRef } from "react";
import AuthenticationForm from "./AuthenticationForm";
import { useNavigate } from "react-router-dom";

function Register(props) {
  const navigate = useNavigate();
  const [isRegistrationSuccessful, setRegistrationSuccessful] = useState(false);

  async function handleSubmit(email, password) {
    try {
      await props.onRegistration(email, password);
      setRegistrationSuccessful(true);
    } catch (error) {
      setRegistrationSuccessful(false);
    }
  }

  // Переход на страницу sign-in только при успешной регистрации
  if (isRegistrationSuccessful) {
    navigate("/sign-in");
  }

  return (
    <AuthenticationForm
      title="Регистрация"
      buttonText="Зарегистрироваться"
      onSubmit={handleSubmit}
    />
  );
}

export default Register;
