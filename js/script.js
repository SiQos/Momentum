"use strict";

// ========================================= IMPORT =============================================

import playList from './playList.js';

// ========================================= VARS ===============================================

const name = document.querySelector(".name");
const time = document.querySelector(".time");
const date = document.querySelector(".date");
const city = document.querySelector(".weather__city");
const temp = document.querySelector(".weather__temp");
const weatherDescription = document.querySelector(".weather__description");
const wind = document.querySelector(".weather__wind");
const humid = document.querySelector(".weather__humid");
const weatherIcon = document.querySelector(".weather__icon");
const body = document.getElementsByTagName("body");
const prevButton = document.querySelector('.slider-arrow__prev');
const nextButton = document.querySelector('.slider-arrow__next');
const resetButton = document.querySelector(".footer__reset");
const quoteBlock = document.querySelector(".quotes__quote");
const authorQuote = document.querySelector(".quotes__author")
const playBtn = document.querySelector(".audio__play");
const prevBtn = document.querySelector(".audio__prev");
const nextBtn = document.querySelector(".audio__next");
const audioRange = document.querySelector(".audio__range");
const audioName = document.querySelector(".audio__name");
const audioCurrentTime = document.querySelector(".audio__currentTime");
const audioDurationTime = document.querySelector(".audio__durationTime");
const audioVolume = document.querySelector(".audio__volume-slider");
const audioButton = document.querySelector(".audio__volume-icon");
const settingsIcon = document.querySelector(".footer__icon");
const langContainer = document.querySelector(".settings__language");

// ===================================== OPTIONS ================================================

let currentLang = 'en';
let activeLang = null;

const translationWeather = {
  'en': ["Wind speed", "Humidity"],
  'ru': ["Скорость ветра", "Влажность"],
}

const translation = {
  'en': ["Good night", "Good morning", "Good afternoon", "Good evening"],
  'ru': ["Доброй ночи", "Доброе утро", "Добрый день", "Добрый вечер"],
}

const state = {
  language: ['en', 'ru'],
  photoSource: ['unsplash', 'github'],
  blocks: ['audio', 'time', 'weather', 'greetings', 'date', 'quotes'],
}


// ===================================== LOCAL STORAGE ==========================================

function setLocalStorage() {
  localStorage.setItem("name", name.value);
}

function getLocalStorage() {
  const nameFromLS = localStorage.getItem("name");

  if (localStorage.getItem('name')) {
    name.value = nameFromLS;
  }
}

window.addEventListener('beforeunload', setLocalStorage);
window.addEventListener("load", getLocalStorage);

// ========================================= TIME ===============================================

let timeRun = setTimeout(function tick() {
  let date = new Date().toLocaleTimeString();

  time.textContent = date;

  timeRun = setTimeout(tick, 1000);
}, 1000);

// ========================================= DATE ================================================

function datePrint(date) {

  let options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  }

  let currentDate = new Date().toLocaleDateString(currentLang, options);
  date.textContent = currentDate;
}

datePrint(date);

// ======================================= GREETINGS ==============================================

let num = Math.floor(new Date().getHours() / 6);

function printGreeting() {
  const greetingText = document.querySelector(".greetings__text");

  greetingText.textContent = `${translation[currentLang][num]}`;
}

printGreeting();

// ===================================================== WEATHER ========================================================

function setCity() {
  localStorage.setItem('city', city.value);
}

window.addEventListener('beforeunload', setCity);

function getCity() {
  let cityLS = localStorage.getItem('city');

  if (localStorage.getItem('city')) {
    city.value = cityLS;
  }
}

window.addEventListener('load', getCity);

async function getWeather() {

  if (!city.value) {
    city.value = 'Минск';
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.value}&lang=${currentLang}&appid=a2442a4da31b48da04bbfff6270dbbd1&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  city.textContent = city.value;
  weatherIcon.classList.add(`owf-${data.weather[0].id}`);
  temp.textContent = `${data.main.temp.toFixed(0)}°C`;
  weatherDescription.textContent = data.weather[0].description;
  wind.textContent = `${translationWeather[currentLang][0]}: ${data.wind.speed.toFixed(0)} m/s`;
  humid.textContent = `${translationWeather[currentLang][1]}: ${data.main.humidity}%`;

  localStorage.setItem("city", city.value);
}

city.addEventListener("keypress", function (e) {
  if (e.code === "Enter") {
    getWeather();
    city.blur();
  }
});

window.addEventListener('load', getWeather);

// ====================================================== SLIDER ==========================================================

let bgNum;

function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return bgNum = Math.floor(Math.random() * (max - min + 1)) + min;
}

getRandomArbitrary(1, 20);


async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}

