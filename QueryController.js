const currentSet = JSON.parse(localStorage.getItem("currentSet"));
if (!currentSet) location.href = "index.html";

const questions = currentSet.questions.slice();
ShuffleArray(questions);
questions.forEach(q => ShuffleArray(q.answers));

let index = 0, correct = 0;
const usesMC = localStorage.getItem("UsesMultipleChoice") === "true";
const lang = localStorage.getItem("Language") || "German";
const el = id => document.getElementById(id);
const correctSound = el("correctSound");
const incorrectSound = el("incorrectSound");
const soundEnabled = localStorage.getItem("AreSoundEffectsOn") === "true";

const i18n = {
  German: {
    placeholder: "Antwort eingeben...", confirm: "Antwort bestätigen", next: "Weiter",
    correct: "Richtig!", incorrect: "Falsch!", alert: "Bitte eine Antwort wählen",
    summaryTitle: "Ergebnisse", summaryText: (c,t) => `Du hast ${c} von ${t} Fragen richtig.`,
    finish: "Beenden"
  },
  English: {
    placeholder: "Enter answer...", confirm: "Confirm", next: "Next",
    correct: "Correct!", incorrect: "Incorrect!", alert: "Please select an answer",
    summaryTitle: "Results", summaryText: (c,t) => `You got ${c} of ${t} correct.`,
    finish: "Finish"
  }
}[lang];

el("submitBtn").innerText = i18n.confirm;
el("freeTextAnswer").placeholder = i18n.placeholder;
el("summaryTitle").innerText = i18n.summaryTitle;
el("finishBtn").innerText = i18n.finish;

el("submitBtn").onclick = () => {
  const q = questions[index];
  let isCorrect = false;
  let correctAnswerText = q.answers.find(a => a.IsCorrect)?.AnswerText || "";

  if (usesMC) {
    const selected = document.querySelector(".answer-btn.active");
    if (!selected) return alert(i18n.alert);
    isCorrect = selected.dataset.correct === "1";
    document.querySelectorAll(".answer-btn").forEach(btn => {
      const correct = btn.dataset.correct === "1";
      if (correct) btn.classList.add("correct");
      if (!correct && btn.classList.contains("active")) btn.classList.add("incorrect");
      btn.disabled = true;
    });
  } else {
    const input = el("freeTextAnswer").value.trim().toLowerCase();
    isCorrect = input === correctAnswerText.trim().toLowerCase();
    el("freeTextAnswer").classList.add(isCorrect ? "is-valid" : "is-invalid");
  }

  el("feedback").className = "alert mt-3 " + (isCorrect ? "alert-success" : "alert-danger");
  el("feedback").textContent = isCorrect
    ? i18n.correct
    : `${i18n.incorrect} – ${lang === "German" ? "Richtig wäre:" : "Correct answer:"} "${correctAnswerText}"`;
  el("feedback").classList.remove("d-none");

  if (isCorrect) {
  if (soundEnabled) {
    correctSound.currentTime = 0;
    correctSound.play();
  }
  correct++;
} else {
  if (soundEnabled) {
    incorrectSound.currentTime = 0;
    incorrectSound.play();
  }
}
  el("submitBtn").style.display = "none";
  el("nextBtn").style.display = "inline-block";
};

el("nextBtn").onclick = () => {
  index++;
  ShowQuestion();
};

el("finishBtn").onclick = () => {
  fetch("https://deacrow.com/submitSet.php", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserID: localStorage.getItem("UserID"),
      SetID: currentSet.set.SetID,
      SetMaxQuestions: questions.length,
      SetCorrectAnswers: correct,
      SetCompleted: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  }).then(() => {
    localStorage.removeItem("currentSet");
    location.href = "index.html";
  });
};

ShowQuestion();

function ShowQuestion() {
  if (index >= questions.length) return ShowSummary();
  const q = questions[index];
  el("setName").innerText = currentSet.set.SetName;
  el("questionText").innerText = q.QuestionText;

  el("questionImage").src = q.QuestionImage;

  el("feedback").classList.add("d-none");
  el("nextBtn").style.display = "d-none";
  el("submitBtn").style.display = "block";

  el("answerContainer").innerHTML = "";
  el("freeTextAnswer").classList.add("d-none");

  if (usesMC) {
    q.answers.forEach(a => {
      const col = document.createElement("div");
      col.className = "set-col col-6 col-sm-6 col-md-4 col-lg-3 p-2";
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary answer-btn w-100";
      btn.textContent = a.AnswerText;
      btn.dataset.correct = a.IsCorrect;
      btn.onclick = () => {
        document.querySelectorAll(".answer-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      };
      col.appendChild(btn);
      el("answerContainer").appendChild(col);
    });
  } else {
    el("freeTextAnswer").value = "";
    el("freeTextAnswer").classList.remove("d-none", "is-valid", "is-invalid");
  }
}

function ShowSummary() {
  el("summaryText").innerText = i18n.summaryText(correct, questions.length);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("summaryModal")).show();
}

function ShuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
