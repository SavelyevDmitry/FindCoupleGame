(() => {
  const OPEN_FIRST_CARD_TIME_MS = 2000;
  const OPEN_SECOND_CARD_TIME_MS = 700;
  const OPEN_SAME_CARDS_TIME_MS = 400;
  const GAME_TIME_MS = 60000;

  let timeLeft = GAME_TIME_MS / 1000;
  let valueToWin = null;
  let numberOfPairs = 0;

  const app = document.querySelector('.cards-game-app');
  const container = document.querySelector('.container');

  const root = document.querySelector(':root');  

  let timerInterval = null;

  let firstCard = null;
  let firstCardNumber = null;
  let firstCardTimeout = null;

  let secondCard = null;
  let secondCardNumber = null;
  let secondCardTimeout = null;

  let openSameCardsTimeout = null;

  // Обновление таймера
  function timeUpdate(gameTimer) {
    timeLeft--;
    gameTimer.textContent = timeLeft;
    
    if(timeLeft === 0) {
      clearInterval(timerInterval);
      app.classList.add('stop-game');

      gameFinish(false);
    }
  }

  // Окончаение игры
  function gameFinish(result) {
    const gameFinish = document.createElement('p');
    gameFinish.classList.add('cards-game__finish')
    container.append(gameFinish);

    if (result) {
      gameFinish.textContent = 'Вы выиграли';
      gameFinish.classList.add('cards-game__finish--win'); 
    } else {
      gameFinish.textContent = 'Вы проиграли';
      gameFinish.classList.add('cards-game__finish--lose'); 
    }

    const gameRestart = document.createElement('p');
    gameRestart.classList.add('cards-game__restart');
    gameRestart.textContent = 'Для того, чтобы запустить игру еще раз, обновите страницу';
    container.append(gameRestart);

    app.classList.remove('display');
  }

  // Создание формы ввода размера игры
  function createCardGameForm() {
    const formWrapper = document.createElement('div');
    const formTitle = document.createElement('h1');
    const formDesc = document.createElement('p');

    const form = document.createElement('form');
    const input = document.createElement('input');
    const buttonWrapper = document.createElement('div');
    const button = document.createElement('button');

    formWrapper.classList.add('cards-game__form-wrap', 'display');

    formTitle.textContent = 'Добро пожаловать в игру "Найди пару"';
    formTitle.classList.add('cards-game__title');
    formDesc.textContent = 'Введите четный размер поля от 2 до 10 и нажмите на кнопку, у вас будет 1 минута';
    formDesc.classList.add('cards-game__desc');

    form.classList.add('cards-game__form');
    input.classList.add('cards-game__input');
    input.placeholder = 'Размер поля';
    button.classList.add('cards-game__button');
    button.textContent = 'Запустить игру';

    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    formWrapper.append(formTitle);
    formWrapper.append(formDesc);
    formWrapper.append(form);

    container.append(formWrapper);

    form.addEventListener('submit', e => {
      e.preventDefault();

      createNewCardsGame(parseInt(input.value));

      formWrapper.classList.remove('display');
      app.classList.add('display');
    })
  }

  // Создание новой игры
  function createNewCardsGame(size) {
    if(size < 2 || size > 10 || size%2) size = 4;

    valueToWin = size*size/2;

    const gameNumbersArr = createGameNumbersArr(size);
    console.log(gameNumbersArr);

    const gameTimerPar = document.createElement('p');
    const gameTimer = document.createElement('span');
    gameTimerPar.classList.add('cards-game__timer-wrap');
    gameTimer.classList.add('cards-game__timer');
    gameTimerPar.textContent = 'Осталось времени: ';
    gameTimer.textContent = timeLeft;
    gameTimerPar.append(gameTimer);

    timerInterval = setInterval(timeUpdate, 1000, gameTimer);

    root.style.setProperty('--field-size', size);
  
    for (let i = 0; i < size*size; i++) {
      const cardItem = createGameCard(gameNumbersArr[i]);

      app.append(cardItem.card);
    }
   
    container.append(gameTimerPar);
  };

  // Создание одной карты
  function createGameCard(number) {
    const card = document.createElement('div');
    card.classList.add('cards-game__item');

    const cardFront = document.createElement('div');
    const cardBack = document.createElement('div');

    cardFront.classList.add('cards-game__item-front');
    cardBack.classList.add('cards-game__item-back');
    cardFront.textContent = number;

    card.append(cardFront);
    card.append(cardBack);

    card.addEventListener('click', () => {
    
      // Если не открыта первая карта
      if (!firstCardNumber) {
        card.classList.add('active');

        firstCard = card;
        firstCardNumber = cardFront.textContent;

        firstCardTimeout = setTimeout( () => {
          card.classList.remove('active');
          firstCard = null;
          firstCardNumber = null;
          firstCardTimeout = null;
        }, OPEN_FIRST_CARD_TIME_MS);

        // Если открыта первая карта, но не открыта вторая
      } else if (!secondCardNumber) {
        card.classList.add('active');

        secondCard = card;
        secondCardNumber  = cardFront.textContent;

        if (secondCardNumber === firstCardNumber) {
          clearTimeout(firstCardTimeout);

          numberOfPairs++;
          if (numberOfPairs === valueToWin) {
            gameFinish(true);
            clearInterval(timerInterval);
          }

          openSameCardsTimeout = setTimeout( () => {
            firstCard.classList.add('opacity');
            secondCard.classList.add('opacity');
  
            firstCard = null;
            firstCardNumber = null;
            firstCardTimeout = null;
  
            secondCard = null;
            secondCardNumber = null;
            secondCardTimeout = null;

            openSameCardsTimeout = null;
          }, OPEN_SAME_CARDS_TIME_MS)
          
        } else {
          clearTimeout(firstCardTimeout);

          secondCardTimeout = setTimeout( () => {           
            firstCard.classList.remove('active');
            card.classList.remove('active');

            firstCard = null;
            firstCardNumber = null;
            firstCardTimeout = null;
            secondCard = null;
            secondCardNumber = null;
            secondCardTimeout = null;
          }, OPEN_SECOND_CARD_TIME_MS);
        }

        // Если уже открыты обе карточки
      } else  if (!openSameCardsTimeout) {

        clearTimeout(secondCardTimeout);
        firstCard.classList.remove('active');
        secondCard.classList.remove('active');

        card.classList.add('active');
        firstCard = card;
        firstCardNumber = cardFront.textContent;
        firstCardTimeout = setTimeout( () => {
          card.classList.remove('active');
          firstCard = null;
          firstCardNumber = null;
          firstCardTimeout = null;
        }, OPEN_FIRST_CARD_TIME_MS);
        secondCard = null;
        secondCardNumber = null;
        secondCardTimeout = null;
      }

    });

    return {
      card,
      cardFront,
      cardBack
    };
  }

  // Случайная сортировка массива
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  // Создание случайного массива чисел
  function createGameNumbersArr(gameSize) {
    let gameNumbersArr = [];

    for (let i = 1; i <= gameSize*gameSize/2; i++) {
      gameNumbersArr.push(i);
      gameNumbersArr.push(i);
    }
    return shuffle(gameNumbersArr);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // let size = parseInt(prompt('Введите размер поля')); 

    
    createCardGameForm();
    // createNewCardsGame(size);
  });
})();