async function setBg() {
  try {
    const url = `https://api.unsplash.com/photos/random?query=${translation.en[num]}&client_id=1toqd0qqPFGmwGcveN3zQhxyHlRfaDcap-L5jgrMBzE`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Fetch failed with status: ${res.status}`);
    }
    const data = await res.json();
    const img = await loadImage(data.urls.raw);
    document.body.style.backgroundImage = `url(${img.src})`;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

setBg();

function prevSlider() {
  setBg();
}

function nextSlider() {
  setBg();
}

prevButton.addEventListener("click", prevSlider);
nextButton.addEventListener("click", nextSlider);


// =========================================================== QUOTES ==========================================================

async function getQuotes() {
  let quotes = "/json/quotes.json";
  let res = await fetch(quotes);
  let data = await res.json();

  let quoteNum = getRandomArbitrary(0, data.length - 1);

  quoteBlock.textContent = data[quoteNum].quote;
  authorQuote.textContent = data[quoteNum].author;
}

getQuotes();

resetButton.addEventListener("click", getQuotes);


// ========================================================== AUDIO =============================================================

const audio = new Audio();
let isPlay = false;
let playNum = 0;
let currentTrackElement = null;

audio.src = playList[playNum].src;
audioName.textContent = playList[playNum].title;

function getTrackList() {
  const audioList = document.querySelector(".audio__track-list");

  playList.forEach((el) => {
    let li = document.createElement("li");
    audioList.append(li);
    li.classList.add("audio__track");
    li.textContent = el.title;
  })
}

getTrackList();

function playAudio() {
  if (!isPlay) {
    audio.play();
    isPlay = true;
    playBtn.classList.add("pause");

    if (currentTrackElement) {
      currentTrackElement.style.color = '#FFFF';
    }

    currentTrackElement = document.querySelectorAll('.audio__track')[playNum];
    currentTrackElement.style.color = '#ff7f50';
  } else {
    audio.pause();
    playBtn.classList.remove("pause");
    isPlay = false;
  }
}

playBtn.addEventListener('click', playAudio);

audio.addEventListener('ended', playNext);

function playPrev() {
  playNum--;

  if (playNum < 0) {
    playNum = 3;
  }

  audio.src = playList[playNum].src;
  audioName.textContent = playList[playNum].title;

  isPlay = false;
  playAudio();
}

function playNext() {
  playNum++;

  if (playNum > 3) {
    playNum = 0;
  }

  audio.src = playList[playNum].src;
  audioName.textContent = playList[playNum].title;

  isPlay = false;
  playAudio();
}

prevBtn.addEventListener('click', playPrev);
nextBtn.addEventListener('click', playNext);



function updateProgressBar() {
  audioRange.max = audio.duration;
  audioRange.value = audio.currentTime;

  audioCurrentTime.textContent = (formatTime(Math.floor(audio.currentTime)));

  if (audioDurationTime.textContent === "NaN:NaN") {
    audioDurationTime.textContent = "00:00";
  } else {
    audioDurationTime.textContent = (formatTime(Math.floor(audio.duration)));
  }
}



function formatTime(seconds) {
  let min = Math.floor((seconds / 60));
  let sec = Math.floor(seconds - (min * 60));
  if (sec < 10) {
    sec = `0${sec}`;
  };
  return `${min}:${sec}`;
};

setInterval(updateProgressBar, 500);


function changeProgressBar() {
  audio.currentTime = audioRange.value;
};

audioRange.addEventListener("change", changeProgressBar);

audioVolume.addEventListener('click', (e) => {
  const sliderWidth = window.getComputedStyle(audioVolume).width;
  const newVolume = e.offsetX / parseInt(sliderWidth);

  audio.volume = newVolume;
  document.querySelector('.audio__percentage').style.width = newVolume * 100 + "%";

  if (newVolume >= 0.8) {
    audioButton.style.backgroundImage = "url('../assets/svg/volume-max-svgrepo-com.svg')";
  }
  if (newVolume < 0.8) {
    audioButton.style.backgroundImage = "url('../assets/svg/volume-min-svgrepo-com.svg')";
  }
  if (newVolume == 0) {
    audioButton.style.backgroundImage = "url('../assets/svg/volume-xmark-svgrepo-com.svg')";
  }

}, false);

// =========================================================== SETTINGS =======================================================

let arrBlocks = [];

function openSettings() {
  document.querySelector('.footer__settings').classList.toggle('_open');
  document.querySelector('.settings__wrapper').classList.toggle('_open');
  document.querySelector('.footer__icon').classList.toggle('_active');
}

settingsIcon.addEventListener('click', openSettings);


function addBlocks() {
  state.blocks.forEach((el) => {
    arrBlocks.push(document.getElementById(`${el}`))
  })
}

addBlocks();

function disableBlock() {
  arrBlocks.forEach((el) => {
    el.addEventListener('change', function (e) {
      if (el.checked) {
        document.querySelector(`.${el.className.slice(6)}`).style.opacity = '0';
      } else {
        document.querySelector(`.${el.className.slice(6)}`).style.opacity = '1';
      }
    })
  })
}
disableBlock();



// =============================================================== LANGUAGE ======================================================

function getLanguage() {

  state.language.forEach((el) => {
    let btn = document.createElement('button');

    btn.classList.add(`settings__lang`);
    btn.classList.add(`${el}`);
    btn.textContent = el;

    langContainer.append(btn);
  })

}

getLanguage();

function selectLang() {

  document.querySelectorAll('.settings__lang').forEach((el) => {
    el.addEventListener('click', (e) => {

      if (activeLang) {
        activeLang.style.backgroundColor = 'transparent';
        activeLang.style.color = "#000000";
        activeLang = null;
        currentLang = null;
      }

      let currentBtn = e.currentTarget;
      activeLang = currentBtn;

      currentLang = el.textContent;
      currentBtn.style.backgroundColor = "#bdecaa";
      currentBtn.style.transition = "all 0.3s ease 0s";
      currentBtn.style.color = "white";

      console.log(currentLang);

      getWeather();
      printGreeting();
      datePrint(date);
    })
  })
}

selectLang();


window.addEventListener('DOMContentLoaded', (e) => {
  currentLang = 'en';
  activeLang = document.querySelector('.en');
  activeLang.style.backgroundColor = "#bdecaa";
  activeLang.style.color = "white";
});