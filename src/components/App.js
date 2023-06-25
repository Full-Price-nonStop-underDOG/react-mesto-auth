import React, { useState, useEffect, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  navigate,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Header from "../components/Header.js";
import Main from "../components/Main.js";
import Footer from "../components/Footer.js";
import PopupWithForm from "./PopupWithForm.js";
import api from "../utils/Api.js";
import ImagePopup from "./ImagePopup.js";
import CurrentUserContext from "../contexts/CurrentUserContext.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import Register from "./Register.js";
import ProtectedRouteElement from "./ProtectedRoute.js";
import Login from "./Login.js";
import authenticationApi from "../utils/AuthenticationApi.js";
import InfoToolTip from "./InfoTooltip.js";

export function App() {
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = React.useState("");

  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  const [currentUser, setCurrentUser] = useState({});
  const [isLuck, setIsLuck] = React.useState(false);
  const [isInfoToolTipPopupOpen, setInfoToolTipPopupOpen] =
    React.useState(false);

  useEffect(() => {
    setIsLoading(true); // Устанавливаем состояние загрузки в true перед отправкой запроса
    Promise.all([api.getUserInfo(), api.getInitialCardsData()])
      .then(([userData, cardsData]) => {
        setCurrentUser(userData);
        setCards(cardsData);
        setIsLoading(false); // Устанавливаем состояние загрузки в false после получения данных
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false); // Устанавливаем состояние загрузки в false в случае ошибки
      });
  }, []);

  React.useEffect(() => {
    const checkToken = async () => {
      const jwt = localStorage.getItem("jwt");

      if (jwt) {
        try {
          const res = await authenticationApi.checkToken(jwt);
          setIsLoggedIn(true);
          setEmail(res.data.email);
          Navigate("/", { replace: true });
        } catch (err) {
          if (err.status === 401) {
            console.log("401 — токен не передан");
          }
          console.log("401 — токен некорректен");
        }
      }
    };

    checkToken();
  }, [Navigate]);

  function handleSignOut() {
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    Navigate("/sign-in", { replace: true });
  }

  async function loginSubmit(email, password) {
    try {
      const res = await authenticationApi.login(email, password);
      localStorage.setItem("jwt", res.token);
      setIsLoggedIn(true);
      setEmail(email);
      Navigate("/", { replace: true });
    } catch (err) {
      if (err.status === 400) {
        console.log("400 - не передано одно из полей");
      } else if (err.status === 401) {
        console.log("401 - пользователя с данным email не сущетсвует");
      }
    }
  }

  async function registerSubmit(email, password) {
    try {
      await authenticationApi.register(email, password);
      setInfoToolTipPopupOpen(true);
      setIsLuck(true);
      Navigate("/sign-in", { replace: true });
    } catch (err) {
      if (err.status === 400) {
        console.log("400 - поле заполненно некорректно");
      }
      setInfoToolTipPopupOpen(true);
      setIsLuck(false);
    }
  }

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    // Отправляем запрос в API и получаем обновлённые данные карточки
    if (isLiked) {
      api
        .removeLike(card._id)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === card._id ? newCard : c))
          );
        })
        .catch((error) => {
          // Обработка ошибки при удалении лайка
          console.error("Error removing like:", error);
        });
    } else {
      api
        .addLike(card._id)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === card._id ? newCard : c))
          );
        })
        .catch((error) => {
          // Обработка ошибки при добавлении лайка
          console.error("Error adding like:", error);
        });
    }
  }

  function handleCardDelete(card) {
    api
      .removeCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c._id !== card._id));
      })
      .catch((error) => {
        console.log("Ошибка при удалении карточки:", error);
      });
  }

  function handleUpdateUser(userData) {
    setIsLoading(true); // Устанавливаем состояние загрузки в true перед отправкой запроса
    api
      .editProfileInfo(userData)
      .then((updatedUser) => {
        setCurrentUser(updatedUser);
        closeAllPopups();
        setIsLoading(false); // Устанавливаем состояние загрузки в false после получения ответа
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false); // Устанавливаем состояние загрузки в false в случае ошибки
      });
  }

  function handleUpdateAvatar(newAvatar) {
    setIsLoading(true); // Устанавливаем состояние загрузки в true перед отправкой запроса
    api
      .updateProfileUserAvatar(newAvatar)
      .then((updatedUser) => {
        setCurrentUser(updatedUser);
        closeAllPopups();
        setIsLoading(false); // Устанавливаем состояние загрузки в false после получения ответа
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false); // Устанавливаем состояние загрузки в false в случае ошибки
      });
  }

  function handleAddPlaceSubmit(newCard, setError) {
    setIsLoading(true); // Set loading state to true before sending the request
    api
      .addNewCard(newCard)
      .then((addedCard) => {
        setCards([addedCard, ...cards]);
        closeAllPopups();
        setIsLoading(false); // Set loading state to false after receiving the response
      })
      .catch((error) => {
        console.log("Error adding card:", error);
        setError("Имя карточки слишком длинное."); // Set the error message
        setIsLoading(false); // Set loading state to false in case of an error
      });
  }

  const handleEditAvatarClick = (event) => {
    setEditAvatarPopupOpen(true);
  };

  const handleEditProfileClick = (event) => {
    setEditProfilePopupOpen(true);
  };

  const handleAddPlaceClick = (event) => {
    setAddPlacePopupOpen(true);
  };

  const closeAllPopups = (event) => {
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setInfoToolTipPopupOpen(false);
    setSelectedCard(null);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  useEffect(() => {
    api
      .getUserInfo()
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    api
      .getInitialCardsData()
      .then((data) => {
        setCards(data);
      })
      .catch((error) => {
        console.log("Ошибка при загрузке карточек:", error);
      });
  }, []);

  return (
    <CurrentUserContext.Provider value={currentUser || ""}>
      <div className="page">
        <BrowserRouter>
          <Header
            email={email}
            onSignOut={handleSignOut}
            isLoggedIn={isLoggedIn}
          />

          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <ProtectedRouteElement
                    element={Main}
                    isLoggedIn={isLoggedIn}
                    onEditAvatar={handleEditAvatarClick}
                    onEditProfile={handleEditProfileClick}
                    onAddPlace={handleAddPlaceClick}
                    cards={cards}
                    onCardClick={handleCardClick}
                    CurrentUserContext={currentUser}
                    handleCardLike={handleCardLike}
                    onCardDelete={handleCardDelete}
                  />
                ) : (
                  <Navigate to="sign-in" />
                )
              }
            />

            <Route
              path="/sign-up"
              element={<Register onRegistration={registerSubmit} replace />}
            />
            <Route
              path="/sign-in"
              element={<Login onLogin={loginSubmit} replace />}
            />
          </Routes>
        </BrowserRouter>
        {isLoggedIn && <Footer />}

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
          isLoading={isLoading}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
          isLoading={isLoading}
        ></AddPlacePopup>

        <div className="popup popup_type_confirmation">
          <div className="popup__container">
            <button type="button" className="popup__close"></button>
            <form className="popup__form">
              <h2 className="popup__title">Вы уверены?</h2>
              <button type="submit" className="popup__submit">
                Да
              </button>
            </form>
          </div>
        </div>
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
          isLoading={isLoading}
        ></EditAvatarPopup>
        {selectedCard && (
          <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        )}
        <InfoToolTip
          isLuck={isLuck}
          isOpen={isInfoToolTipPopupOpen}
          onClose={closeAllPopups}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
