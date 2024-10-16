/* NAVBAR */
var prevScrollpos = window.scrollY;
window.onscroll = function() {
    var currentScrollPos = window.scrollY;
    if (prevScrollpos > currentScrollPos) {
      document.getElementById("navbar").style.top = "0";
    } else {
      document.getElementById("navbar").style.top = "-7vh";
    }
    prevScrollpos = currentScrollPos;
  } 


/* TYPEBAR */
const texts = [
  "Welcome to my homepage !",
  "Current Blog: *PLACEHOLDER*",
  "Current Project: C++ Chess Engine",
  "Enjoy your day !"
];

let textIndex = 0;
let charIndex = 0;

function getRandomSpeed(min, max) {
  return Math.random() * (max - min) + min;
}
function typeText() {
  const Element = document.getElementById("typed-text");
  const currentText = texts[textIndex];
  if (charIndex < currentText.length) {
    Element.innerHTML += currentText.charAt(charIndex); 
    charIndex++;
    setTimeout(typeText, getRandomSpeed(100, 250)); 
  } else {
    setTimeout(deleteText, 1000); 
  }
}
function deleteText() {
  const Element = document.getElementById("typed-text");
  const currentText = texts[textIndex];

  if (charIndex > 0) {
    Element.innerHTML = currentText.substring(0, charIndex - 1);
    charIndex--;
    setTimeout(deleteText, getRandomSpeed(50, 125));
  } else {
    textIndex = (textIndex + 1) % texts.length; 
    setTimeout(typeText, 150);
  }
}
window.onload = function() {
  setTimeout(typeText, 500);
}